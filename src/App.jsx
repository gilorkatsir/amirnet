import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Route, Switch, useLocation } from 'wouter';
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
import Results from './features/Results';
import { recordDailyAccuracy, cleanOldStats } from './utils/dailyStats';
import { useStatsContext } from './contexts/StatsContext';
import { useUserWords } from './contexts/UserWordsContext';
import LoadingSpinner from './components/LoadingSpinner';
import { generateQuestions } from './services/aiQuestionService';

// Lazy-loaded views (not needed on initial render)
const StudySession = lazy(() => import('./features/study/StudySession'));
const EnglishExamSession = lazy(() => import('./features/exam/EnglishExamSession'));
const QuestionTypeSelector = lazy(() => import('./features/QuestionTypeSelector'));
const Stats = lazy(() => import('./features/Stats'));
const Settings = lazy(() => import('./features/Settings'));
const PomodoroTimer = lazy(() => import('./features/PomodoroTimer'));
const LegalPages = lazy(() => import('./features/LegalPages'));
const AccessibilityStatement = lazy(() => import('./features/AccessibilityStatement'));
const UserWordsList = lazy(() => import('./features/UserWordsList'));
const ReadingComprehensionPractice = lazy(() => import('./features/study/ReadingComprehensionPractice'));
const VocabCategorySelector = lazy(() => import('./features/VocabCategorySelector'));

// Convert saved session view names to URL paths
const viewToPath = (view) => {
  switch (view) {
    case 'home': return '/';
    case 'englishSelect': return '/english-select';
    default: return `/${view}`;
  }
};

// Convert URL path to session view name (for persistence)
const pathToView = (path) => {
  if (path === '/') return 'home';
  if (path === '/english-select') return 'englishSelect';
  return path.slice(1);
};

const App = () => {
  const [location, navigate] = useLocation();
  const { stats, englishStats, calculatePriority } = useStatsContext();

  // Load saved session synchronously to prevent race conditions
  const getSavedSession = () => {
    try {
      const saved = localStorage.getItem('wm_active_session');
      if (saved) {
        const parsed = JSON.parse(saved);
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

  const [mode, setMode] = useState(savedSession?.mode || 'flash');
  const [sessionType, setSessionType] = useState(savedSession?.sessionType || null);
  const [session, setSession] = useState(savedSession?.session || []);
  const [englishSession, setEnglishSession] = useState(savedSession?.englishSession || []);
  const [sessionResults, setSessionResults] = useState({ correct: 0, incorrect: 0 });
  const [aiLoading, setAiLoading] = useState(false);

  // Handle initial redirect on fresh app open
  useEffect(() => {
    if (location !== '/') return;

    if (savedSession) {
      navigate(viewToPath(savedSession.view), { replace: true });
      return;
    }

    const lastVisit = localStorage.getItem('wm_last_visit_time');
    const now = Date.now();
    if (!lastVisit || (now - parseInt(lastVisit)) > 30 * 60 * 1000) {
      navigate('/welcome', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clean old daily stats on mount (retain last 90 days)
  useEffect(() => {
    cleanOldStats(90);
  }, []);

  // Save session state whenever location or session data changes
  useEffect(() => {
    const currentView = pathToView(location);
    if (['study', 'english', 'exam'].includes(currentView)) {
      const stateToSave = {
        view: currentView,
        mode,
        sessionType,
        session: session.length > 0 ? session : undefined,
        englishSession: englishSession.length > 0 ? englishSession : undefined
      };
      localStorage.setItem('wm_active_session', JSON.stringify(stateToSave));
    } else if (currentView === 'home' || currentView === 'results') {
      localStorage.removeItem('wm_active_session');
      localStorage.removeItem('wm_english_progress');
      localStorage.removeItem('wm_vocab_progress');
    }
  }, [location, mode, sessionType, session, englishSession]);

  // Vocabulary session start
  const startSession = (selectedMode, count = 10, customWords = null) => {
    setMode(selectedMode);
    setSessionType('vocabulary');

    let selection;
    if (customWords) {
      selection = customWords;
    } else {
      const sorted = [...VOCABULARY].sort((a, b) => calculatePriority(b.id) - calculatePriority(a.id));
      const topSlice = sorted.slice(0, Math.min(sorted.length, count * 3));
      const shuffled = topSlice.sort(() => Math.random() - 0.5);
      selection = shuffled.slice(0, count);
    }

    setSession(selection);
    setSessionResults({ correct: 0, incorrect: 0 });
    navigate('/study');
  };

  const startFailedVocabReview = () => {
    setMode('flash');
    setSessionType('vocabulary');

    const failedWords = VOCABULARY.filter(word => {
      const s = stats[word.id];
      return s && s.incorrect > s.correct;
    });

    if (failedWords.length === 0) {
      startSession('flash', 10);
      return;
    }

    const shuffled = [...failedWords].sort(() => Math.random() - 0.5);
    const selection = shuffled.slice(0, Math.min(20, shuffled.length));

    setSession(selection);
    setSessionResults({ correct: 0, incorrect: 0 });
    navigate('/study');
  };

  const startAiPractice = async () => {
    const failedWords = VOCABULARY.filter(word => {
      const s = stats[word.id];
      return s && s.incorrect > s.correct;
    });

    if (failedWords.length === 0) return;

    setAiLoading(true);
    try {
      const shuffled = [...failedWords].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(10, shuffled.length));
      const aiQuestions = await generateQuestions(selected, selected.length);

      setMode('english');
      setSessionType('ai-english');
      setEnglishSession(aiQuestions);
      setSessionResults({ correct: 0, incorrect: 0 });
      navigate('/english');
    } catch (err) {
      alert(`AI Error: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const startEnglishSession = (config) => {
    setMode('english');
    setSessionType('english');

    let questions;
    if (config.mode === 'exam') {
      questions = config.questions;
    } else if (config.type === 'mixed') {
      questions = getRandomQuestions(config.count);
    } else {
      const typeQuestions = getQuestionsByType(config.type);
      questions = typeQuestions.sort(() => Math.random() - 0.5).slice(0, config.count);
    }

    setEnglishSession(questions);
    setSessionResults({ correct: 0, incorrect: 0 });
    navigate(config.mode === 'exam' ? '/exam' : '/english');
  };

  const startFailedEnglishReview = () => {
    setMode('english');
    setSessionType('english');

    const failedQuestions = ENGLISH_QUESTIONS.filter(q => {
      const s = englishStats[q.id];
      return s && s.attempts > s.correct;
    });

    if (failedQuestions.length === 0) {
      startEnglishSession({ mode: 'practice', type: 'mixed', count: 10 });
      return;
    }

    const shuffled = [...failedQuestions].sort(() => Math.random() - 0.5);
    const selection = shuffled.slice(0, Math.min(15, shuffled.length));

    setEnglishSession(selection);
    setSessionResults({ correct: 0, incorrect: 0 });
    navigate('/english');
  };

  const handleSessionComplete = (results) => {
    setSessionResults(results);

    const total = results.correct + results.incorrect;
    if (total > 0) {
      const type = (sessionType === 'english' || sessionType === 'ai-english') ? 'english' : 'vocab';
      recordDailyAccuracy(results.correct, total, type);
    }

    navigate('/results');
  };

  const handleRestart = () => {
    localStorage.removeItem('wm_english_progress');
    localStorage.removeItem('wm_vocab_progress');

    if (sessionType === 'vocabulary') {
      startSession(mode, session.length);
    } else if (sessionType === 'ai-english') {
      navigate('/');
    } else if (sessionType === 'english') {
      navigate('/english-select');
    }
  };

  const handleReviewMistakes = () => {
    localStorage.removeItem('wm_english_progress');
    localStorage.removeItem('wm_vocab_progress');

    if (sessionType === 'vocabulary' && sessionResults.incorrectItems?.length > 0) {
      const incorrectWords = VOCABULARY.filter(w => sessionResults.incorrectItems.includes(w.id));
      if (incorrectWords.length > 0) {
        setSession(incorrectWords);
        setSessionResults({ correct: 0, incorrect: 0 });
        setSessionType('vocabulary');
        setMode('flash');
        navigate('/study');
      }
    } else if (sessionType === 'english' && sessionResults.answers?.length > 0) {
      const incorrectIds = sessionResults.answers.filter(a => !a.isCorrect).map(a => a.questionId);
      const incorrectQuestions = ENGLISH_QUESTIONS.filter(q => incorrectIds.includes(q.id));

      if (incorrectQuestions.length > 0) {
        setEnglishSession(incorrectQuestions);
        setSessionResults({ correct: 0, incorrect: 0 });
        setSessionType('english');
        navigate('/english');
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
      <Suspense fallback={<LoadingSpinner />}>
        <Switch>
          <Route path="/welcome">
            <WelcomeScreen />
          </Route>

          <Route path="/study">
            <StudySession
              mode={mode}
              session={session}
              onComplete={handleSessionComplete}
            />
          </Route>

          <Route path="/english-select">
            <QuestionTypeSelector
              onSelect={startEnglishSession}
            />
          </Route>

          <Route path="/english">
            <EnglishExamSession
              mode="practice"
              questions={englishSession}
              onComplete={handleSessionComplete}
            />
          </Route>

          <Route path="/exam">
            <EnglishExamSession
              mode="exam"
              questions={englishSession}
              onComplete={handleSessionComplete}
            />
          </Route>

          <Route path="/results">
            <Results
              results={sessionResults}
              sessionType={sessionType}
              onRestart={handleRestart}
              onReview={handleReviewMistakes}
            />
          </Route>

          <Route path="/stats">
            <Stats />
          </Route>

          <Route path="/settings">
            <Settings />
          </Route>

          <Route path="/legal">
            <LegalPages />
          </Route>

          <Route path="/accessibility">
            <AccessibilityStatement />
          </Route>

          <Route path="/pomodoro">
            <PomodoroTimer />
          </Route>

          <Route path="/my-words">
            <UserWordsList />
          </Route>

          <Route path="/vocab-categories">
            <VocabCategorySelector
              onStart={startSession}
            />
          </Route>

          <Route path="/rc-practice">
            <ReadingComprehensionPractice
              onComplete={handleSessionComplete}
            />
          </Route>

          <Route path="/">
            <Home
              onStart={startSession}
              onStartFailedVocab={startFailedVocabReview}
              onStartFailedEnglish={startFailedEnglishReview}
              onStartAiPractice={startAiPractice}
            />
          </Route>
        </Switch>
      </Suspense>
      {aiLoading && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, backdropFilter: 'blur(4px)'
        }}>
          <LoadingSpinner />
          <p style={{ color: 'white', marginTop: 16, fontSize: 16, fontWeight: 600 }}>
            מייצר שאלות AI...
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 4, fontSize: 13 }}>
            יצירת שאלות מותאמות למילים הקשות שלך
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
