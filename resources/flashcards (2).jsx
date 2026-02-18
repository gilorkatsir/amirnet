import React, { useState, useEffect, useCallback } from 'react';

// Sample vocabulary - replace with your PDF content
const INITIAL_VOCABULARY = [
  { id: 1, english: "abundant", hebrew: "שופע, רב", example: "The region has abundant natural resources." },
  { id: 2, english: "acquire", hebrew: "לרכוש, להשיג", example: "She acquired new skills during the course." },
  { id: 3, english: "adequate", hebrew: "מספיק, הולם", example: "The room was adequate for our needs." },
  { id: 4, english: "adjacent", hebrew: "סמוך, צמוד", example: "The park is adjacent to the school." },
  { id: 5, english: "advocate", hebrew: "לתמוך, תומך", example: "He advocates for environmental protection." },
  { id: 6, english: "allocate", hebrew: "להקצות", example: "The company will allocate more funds to research." },
  { id: 7, english: "ambiguous", hebrew: "דו-משמעי, מעורפל", example: "The instructions were ambiguous." },
  { id: 8, english: "anticipate", hebrew: "לצפות, לחזות", example: "We anticipate strong sales this quarter." },
  { id: 9, english: "apparent", hebrew: "ברור, נראה לעין", example: "It was apparent that she was upset." },
  { id: 10, english: "arbitrary", hebrew: "שרירותי", example: "The decision seemed arbitrary." },
  { id: 11, english: "assess", hebrew: "להעריך", example: "We need to assess the damage." },
  { id: 12, english: "attribute", hebrew: "לייחס, תכונה", example: "She attributes her success to hard work." },
  { id: 13, english: "beneficial", hebrew: "מועיל", example: "Exercise is beneficial for health." },
  { id: 14, english: "comprise", hebrew: "לכלול, להכיל", example: "The committee comprises five members." },
  { id: 15, english: "conceive", hebrew: "להגות, לתפוס", example: "I cannot conceive how this happened." },
  { id: 16, english: "conduct", hebrew: "להוביל, להנהיג, התנהגות", example: "They conduct research on climate change." },
  { id: 17, english: "consequence", hebrew: "תוצאה, השלכה", example: "Consider the consequences of your actions." },
  { id: 18, english: "constitute", hebrew: "להוות, לייסד", example: "Women constitute 60% of the workforce." },
  { id: 19, english: "constrain", hebrew: "להגביל, לאלץ", example: "Budget cuts constrain our options." },
  { id: 20, english: "construct", hebrew: "לבנות, מבנה", example: "They plan to construct a new bridge." },
  { id: 21, english: "contemporary", hebrew: "בן זמננו, עכשווי", example: "Contemporary art can be controversial." },
  { id: 22, english: "contradict", hebrew: "לסתור", example: "The evidence contradicts his story." },
  { id: 23, english: "contribute", hebrew: "לתרום", example: "She contributes to various charities." },
  { id: 24, english: "controversy", hebrew: "מחלוקת, פולמוס", example: "The policy sparked controversy." },
  { id: 25, english: "crucial", hebrew: "קריטי, מכריע", example: "This is a crucial moment in history." },
  { id: 26, english: "decline", hebrew: "לסרב, לרדת, ירידה", example: "Sales have declined this year." },
  { id: 27, english: "demonstrate", hebrew: "להדגים, להוכיח", example: "The study demonstrates a clear link." },
  { id: 28, english: "derive", hebrew: "לנבוע, להפיק", example: "Many words derive from Latin." },
  { id: 29, english: "devise", hebrew: "להמציא, לתכנן", example: "We need to devise a new strategy." },
  { id: 30, english: "diminish", hebrew: "להפחית, לצמצם", example: "Nothing can diminish her achievements." },
];

// Spaced repetition intervals (in sessions)
const SR_INTERVALS = [1, 2, 4, 8, 16, 32];

const FlashcardApp = () => {
  // Core state
  const [vocabulary, setVocabulary] = useState([]);
  const [wordStats, setWordStats] = useState({});
  const [currentView, setCurrentView] = useState('menu');
  const [sessionWords, setSessionWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionResults, setSessionResults] = useState({ correct: 0, incorrect: 0 });
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [userAnswer, setUserAnswer] = useState(null);
  const [studyMode, setStudyMode] = useState('flashcard');
  const [sessionSize, setSessionSize] = useState(10);
  const [aiQuestion, setAiQuestion] = useState(null);
  const [streak, setStreak] = useState(0);

  // Load data from localStorage
  useEffect(() => {
    const savedVocab = localStorage.getItem('vocab_data');
    const savedStats = localStorage.getItem('word_stats');
    const savedStreak = localStorage.getItem('streak');
    
    if (savedVocab) {
      setVocabulary(JSON.parse(savedVocab));
    } else {
      setVocabulary(INITIAL_VOCABULARY);
      localStorage.setItem('vocab_data', JSON.stringify(INITIAL_VOCABULARY));
    }
    
    if (savedStats) {
      setWordStats(JSON.parse(savedStats));
    }
    
    if (savedStreak) {
      setStreak(parseInt(savedStreak));
    }
  }, []);

  // Save stats to localStorage
  const saveStats = useCallback((newStats) => {
    setWordStats(newStats);
    localStorage.setItem('word_stats', JSON.stringify(newStats));
  }, []);

  // Get word priority based on spaced repetition
  const getWordPriority = useCallback((word) => {
    const stats = wordStats[word.id] || { correct: 0, incorrect: 0, lastSeen: 0, level: 0 };
    const incorrectWeight = stats.incorrect * 3;
    const correctWeight = stats.correct;
    const levelWeight = stats.level * 2;
    const recencyWeight = stats.lastSeen ? (Date.now() - stats.lastSeen) / (1000 * 60 * 60) : 100;
    
    return incorrectWeight - correctWeight - levelWeight + Math.min(recencyWeight, 50);
  }, [wordStats]);

  // Start a new study session
  const startSession = useCallback((mode, size = 10) => {
    setStudyMode(mode);
    setSessionSize(size);
    
    // Sort words by priority (harder words first)
    const sortedWords = [...vocabulary].sort((a, b) => getWordPriority(b) - getWordPriority(a));
    const selected = sortedWords.slice(0, size);
    
    // Shuffle for variety
    const shuffled = selected.sort(() => Math.random() - 0.5);
    
    setSessionWords(shuffled);
    setCurrentIndex(0);
    setShowAnswer(false);
    setSessionResults({ correct: 0, incorrect: 0 });
    setUserAnswer(null);
    
    if (mode === 'multiple') {
      generateOptions(shuffled[0]);
    } else if (mode === 'ai') {
      generateAIQuestion(shuffled[0]);
    }
    
    setCurrentView('study');
  }, [vocabulary, getWordPriority]);

  // Generate multiple choice options
  const generateOptions = useCallback((currentWord) => {
    const otherWords = vocabulary.filter(w => w.id !== currentWord.id);
    const shuffled = otherWords.sort(() => Math.random() - 0.5);
    const wrongOptions = shuffled.slice(0, 3);
    
    const allOptions = [
      { hebrew: currentWord.hebrew, isCorrect: true },
      ...wrongOptions.map(w => ({ hebrew: w.hebrew, isCorrect: false }))
    ].sort(() => Math.random() - 0.5);
    
    setSelectedOptions(allOptions);
  }, [vocabulary]);

  // Generate AI-powered question variations
  const generateAIQuestion = useCallback((word) => {
    const questionTypes = [
      {
        type: 'sentence_completion',
        question: `Complete the sentence with the correct word:\n"The project was _____ for the company's success."`,
        options: [word.english, ...getRandomWords(3).map(w => w.english)].sort(() => Math.random() - 0.5),
        answer: word.english,
        hint: word.hebrew
      },
      {
        type: 'definition',
        question: `Which word means "${word.hebrew}"?`,
        options: [word.english, ...getRandomWords(3).map(w => w.english)].sort(() => Math.random() - 0.5),
        answer: word.english
      },
      {
        type: 'reverse',
        question: `What is the Hebrew translation of "${word.english}"?`,
        options: [word.hebrew, ...getRandomWords(3).map(w => w.hebrew)].sort(() => Math.random() - 0.5),
        answer: word.hebrew
      },
      {
        type: 'context',
        question: `In the sentence "${word.example}", what does "${word.english}" mean?`,
        options: [word.hebrew, ...getRandomWords(3).map(w => w.hebrew)].sort(() => Math.random() - 0.5),
        answer: word.hebrew
      }
    ];
    
    const selected = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    setAiQuestion(selected);
    setSelectedOptions(selected.options.map((opt, i) => ({ 
      text: opt, 
      isCorrect: opt === selected.answer 
    })));
  }, [vocabulary]);

  const getRandomWords = (count) => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  // Handle answer
  const handleAnswer = useCallback((isCorrect) => {
    const currentWord = sessionWords[currentIndex];
    const stats = wordStats[currentWord.id] || { correct: 0, incorrect: 0, lastSeen: 0, level: 0 };
    
    const newStats = {
      ...stats,
      correct: stats.correct + (isCorrect ? 1 : 0),
      incorrect: stats.incorrect + (isCorrect ? 0 : 1),
      lastSeen: Date.now(),
      level: isCorrect ? Math.min(stats.level + 1, 5) : Math.max(stats.level - 1, 0)
    };
    
    const updatedWordStats = { ...wordStats, [currentWord.id]: newStats };
    saveStats(updatedWordStats);
    
    setUserAnswer(isCorrect);
    setSessionResults(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      incorrect: prev.incorrect + (isCorrect ? 0 : 1)
    }));
    setShowAnswer(true);
  }, [sessionWords, currentIndex, wordStats, saveStats]);

  // Next word
  const nextWord = useCallback(() => {
    if (currentIndex < sessionWords.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setShowAnswer(false);
      setUserAnswer(null);
      
      if (studyMode === 'multiple') {
        generateOptions(sessionWords[nextIdx]);
      } else if (studyMode === 'ai') {
        generateAIQuestion(sessionWords[nextIdx]);
      }
    } else {
      // Session complete
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('streak', newStreak.toString());
      setCurrentView('results');
    }
  }, [currentIndex, sessionWords, studyMode, generateOptions, generateAIQuestion, streak]);

  // Calculate statistics
  const getStatistics = useCallback(() => {
    const totalWords = vocabulary.length;
    const practiced = Object.keys(wordStats).length;
    const mastered = Object.values(wordStats).filter(s => s.level >= 4).length;
    const struggling = Object.values(wordStats).filter(s => s.incorrect > s.correct).length;
    
    const totalCorrect = Object.values(wordStats).reduce((sum, s) => sum + s.correct, 0);
    const totalIncorrect = Object.values(wordStats).reduce((sum, s) => sum + s.incorrect, 0);
    const accuracy = totalCorrect + totalIncorrect > 0 
      ? Math.round((totalCorrect / (totalCorrect + totalIncorrect)) * 100) 
      : 0;

    return { totalWords, practiced, mastered, struggling, accuracy, totalCorrect, totalIncorrect };
  }, [vocabulary, wordStats]);

  // Render menu
  const renderMenu = () => {
    const stats = getStatistics();
    
    return (
      <div className="menu-container">
        <div className="app-header">
          <div className="logo-section">
            <div className="logo-icon">📚</div>
            <h1>WordMaster</h1>
          </div>
          <p className="tagline">לימוד אנגלית חכם ומהיר</p>
          {streak > 0 && (
            <div className="streak-badge">
              <span className="fire">🔥</span>
              <span>{streak} ימים רצופים!</span>
            </div>
          )}
        </div>

        <div className="quick-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.mastered}</span>
            <span className="stat-label">נשלטו</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.practiced}/{stats.totalWords}</span>
            <span className="stat-label">תורגלו</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats.accuracy}%</span>
            <span className="stat-label">דיוק</span>
          </div>
        </div>

        <div className="study-modes">
          <h2>בחר מצב לימוד</h2>
          
          <button className="mode-btn flashcard-mode" onClick={() => startSession('flashcard', sessionSize)}>
            <div className="mode-icon">🎴</div>
            <div className="mode-info">
              <span className="mode-name">כרטיסיות</span>
              <span className="mode-desc">הפוך וזכור</span>
            </div>
            <span className="mode-time">~3 דק׳</span>
          </button>

          <button className="mode-btn multiple-mode" onClick={() => startSession('multiple', sessionSize)}>
            <div className="mode-icon">📝</div>
            <div className="mode-info">
              <span className="mode-name">בחירה מרובה</span>
              <span className="mode-desc">4 תשובות אפשריות</span>
            </div>
            <span className="mode-time">~5 דק׳</span>
          </button>

          <button className="mode-btn ai-mode" onClick={() => startSession('ai', sessionSize)}>
            <div className="mode-icon">🤖</div>
            <div className="mode-info">
              <span className="mode-name">AI מתקדם</span>
              <span className="mode-desc">שאלות דינמיות</span>
            </div>
            <span className="mode-time">~7 דק׳</span>
          </button>
        </div>

        <div className="session-config">
          <label>גודל סט:</label>
          <div className="size-options">
            {[5, 10, 15, 20].map(size => (
              <button 
                key={size}
                className={`size-btn ${sessionSize === size ? 'active' : ''}`}
                onClick={() => setSessionSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <button className="stats-btn" onClick={() => setCurrentView('statistics')}>
          <span>📊</span> סטטיסטיקות מפורטות
        </button>
      </div>
    );
  };

  // Render flashcard mode
  const renderFlashcard = () => {
    const currentWord = sessionWords[currentIndex];
    if (!currentWord) return null;

    return (
      <div className="flashcard-container">
        <div className={`flashcard ${showAnswer ? 'flipped' : ''}`} onClick={() => !showAnswer && setShowAnswer(true)}>
          <div className="card-front">
            <span className="word">{currentWord.english}</span>
            <span className="tap-hint">לחץ להפוך</span>
          </div>
          <div className="card-back">
            <span className="translation">{currentWord.hebrew}</span>
            <span className="example">{currentWord.example}</span>
          </div>
        </div>

        {showAnswer && (
          <div className="answer-buttons">
            <button className="answer-btn incorrect" onClick={() => { handleAnswer(false); nextWord(); }}>
              <span>❌</span> לא ידעתי
            </button>
            <button className="answer-btn correct" onClick={() => { handleAnswer(true); nextWord(); }}>
              <span>✅</span> ידעתי
            </button>
          </div>
        )}
      </div>
    );
  };

  // Render multiple choice mode
  const renderMultipleChoice = () => {
    const currentWord = sessionWords[currentIndex];
    if (!currentWord) return null;

    return (
      <div className="multiple-container">
        <div className="question-card">
          <span className="question-word">{currentWord.english}</span>
          <span className="question-prompt">מה התרגום?</span>
        </div>

        <div className="options-grid">
          {selectedOptions.map((option, idx) => (
            <button
              key={idx}
              className={`option-btn ${
                userAnswer !== null 
                  ? option.isCorrect 
                    ? 'correct' 
                    : 'incorrect'
                  : ''
              }`}
              onClick={() => userAnswer === null && handleAnswer(option.isCorrect)}
              disabled={userAnswer !== null}
            >
              {option.hebrew}
            </button>
          ))}
        </div>

        {showAnswer && (
          <button className="next-btn" onClick={nextWord}>
            הבא ←
          </button>
        )}
      </div>
    );
  };

  // Render AI mode
  const renderAIMode = () => {
    if (!aiQuestion) return null;

    return (
      <div className="ai-container">
        <div className="ai-badge">
          <span>🤖</span> שאלה דינמית
        </div>
        
        <div className="ai-question">
          {aiQuestion.question}
          {aiQuestion.hint && <span className="ai-hint">רמז: {aiQuestion.hint}</span>}
        </div>

        <div className="options-grid">
          {selectedOptions.map((option, idx) => (
            <button
              key={idx}
              className={`option-btn ${
                userAnswer !== null 
                  ? option.isCorrect 
                    ? 'correct' 
                    : 'incorrect'
                  : ''
              }`}
              onClick={() => userAnswer === null && handleAnswer(option.isCorrect)}
              disabled={userAnswer !== null}
            >
              {option.text}
            </button>
          ))}
        </div>

        {showAnswer && (
          <button className="next-btn" onClick={nextWord}>
            הבא ←
          </button>
        )}
      </div>
    );
  };

  // Render study view
  const renderStudy = () => {
    const progress = ((currentIndex + 1) / sessionWords.length) * 100;

    return (
      <div className="study-container">
        <div className="study-header">
          <button className="back-btn" onClick={() => setCurrentView('menu')}>✕</button>
          <div className="progress-info">
            <span>{currentIndex + 1}/{sessionWords.length}</span>
          </div>
          <div className="score-display">
            <span className="correct-count">✓{sessionResults.correct}</span>
            <span className="incorrect-count">✗{sessionResults.incorrect}</span>
          </div>
        </div>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        {studyMode === 'flashcard' && renderFlashcard()}
        {studyMode === 'multiple' && renderMultipleChoice()}
        {studyMode === 'ai' && renderAIMode()}
      </div>
    );
  };

  // Render results
  const renderResults = () => {
    const total = sessionResults.correct + sessionResults.incorrect;
    const percentage = Math.round((sessionResults.correct / total) * 100);
    
    let message, emoji;
    if (percentage >= 90) { message = "מצוין! שליטה מרשימה!"; emoji = "🏆"; }
    else if (percentage >= 70) { message = "כל הכבוד! התקדמות יפה!"; emoji = "⭐"; }
    else if (percentage >= 50) { message = "לא רע! המשך להתאמן!"; emoji = "💪"; }
    else { message = "צריך עוד תרגול, אל תוותר!"; emoji = "📚"; }

    return (
      <div className="results-container">
        <div className="results-emoji">{emoji}</div>
        <h2>סיום סט!</h2>
        <p className="results-message">{message}</p>
        
        <div className="results-stats">
          <div className="result-circle">
            <svg viewBox="0 0 100 100">
              <circle className="bg" cx="50" cy="50" r="45" />
              <circle 
                className="progress" 
                cx="50" cy="50" r="45"
                style={{ strokeDasharray: `${percentage * 2.83} 283` }}
              />
            </svg>
            <span className="percentage">{percentage}%</span>
          </div>
          
          <div className="result-details">
            <div className="detail correct">
              <span className="icon">✓</span>
              <span className="count">{sessionResults.correct}</span>
              <span className="label">נכונות</span>
            </div>
            <div className="detail incorrect">
              <span className="icon">✗</span>
              <span className="count">{sessionResults.incorrect}</span>
              <span className="label">שגויות</span>
            </div>
          </div>
        </div>

        <div className="results-actions">
          <button className="action-btn primary" onClick={() => startSession(studyMode, sessionSize)}>
            תרגול נוסף
          </button>
          <button className="action-btn secondary" onClick={() => setCurrentView('menu')}>
            חזרה לתפריט
          </button>
        </div>
      </div>
    );
  };

  // Render statistics
  const renderStatistics = () => {
    const stats = getStatistics();
    
    // Get word distribution by level
    const levelDistribution = [0, 0, 0, 0, 0, 0];
    Object.values(wordStats).forEach(s => {
      levelDistribution[s.level]++;
    });
    const notPracticed = vocabulary.length - Object.keys(wordStats).length;
    
    // Get hardest words
    const hardestWords = vocabulary
      .map(w => ({ ...w, stats: wordStats[w.id] || { correct: 0, incorrect: 0 } }))
      .filter(w => w.stats.incorrect > 0)
      .sort((a, b) => (b.stats.incorrect - b.stats.correct) - (a.stats.incorrect - a.stats.correct))
      .slice(0, 5);

    return (
      <div className="statistics-container">
        <div className="stats-header">
          <button className="back-btn" onClick={() => setCurrentView('menu')}>←</button>
          <h2>סטטיסטיקות</h2>
        </div>

        <div className="overview-cards">
          <div className="overview-card">
            <span className="overview-icon">📖</span>
            <span className="overview-value">{stats.totalWords}</span>
            <span className="overview-label">מילים במאגר</span>
          </div>
          <div className="overview-card">
            <span className="overview-icon">✅</span>
            <span className="overview-value">{stats.mastered}</span>
            <span className="overview-label">נשלטו</span>
          </div>
          <div className="overview-card">
            <span className="overview-icon">⚠️</span>
            <span className="overview-value">{stats.struggling}</span>
            <span className="overview-label">קשות</span>
          </div>
          <div className="overview-card">
            <span className="overview-icon">🎯</span>
            <span className="overview-value">{stats.accuracy}%</span>
            <span className="overview-label">דיוק</span>
          </div>
        </div>

        <div className="distribution-section">
          <h3>התפלגות רמות</h3>
          <div className="level-bars">
            {['חדש', 'מתחיל', 'בסיסי', 'בינוני', 'מתקדם', 'שולט'].map((label, idx) => {
              const count = idx === 0 ? notPracticed : levelDistribution[idx - 1];
              const maxCount = Math.max(notPracticed, ...levelDistribution);
              const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
              
              return (
                <div key={idx} className="level-row">
                  <span className="level-label">{label}</span>
                  <div className="level-bar-bg">
                    <div 
                      className={`level-bar-fill level-${idx}`}
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                  <span className="level-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {hardestWords.length > 0 && (
          <div className="hardest-section">
            <h3>מילים מאתגרות</h3>
            <div className="hardest-list">
              {hardestWords.map(word => (
                <div key={word.id} className="hardest-item">
                  <span className="hardest-word">{word.english}</span>
                  <span className="hardest-translation">{word.hebrew}</span>
                  <span className="hardest-stats">
                    ✓{word.stats.correct} ✗{word.stats.incorrect}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="reset-btn" onClick={() => {
          if (confirm('האם אתה בטוח? כל ההתקדמות תימחק!')) {
            localStorage.removeItem('word_stats');
            localStorage.removeItem('streak');
            setWordStats({});
            setStreak(0);
          }
        }}>
          איפוס התקדמות
        </button>
      </div>
    );
  };

  return (
    <div className="app" dir="rtl">
      {currentView === 'menu' && renderMenu()}
      {currentView === 'study' && renderStudy()}
      {currentView === 'results' && renderResults()}
      {currentView === 'statistics' && renderStatistics()}
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        .app {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0d0d1f 100%);
          font-family: 'Heebo', sans-serif;
          color: #fff;
          padding: 20px;
          overflow-x: hidden;
        }
        
        /* Menu Styles */
        .menu-container {
          max-width: 480px;
          margin: 0 auto;
          padding: 20px 0;
        }
        
        .app-header {
          text-align: center;
          margin-bottom: 30px;
        }
        
        .logo-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .logo-icon {
          font-size: 40px;
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .app-header h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 36px;
          font-weight: 700;
          background: linear-gradient(135deg, #00d4ff, #7c3aed, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .tagline {
          font-size: 16px;
          color: #a0a0c0;
          margin-bottom: 15px;
        }
        
        .streak-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
          padding: 8px 20px;
          border-radius: 30px;
          font-weight: 600;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        .fire {
          font-size: 20px;
        }
        
        /* Quick Stats */
        .quick-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 16px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .stat-number {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 24px;
          font-weight: 700;
          color: #00d4ff;
        }
        
        .stat-label {
          font-size: 12px;
          color: #8080a0;
        }
        
        /* Study Modes */
        .study-modes {
          margin-bottom: 25px;
        }
        
        .study-modes h2 {
          font-size: 18px;
          font-weight: 500;
          margin-bottom: 15px;
          color: #c0c0e0;
        }
        
        .mode-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 18px 20px;
          margin-bottom: 12px;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: right;
        }
        
        .flashcard-mode {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 212, 255, 0.05) 100%);
          border: 1px solid rgba(0, 212, 255, 0.3);
        }
        
        .flashcard-mode:hover {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.25) 0%, rgba(0, 212, 255, 0.1) 100%);
          transform: translateX(-5px);
        }
        
        .multiple-mode {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.15) 0%, rgba(124, 58, 237, 0.05) 100%);
          border: 1px solid rgba(124, 58, 237, 0.3);
        }
        
        .multiple-mode:hover {
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.25) 0%, rgba(124, 58, 237, 0.1) 100%);
          transform: translateX(-5px);
        }
        
        .ai-mode {
          background: linear-gradient(135deg, rgba(244, 114, 182, 0.15) 0%, rgba(244, 114, 182, 0.05) 100%);
          border: 1px solid rgba(244, 114, 182, 0.3);
        }
        
        .ai-mode:hover {
          background: linear-gradient(135deg, rgba(244, 114, 182, 0.25) 0%, rgba(244, 114, 182, 0.1) 100%);
          transform: translateX(-5px);
        }
        
        .mode-icon {
          font-size: 32px;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }
        
        .mode-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .mode-name {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
        }
        
        .mode-desc {
          font-size: 13px;
          color: #8080a0;
        }
        
        .mode-time {
          font-size: 12px;
          color: #60608f;
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        
        /* Session Config */
        .session-config {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
          padding: 15px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }
        
        .session-config label {
          font-size: 14px;
          color: #a0a0c0;
        }
        
        .size-options {
          display: flex;
          gap: 8px;
        }
        
        .size-btn {
          width: 44px;
          height: 44px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          color: #fff;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .size-btn.active {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border-color: transparent;
        }
        
        .size-btn:hover:not(.active) {
          border-color: rgba(255, 255, 255, 0.4);
        }
        
        .stats-btn {
          width: 100%;
          padding: 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #a0a0c0;
          font-size: 15px;
          font-family: 'Heebo', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        
        .stats-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        
        /* Study Container */
        .study-container {
          max-width: 480px;
          margin: 0 auto;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .study-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        
        .back-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border-radius: 10px;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .back-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .progress-info {
          font-size: 16px;
          color: #a0a0c0;
        }
        
        .score-display {
          display: flex;
          gap: 12px;
        }
        
        .correct-count {
          color: #22c55e;
          font-weight: 600;
        }
        
        .incorrect-count {
          color: #ef4444;
          font-weight: 600;
        }
        
        .progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          margin-bottom: 30px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #00d4ff, #7c3aed);
          border-radius: 3px;
          transition: width 0.3s ease;
        }
        
        /* Flashcard */
        .flashcard-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 30px;
        }
        
        .flashcard {
          width: 100%;
          max-width: 350px;
          height: 220px;
          perspective: 1000px;
          cursor: pointer;
        }
        
        .flashcard .card-front,
        .flashcard .card-back {
          width: 100%;
          height: 100%;
          position: absolute;
          backface-visibility: hidden;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 25px;
          transition: transform 0.6s ease;
        }
        
        .card-front {
          background: linear-gradient(145deg, #1e1e4a, #2a2a5e);
          border: 1px solid rgba(0, 212, 255, 0.3);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }
        
        .card-back {
          background: linear-gradient(145deg, #2a1e4a, #3a2a5e);
          border: 1px solid rgba(124, 58, 237, 0.3);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
          transform: rotateY(180deg);
        }
        
        .flashcard.flipped .card-front {
          transform: rotateY(-180deg);
        }
        
        .flashcard.flipped .card-back {
          transform: rotateY(0);
        }
        
        .card-front .word {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 36px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 15px;
        }
        
        .tap-hint {
          font-size: 13px;
          color: #60608f;
        }
        
        .card-back .translation {
          font-size: 28px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 15px;
          text-align: center;
        }
        
        .card-back .example {
          font-size: 14px;
          color: #a0a0c0;
          text-align: center;
          line-height: 1.5;
          font-style: italic;
        }
        
        .answer-buttons {
          display: flex;
          gap: 15px;
          width: 100%;
          max-width: 350px;
        }
        
        .answer-btn {
          flex: 1;
          padding: 16px;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 600;
          font-family: 'Heebo', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        
        .answer-btn.incorrect {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: #fff;
        }
        
        .answer-btn.correct {
          background: linear-gradient(135deg, #16a34a, #15803d);
          color: #fff;
        }
        
        .answer-btn:hover {
          transform: scale(1.02);
        }
        
        /* Multiple Choice */
        .multiple-container,
        .ai-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 25px;
          padding-top: 20px;
        }
        
        .question-card {
          background: linear-gradient(145deg, #1e1e4a, #2a2a5e);
          border: 1px solid rgba(124, 58, 237, 0.3);
          border-radius: 20px;
          padding: 35px 25px;
          text-align: center;
          width: 100%;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
        }
        
        .question-word {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 34px;
          font-weight: 700;
          color: #fff;
          display: block;
          margin-bottom: 10px;
        }
        
        .question-prompt {
          font-size: 15px;
          color: #8080a0;
        }
        
        .options-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          width: 100%;
        }
        
        .option-btn {
          padding: 20px 15px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 14px;
          color: #fff;
          font-size: 16px;
          font-family: 'Heebo', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
          min-height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .option-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
          transform: scale(1.02);
        }
        
        .option-btn.correct {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(21, 128, 61, 0.3));
          border-color: #22c55e;
        }
        
        .option-btn.incorrect {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.2));
          border-color: rgba(239, 68, 68, 0.5);
        }
        
        .next-btn {
          padding: 16px 50px;
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          border: none;
          border-radius: 14px;
          color: #fff;
          font-size: 18px;
          font-weight: 600;
          font-family: 'Heebo', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 10px;
        }
        
        .next-btn:hover {
          transform: scale(1.05);
        }
        
        /* AI Mode */
        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, rgba(244, 114, 182, 0.2), rgba(236, 72, 153, 0.1));
          border: 1px solid rgba(244, 114, 182, 0.3);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 13px;
          color: #f472b6;
        }
        
        .ai-question {
          background: linear-gradient(145deg, #1e1e4a, #2a2a5e);
          border: 1px solid rgba(244, 114, 182, 0.3);
          border-radius: 20px;
          padding: 25px;
          text-align: center;
          width: 100%;
          font-size: 18px;
          line-height: 1.6;
          white-space: pre-line;
        }
        
        .ai-hint {
          display: block;
          margin-top: 15px;
          font-size: 14px;
          color: #a0a0c0;
        }
        
        /* Results */
        .results-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 40px 20px;
          text-align: center;
        }
        
        .results-emoji {
          font-size: 80px;
          margin-bottom: 20px;
          animation: bounce 1s ease infinite;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        
        .results-container h2 {
          font-size: 32px;
          margin-bottom: 10px;
        }
        
        .results-message {
          font-size: 18px;
          color: #a0a0c0;
          margin-bottom: 35px;
        }
        
        .results-stats {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 25px;
          margin-bottom: 40px;
        }
        
        .result-circle {
          position: relative;
          width: 150px;
          height: 150px;
        }
        
        .result-circle svg {
          transform: rotate(-90deg);
          width: 100%;
          height: 100%;
        }
        
        .result-circle .bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.1);
          stroke-width: 8;
        }
        
        .result-circle .progress {
          fill: none;
          stroke: url(#gradient);
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dasharray 1s ease;
        }
        
        .result-circle .percentage {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Space Grotesk', sans-serif;
          font-size: 36px;
          font-weight: 700;
        }
        
        .result-details {
          display: flex;
          gap: 40px;
        }
        
        .result-details .detail {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }
        
        .detail .icon {
          font-size: 24px;
        }
        
        .detail .count {
          font-size: 28px;
          font-weight: 700;
        }
        
        .detail.correct .count { color: #22c55e; }
        .detail.incorrect .count { color: #ef4444; }
        
        .detail .label {
          font-size: 13px;
          color: #8080a0;
        }
        
        .results-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .action-btn {
          padding: 16px;
          border: none;
          border-radius: 14px;
          font-size: 18px;
          font-weight: 600;
          font-family: 'Heebo', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .action-btn.primary {
          background: linear-gradient(135deg, #7c3aed, #a855f7);
          color: #fff;
        }
        
        .action-btn.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        
        .action-btn:hover {
          transform: scale(1.02);
        }
        
        /* Statistics */
        .statistics-container {
          max-width: 480px;
          margin: 0 auto;
          padding: 10px 0;
        }
        
        .stats-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }
        
        .stats-header h2 {
          font-size: 24px;
        }
        
        .overview-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 30px;
        }
        
        .overview-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .overview-icon {
          font-size: 28px;
        }
        
        .overview-value {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #00d4ff;
        }
        
        .overview-label {
          font-size: 13px;
          color: #8080a0;
        }
        
        .distribution-section,
        .hardest-section {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .distribution-section h3,
        .hardest-section h3 {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 18px;
          color: #c0c0e0;
        }
        
        .level-bars {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .level-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .level-label {
          width: 60px;
          font-size: 13px;
          color: #a0a0c0;
        }
        
        .level-bar-bg {
          flex: 1;
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          overflow: hidden;
        }
        
        .level-bar-fill {
          height: 100%;
          border-radius: 6px;
          transition: width 0.5s ease;
        }
        
        .level-0 { background: #64748b; }
        .level-1 { background: #ef4444; }
        .level-2 { background: #f97316; }
        .level-3 { background: #eab308; }
        .level-4 { background: #22c55e; }
        .level-5 { background: #00d4ff; }
        
        .level-count {
          width: 30px;
          text-align: left;
          font-size: 14px;
          color: #8080a0;
        }
        
        .hardest-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .hardest-item {
          display: flex;
          align-items: center;
          padding: 12px 15px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          gap: 12px;
        }
        
        .hardest-word {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 600;
          color: #fff;
        }
        
        .hardest-translation {
          flex: 1;
          font-size: 14px;
          color: #a0a0c0;
        }
        
        .hardest-stats {
          font-size: 13px;
          color: #8080a0;
        }
        
        .reset-btn {
          width: 100%;
          padding: 14px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #ef4444;
          font-size: 15px;
          font-family: 'Heebo', sans-serif;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .reset-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }
      `}</style>
      
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default FlashcardApp;
