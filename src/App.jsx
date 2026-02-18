import React, { useState, useEffect, useCallback } from 'react';
import { VOCABULARY } from './data/vocabulary';
import {
  ENGLISH_QUESTIONS,
  getRandomQuestions,
  generateExamSection,
  getQuestionsByType
} from './data/englishQuestions';
import { C, FONTS } from './styles/theme';
import Home from './features/Home';
import WelcomeScreen from './features/WelcomeScreen';
import StudySession from './features/study/StudySession';
import EnglishExamSession from './features/exam/EnglishExamSession';
import QuestionTypeSelector from './features/QuestionTypeSelector';
import Results from './features/Results';
import Stats from './features/Stats';
import Settings from './features/Settings';
import PomodoroTimer from './features/PomodoroTimer';
import LegalPages from './features/LegalPages';
import AccessibilityStatement from './features/AccessibilityStatement';
import UserWordsList from './features/UserWordsList';
import { recordDailyAccuracy } from './utils/dailyStats';

const App = () => {
  // Load saved session synchronously to prevent race conditions
  const getSavedSession = () => {
    try {
      const saved = localStorage.getItem('wm_active_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only restore if valid active session view
        if (parsed.view && ['study', 'english', 'exam'].includes(parsed.view)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse saved session:', e);
    }
    return null;
  };

  const savedSession = getSavedSession();

  // Check if this is a fresh app open (show welcome) or returning to existing session
  const shouldShowWelcome = () => {
    const lastVisit = localStorage.getItem('wm_last_visit_time');
    const now = Date.now();
    // Show welcome if no saved session AND (first time OR more than 30 min since last visit)
    if (!savedSession) {
      if (!lastVisit || (now - parseInt(lastVisit)) > 30 * 60 * 1000) {
        return true;
      }
    }
    return false;
  };

  // Views: welcome, home, study, english, englishSelect, exam, results, stats
  const [view, setView] = useState(savedSession?.view || (shouldShowWelcome() ? 'welcome' : 'home'));
  const [mode, setMode] = useState(savedSession?.mode || 'flash'); // flash, quiz, english, exam
  const [sessionType, setSessionType] = useState(savedSession?.sessionType || null); // For tracking what kind of session

  const [stats, setStats] = useState({});
  const [englishStats, setEnglishStats] = useState({}); // Separate stats for English questions

  const [session, setSession] = useState(savedSession?.session || []);
  const [englishSession, setEnglishSession] = useState(savedSession?.englishSession || []);
  const [sessionResults, setSessionResults] = useState({ correct: 0, incorrect: 0 });

  const [userWords, setUserWords] = useState([]); // Custom vocabulary list

  // Load user words
  useEffect(() => {
    const savedWords = localStorage.getItem('wm_user_words');
    if (savedWords) {
      try {
        setUserWords(JSON.parse(savedWords));
      } catch (e) {
        console.error('Failed to parse user words', e);
      }
    }
  }, []);

  const handleSaveWord = (word) => {
    if (!word || !word.trim()) return;

    setUserWords(prev => {
      // Avoid duplicates
      if (prev.some(w => w.text.toLowerCase() === word.toLowerCase())) {
        return prev;
      }
      const newWord = {
        id: Date.now(),
        text: word.trim(),
        date: Date.now(),
        translation: '' // Placeholder for future API translation feature
      };
      const newList = [newWord, ...prev];
      localStorage.setItem('wm_user_words', JSON.stringify(newList));
      return newList;
    });
  };

  const handleDeleteWord = (wordId) => {
    setUserWords(prev => {
      const newList = prev.filter(w => w.id !== wordId);
      localStorage.setItem('wm_user_words', JSON.stringify(newList));
      return newList;
    });
  };

  // Load stats from localStorage
  useEffect(() => {
    const s = localStorage.getItem('wm_stats');
    if (s) setStats(JSON.parse(s));

    const es = localStorage.getItem('wm_english_stats');
    if (es) setEnglishStats(JSON.parse(es));
  }, []);

  // Save session state whenever it changes
  useEffect(() => {
    if (view === 'study' || view === 'english' || view === 'exam') {
      const stateToSave = {
        view,
        mode,
        sessionType,
        session: session.length > 0 ? session : undefined,
        englishSession: englishSession.length > 0 ? englishSession : undefined
      };
      localStorage.setItem('wm_active_session', JSON.stringify(stateToSave));
    } else if (view === 'home' || view === 'results') {
      // Clear session when back home or finished
      localStorage.removeItem('wm_active_session');
      localStorage.removeItem('wm_english_progress'); // Clear sub-component progress too
      localStorage.removeItem('wm_vocab_progress');
    }
  }, [view, mode, sessionType, session, englishSession]);

  const saveStats = (newStats) => {
    setStats(newStats);
    localStorage.setItem('wm_stats', JSON.stringify(newStats));
  };

  const saveEnglishStats = (newStats) => {
    setEnglishStats(newStats);
    localStorage.setItem('wm_english_stats', JSON.stringify(newStats));
  };

  const calculatePriority = useCallback((wordId) => {
    const s = stats[wordId] || { correct: 0, incorrect: 0, level: 0 };
    return (s.incorrect * 3) - s.correct - (s.level * 2);
  }, [stats]);

  // Vocabulary session start - with randomization
  const startSession = (selectedMode, count = 10) => {
    setMode(selectedMode);
    setSessionType('vocabulary');

    // Get words with most errors first, then shuffle
    const sorted = [...VOCABULARY].sort((a, b) => calculatePriority(b.id) - calculatePriority(a.id));
    const topSlice = sorted.slice(0, Math.min(sorted.length, count * 3));
    // Shuffle the selection for variety
    const shuffled = topSlice.sort(() => Math.random() - 0.5);
    const selection = shuffled.slice(0, count);

    setSession(selection);
    setSessionResults({ correct: 0, incorrect: 0 });
    setView('study');
  };

  // Review failed vocabulary words
  const startFailedVocabReview = () => {
    setMode('flash');
    setSessionType('vocabulary');

    // Get words that have more incorrect than correct answers
    const failedWords = VOCABULARY.filter(word => {
      const s = stats[word.id];
      return s && s.incorrect > s.correct;
    });

    if (failedWords.length === 0) {
      // No failed words - start regular session
      startSession('flash', 10);
      return;
    }

    // Shuffle failed words
    const shuffled = [...failedWords].sort(() => Math.random() - 0.5);
    const selection = shuffled.slice(0, Math.min(20, shuffled.length));

    setSession(selection);
    setSessionResults({ correct: 0, incorrect: 0 });
    setView('study');
  };

  // English practice session start
  const startEnglishSession = (config) => {
    setMode('english');
    setSessionType('english');

    let questions;
    if (config.mode === 'exam') {
      // Full exam mode - use all questions from the selected exam
      questions = config.questions;
    } else if (config.type === 'mixed') {
      // Mixed practice
      questions = getRandomQuestions(config.count);
    } else {
      // Specific type practice
      const typeQuestions = getQuestionsByType(config.type);
      questions = typeQuestions.sort(() => Math.random() - 0.5).slice(0, config.count);
    }

    setEnglishSession(questions);
    setSessionResults({ correct: 0, incorrect: 0 });
    setView(config.mode === 'exam' ? 'exam' : 'english');
  };

  // Review failed English questions
  const startFailedEnglishReview = () => {
    setMode('english');
    setSessionType('english');

    // Get questions that were answered incorrectly
    const failedQuestions = ENGLISH_QUESTIONS.filter(q => {
      const s = englishStats[q.id];
      return s && s.attempts > s.correct;
    });

    if (failedQuestions.length === 0) {
      // No failed questions - start regular mixed practice
      startEnglishSession({ mode: 'practice', type: 'mixed', count: 10 });
      return;
    }

    // Shuffle failed questions
    const shuffled = [...failedQuestions].sort(() => Math.random() - 0.5);
    const selection = shuffled.slice(0, Math.min(15, shuffled.length));

    setEnglishSession(selection);
    setSessionResults({ correct: 0, incorrect: 0 });
    setView('english');
  };

  const handleSessionComplete = (results) => {
    setSessionResults(results);

    // Record daily stats for charts
    const total = results.correct + results.incorrect;
    if (total > 0) {
      const type = sessionType === 'english' ? 'english' : 'vocab';
      recordDailyAccuracy(results.correct, total, type);
    }

    setView('results');
    // localStorage clearing is handled by the useEffect above when view changes to 'results'
  };

  const updateWordProgress = (wordId, isCorrect) => {
    const current = stats[wordId] || { correct: 0, incorrect: 0, level: 0 };
    const newStats = {
      ...stats,
      [wordId]: {
        correct: current.correct + (isCorrect ? 1 : 0),
        incorrect: current.incorrect + (isCorrect ? 0 : 1),
        level: isCorrect ? Math.min(current.level + 1, 5) : Math.max(current.level - 1, 0),
        lastSeen: new Date().toISOString()
      }
    };
    saveStats(newStats);
  };

  const updateEnglishProgress = (questionId, isCorrect) => {
    const current = englishStats[questionId] || { correct: 0, incorrect: 0, attempts: 0 };
    const newStats = {
      ...englishStats,
      [questionId]: {
        correct: current.correct + (isCorrect ? 1 : 0),
        incorrect: current.incorrect + (isCorrect ? 0 : 1),
        attempts: current.attempts + 1,
        lastSeen: new Date().toISOString()
      }
    };
    saveEnglishStats(newStats);
  };

  const handleRestart = () => {
    // Clear persisted progress before restarting
    localStorage.removeItem('wm_english_progress');
    localStorage.removeItem('wm_vocab_progress');

    if (sessionType === 'vocabulary') {
      startSession(mode, session.length);
    } else if (sessionType === 'english') {
      setView('englishSelect');
    }
  };

  const handleResetStats = (type) => {
    if (type === 'vocab' || type === 'all') {
      setStats({});
      localStorage.removeItem('wm_stats');
      localStorage.removeItem('wm_vocab_progress');
    }
    if (type === 'english' || type === 'all') {
      setEnglishStats({});
      localStorage.removeItem('wm_english_stats');
      localStorage.removeItem('wm_english_progress');
    }
    if (type === 'all') {
      localStorage.removeItem('wm_active_session');
    }
    // Force refresh of stats if needed by clearing state, but setStats({}) already does that.
  };

  const handleReviewMistakes = () => {
    // Clear persist before starting new session to avoid resuming the old completed one
    localStorage.removeItem('wm_english_progress');
    localStorage.removeItem('wm_vocab_progress');

    if (sessionType === 'vocabulary' && sessionResults.incorrectItems?.length > 0) {
      // Filter incorrectly answered words
      const incorrectWords = VOCABULARY.filter(w => sessionResults.incorrectItems.includes(w.id));
      if (incorrectWords.length > 0) {
        setSession(incorrectWords);
        setSessionResults({ correct: 0, incorrect: 0 }); // Reset scores
        setSessionType('vocabulary');
        setMode('flash'); // Default to flash mode for review? Or keep same mode? Let's use flash for learning.
        setView('study');
      }
    } else if (sessionType === 'english' && sessionResults.answers?.length > 0) {
      // Filter incorrectly answered questions
      const incorrectIds = sessionResults.answers.filter(a => !a.isCorrect).map(a => a.questionId);
      const incorrectQuestions = ENGLISH_QUESTIONS.filter(q => incorrectIds.includes(q.id));

      if (incorrectQuestions.length > 0) {
        setEnglishSession(incorrectQuestions);
        setSessionResults({ correct: 0, incorrect: 0 }); // Reset scores
        setSessionType('english');
        // Use 'practice' mode for review, not exam
        setView('english');
      }
    }
  };

  const appStyles = {
    minHeight: '100vh',
    background: C.bg,
    color: C.text,
    fontFamily: FONTS.main,
    direction: 'rtl'
  };

  return (
    <div style={appStyles}>
      {view === 'welcome' && (
        <WelcomeScreen
          stats={stats}
          englishStats={englishStats}
          totalWords={VOCABULARY.length}
          totalQuestions={ENGLISH_QUESTIONS.length}
          onContinue={() => {
            localStorage.setItem('wm_last_visit_time', Date.now().toString());
            setView('home');
          }}
        />
      )}

      {view === 'home' && (
        <Home
          stats={stats}
          englishStats={englishStats}
          userWords={userWords}
          totalWords={VOCABULARY.length}
          totalQuestions={ENGLISH_QUESTIONS.length}
          onStart={startSession}
          onStartEnglish={() => setView('englishSelect')}
          onStartFailedVocab={startFailedVocabReview}
          onStartFailedEnglish={startFailedEnglishReview}
          onOpenStats={() => setView('stats')}
          onOpenSettings={() => setView('settings')}
          onOpenPomodoro={() => setView('pomodoro')}
          onOpenMyWords={() => setView('my-words')}
        />
      )}

      {view === 'settings' && (
        <Settings
          onBack={() => setView('home')}
          onResetStats={handleResetStats}
          onOpenLegal={() => setView('legal')}
          onOpenAccessibility={() => setView('accessibility')}
        />
      )}

      {view === 'legal' && (
        <LegalPages
          onBack={() => setView('settings')}
        />
      )}

      {view === 'accessibility' && (
        <AccessibilityStatement
          onBack={() => setView('settings')}
        />
      )}

      {view === 'pomodoro' && (
        <PomodoroTimer
          onBack={() => setView('home')}
        />
      )}

      {view === 'my-words' && (
        <UserWordsList
          words={userWords}
          onDelete={handleDeleteWord}
          onBack={() => setView('home')}
        />
      )}

      {view === 'stats' && (
        <Stats
          stats={stats}
          englishStats={englishStats}
          totalWords={VOCABULARY.length}
          totalQuestions={ENGLISH_QUESTIONS.length}
          onBack={() => setView('home')}
        />
      )}

      {view === 'study' && (
        <StudySession
          mode={mode}
          session={session}
          onUpdateProgress={updateWordProgress}
          onComplete={handleSessionComplete}
          onExit={() => setView('home')}
        />
      )}

      {view === 'englishSelect' && (
        <QuestionTypeSelector
          onSelect={startEnglishSession}
          onBack={() => setView('home')}
        />
      )}

      {view === 'english' && (
        <EnglishExamSession
          mode="practice"
          questions={englishSession}
          onUpdateProgress={updateEnglishProgress}
          onSaveWord={handleSaveWord}
          onComplete={handleSessionComplete}
          onExit={() => setView('home')}
        />
      )}

      {view === 'exam' && (
        <EnglishExamSession
          mode="exam"
          questions={englishSession}
          onUpdateProgress={updateEnglishProgress}
          onSaveWord={handleSaveWord}
          onComplete={handleSessionComplete}
          onExit={() => setView('home')}
        />
      )}

      {view === 'results' && (
        <Results
          results={sessionResults}
          sessionType={sessionType}
          onRestart={handleRestart}
          onHome={() => setView('home')}
          onReview={handleReviewMistakes}
        />
      )}
    </div>
  );
};

export default App;
