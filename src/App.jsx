import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
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
import { useTier } from './contexts/TierContext';
import UpgradePrompt from './components/UpgradePrompt';
import { Analytics } from '@vercel/analytics/react';
import { Quantum } from 'ldrs/react';
import 'ldrs/react/Quantum.css';

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
const VocalSectionSelector = lazy(() => import('./features/VocalSectionSelector'));
const VocalExamSession = lazy(() => import('./features/exam/VocalExamSession'));
const VocabHub = lazy(() => import('./features/VocabHub'));
const AuthPage = lazy(() => import('./features/AuthPage'));

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
  const { isPremium, canAccessWord, canUseAiPractice, recordAiUsage, FREE_LIMITS } = useTier();
  const [upgradePrompt, setUpgradePrompt] = useState(null);

  // Load saved session synchronously to prevent race conditions
  const getSavedSession = () => {
    try {
      const saved = localStorage.getItem('wm_active_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.view && ['study', 'english', 'exam'].includes(parsed.view)) {
          return parsed;
        }
        // vocal-session can't be restored (section data not persisted) — redirect to selector
        if (parsed.view === 'vocal-session') {
          localStorage.removeItem('wm_active_session');
          return null;
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
  const [aiError, setAiError] = useState(null);
  const [vocalSection, setVocalSection] = useState(null);

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
    if (['study', 'english', 'exam', 'vocal-session'].includes(currentView)) {
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
    localStorage.removeItem('wm_vocab_progress');
    setMode(selectedMode);
    setSessionType('vocabulary');

    let selection;
    if (customWords) {
      selection = isPremium ? customWords : customWords.filter(w => canAccessWord(w.id));
    } else {
      const pool = isPremium ? VOCABULARY : VOCABULARY.filter(w => canAccessWord(w.id));
      const sorted = [...pool].sort((a, b) => calculatePriority(b.id) - calculatePriority(a.id));
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

    const pool = isPremium ? VOCABULARY : VOCABULARY.filter(w => canAccessWord(w.id));
    const failedWords = pool.filter(word => {
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
    if (!canUseAiPractice()) {
      setUpgradePrompt('ai');
      return;
    }

    const pool = isPremium ? VOCABULARY : VOCABULARY.filter(w => canAccessWord(w.id));
    const failedWords = pool.filter(word => {
      const s = stats[word.id];
      return s && s.incorrect > s.correct;
    });

    if (failedWords.length === 0) return;

    setAiLoading(true);
    try {
      const shuffled = [...failedWords].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(10, shuffled.length));
      const aiQuestions = await generateQuestions(selected, selected.length);

      recordAiUsage();
      setMode('english');
      setSessionType('ai-english');
      setEnglishSession(aiQuestions);
      setSessionResults({ correct: 0, incorrect: 0 });
      navigate('/english');
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const startVocalSession = (section) => {
    setVocalSection(section);
    setSessionType('vocal');
    setSessionResults({ correct: 0, incorrect: 0 });
    navigate('/vocal-session');
  };

  const startEnglishSession = (config) => {
    localStorage.removeItem('wm_english_progress');
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

    if (!isPremium) {
      questions = questions.slice(0, FREE_LIMITS.englishQuestions);
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
      const type = (sessionType === 'english' || sessionType === 'ai-english' || sessionType === 'vocal') ? 'english' : 'vocab';
      recordDailyAccuracy(results.correct, total, type);
    }

    navigate('/results');
  };

  const handleRestart = () => {
    localStorage.removeItem('wm_english_progress');
    localStorage.removeItem('wm_vocab_progress');

    if (sessionType === 'vocabulary') {
      startSession(mode, session.length || 10);
    } else if (sessionType === 'ai-english') {
      navigate('/');
    } else if (sessionType === 'vocal') {
      navigate('/vocal-select');
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
              onReview={(sessionType === 'vocabulary' || sessionType === 'english') ? handleReviewMistakes : undefined}
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

          <Route path="/vocal-select">
            <VocalSectionSelector
              onSelect={startVocalSession}
            />
          </Route>

          <Route path="/vocal-session">
            {vocalSection && (
              <VocalExamSession
                section={vocalSection}
                onComplete={handleSessionComplete}
              />
            )}
          </Route>

          <Route path="/vocab-hub">
            <VocabHub
              onStartFailedVocab={startFailedVocabReview}
              onStartAiPractice={startAiPractice}
            />
          </Route>

          <Route path="/login">
            <AuthPage />
          </Route>

          <Route path="/">
            <Home
              onStart={startSession}
            />
          </Route>
        </Switch>
      </Suspense>
      <AnimatePresence>
        {(aiLoading || aiError) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              zIndex: 1000, backdropFilter: 'blur(8px)'
            }}
          >
            {aiError ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <p style={{ color: '#ef4444', fontSize: 18, fontWeight: 600, marginBottom: 8 }}>שגיאה ביצירת שאלות</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 20, maxWidth: 280, textAlign: 'center' }}>{aiError}</p>
                <button onClick={() => setAiError(null)} style={{
                  padding: '10px 28px', borderRadius: 999, border: 'none',
                  background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer'
                }}>סגור</button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}
              >
                <Quantum size={52} speed={1.2} color="#8B5CF6" />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: '0 0 6px' }}>
                    מייצר שאלות AI...
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: 0 }}>
                    יצירת שאלות מותאמות למילים הקשות שלך
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <UpgradePrompt
        isOpen={!!upgradePrompt}
        onClose={() => setUpgradePrompt(null)}
        limitType={upgradePrompt || 'vocab'}
      />
      <Analytics />
    </div>
  );
};

export default App;
