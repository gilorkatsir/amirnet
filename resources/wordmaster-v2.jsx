import React, { useState, useEffect, useCallback } from 'react';

const WORDS = [
  { id: 1, english: "adjacent to", hebrew: "סמוך ל-, צמוד ל-", pos: "prep", phonetic: "/əˈdʒeɪsənt/" },
  { id: 2, english: "albeit", hebrew: "אם כי, למרות ש-", pos: "conj", phonetic: "/ɔːlˈbiːɪt/" },
  { id: 3, english: "amid", hebrew: "בתוך, באמצע", pos: "prep", phonetic: "/əˈmɪd/" },
  { id: 4, english: "chiefly", hebrew: "בעיקר", pos: "adv", phonetic: "/ˈtʃiːfli/" },
  { id: 5, english: "contradictory", hebrew: "סותר, מנוגד", pos: "adj", phonetic: "/ˌkɒntrəˈdɪktəri/" },
  { id: 6, english: "contrary", hebrew: "הפוך, מנוגד", pos: "adj", phonetic: "/ˈkɒntrəri/" },
  { id: 7, english: "conversely", hebrew: "לעומת זאת", pos: "adv", phonetic: "/ˈkɒnvɜːsli/" },
  { id: 8, english: "hence", hebrew: "לפיכך, מכאן", pos: "adv", phonetic: "/hens/" },
  { id: 9, english: "moreover", hebrew: "יתר על כן", pos: "adv", phonetic: "/mɔːrˈoʊvər/" },
  { id: 10, english: "nevertheless", hebrew: "בכל זאת", pos: "adv", phonetic: "/ˌnevərðəˈles/" },
  { id: 11, english: "nonetheless", hebrew: "בכל זאת, עם זאת", pos: "adv", phonetic: "/ˌnʌnðəˈles/" },
  { id: 12, english: "thus", hebrew: "לפיכך, כך", pos: "adv", phonetic: "/ðʌs/" },
  { id: 13, english: "ambiguous", hebrew: "דו-משמעי, מעורפל", pos: "adj", phonetic: "/æmˈbɪɡjuəs/" },
  { id: 14, english: "articulate", hebrew: "רהוט, לבטא", pos: "adj", phonetic: "/ɑːrˈtɪkjələt/" },
  { id: 15, english: "impartial", hebrew: "חסר פניות", pos: "adj", phonetic: "/ɪmˈpɑːrʃəl/" },
  { id: 16, english: "abrupt", hebrew: "פתאומי, חד", pos: "adj", phonetic: "/əˈbrʌpt/" },
  { id: 17, english: "allocate", hebrew: "להקצות", pos: "verb", phonetic: "/ˈæləkeɪt/" },
  { id: 18, english: "conclude", hebrew: "לסכם, להסיק", pos: "verb", phonetic: "/kənˈkluːd/" },
  { id: 19, english: "deduce", hebrew: "להסיק", pos: "verb", phonetic: "/dɪˈdjuːs/" },
  { id: 20, english: "derive", hebrew: "לנבוע, להפיק", pos: "verb", phonetic: "/dɪˈraɪv/" },
  { id: 21, english: "inadequate", hebrew: "לא מספיק, לקוי", pos: "adj", phonetic: "/ɪnˈædɪkwət/" },
  { id: 22, english: "profound", hebrew: "עמוק, מעמיק", pos: "adj", phonetic: "/prəˈfaʊnd/" },
  { id: 23, english: "affluent", hebrew: "אמיד, עשיר", pos: "adj", phonetic: "/ˈæfluənt/" },
  { id: 24, english: "candid", hebrew: "כן, גלוי לב", pos: "adj", phonetic: "/ˈkændɪd/" },
  { id: 25, english: "colossal", hebrew: "עצום, ענקי", pos: "adj", phonetic: "/kəˈlɒsəl/" },
  { id: 26, english: "commence", hebrew: "להתחיל", pos: "verb", phonetic: "/kəˈmens/" },
  { id: 27, english: "contemporary", hebrew: "בן זמננו, עכשווי", pos: "adj", phonetic: "/kənˈtempəreri/" },
  { id: 28, english: "convey", hebrew: "להעביר, למסור", pos: "verb", phonetic: "/kənˈveɪ/" },
  { id: 29, english: "deteriorate", hebrew: "להידרדר", pos: "verb", phonetic: "/dɪˈtɪəriəreɪt/" },
  { id: 30, english: "eminent", hebrew: "בולט, נכבד", pos: "adj", phonetic: "/ˈemɪnənt/" },
  { id: 31, english: "evade", hebrew: "להתחמק", pos: "verb", phonetic: "/ɪˈveɪd/" },
  { id: 32, english: "flourish", hebrew: "לפרוח, לשגשג", pos: "verb", phonetic: "/ˈflʌrɪʃ/" },
  { id: 33, english: "impose", hebrew: "להטיל, לכפות", pos: "verb", phonetic: "/ɪmˈpoʊz/" },
  { id: 34, english: "numerous", hebrew: "רבים, מרובים", pos: "adj", phonetic: "/ˈnuːmərəs/" },
  { id: 35, english: "precedent", hebrew: "תקדים", pos: "noun", phonetic: "/ˈpresɪdənt/" },
  { id: 36, english: "refute", hebrew: "להפריך", pos: "verb", phonetic: "/rɪˈfjuːt/" },
  { id: 37, english: "reluctant", hebrew: "מהסס, לא רוצה", pos: "adj", phonetic: "/rɪˈlʌktənt/" },
  { id: 38, english: "soar", hebrew: "להתרומם, לזנק", pos: "verb", phonetic: "/sɔːr/" },
  { id: 39, english: "swift", hebrew: "מהיר", pos: "adj", phonetic: "/swɪft/" },
  { id: 40, english: "avert", hebrew: "למנוע, להסיט", pos: "verb", phonetic: "/əˈvɜːrt/" },
  { id: 41, english: "excel", hebrew: "להצטיין", pos: "verb", phonetic: "/ɪkˈsel/" },
  { id: 42, english: "exploit", hebrew: "לנצל; הישג", pos: "verb", phonetic: "/ɪkˈsplɔɪt/" },
  { id: 43, english: "fortunate", hebrew: "בר מזל", pos: "adj", phonetic: "/ˈfɔːrtʃənət/" },
  { id: 44, english: "industrious", hebrew: "חרוץ, שקדן", pos: "adj", phonetic: "/ɪnˈdʌstriəs/" },
  { id: 45, english: "legislation", hebrew: "חקיקה", pos: "noun", phonetic: "/ˌledʒɪsˈleɪʃən/" },
  { id: 46, english: "obsolete", hebrew: "מיושן", pos: "adj", phonetic: "/ˈɒbsəliːt/" },
  { id: 47, english: "paramount", hebrew: "עליון, חשוב ביותר", pos: "adj", phonetic: "/ˈpærəmaʊnt/" },
  { id: 48, english: "postpone", hebrew: "לדחות", pos: "verb", phonetic: "/poʊstˈpoʊn/" },
  { id: 49, english: "subtle", hebrew: "עדין, מתוחכם", pos: "adj", phonetic: "/ˈsʌtəl/" },
  { id: 50, english: "sustain", hebrew: "לקיים, לתמוך", pos: "verb", phonetic: "/səˈsteɪn/" },
  { id: 51, english: "yield", hebrew: "לתת תשואה; להיכנע", pos: "verb", phonetic: "/jiːld/" },
  { id: 52, english: "conceive", hebrew: "להרות; לתפוס רעיון", pos: "verb", phonetic: "/kənˈsiːv/" },
  { id: 53, english: "concur", hebrew: "להסכים", pos: "verb", phonetic: "/kənˈkɜːr/" },
  { id: 54, english: "controversy", hebrew: "מחלוקת, פולמוס", pos: "noun", phonetic: "/ˈkɒntrəvɜːrsi/" },
  { id: 55, english: "deceive", hebrew: "להונות, לרמות", pos: "verb", phonetic: "/dɪˈsiːv/" },
  { id: 56, english: "deliberate", hebrew: "מכוון, מתוכנן", pos: "adj", phonetic: "/dɪˈlɪbərət/" },
  { id: 57, english: "devise", hebrew: "להמציא, לתכנן", pos: "verb", phonetic: "/dɪˈvaɪz/" },
  { id: 58, english: "evoke", hebrew: "לעורר", pos: "verb", phonetic: "/ɪˈvoʊk/" },
  { id: 59, english: "halt", hebrew: "לעצור", pos: "verb", phonetic: "/hɔːlt/" },
  { id: 60, english: "heir", hebrew: "יורש", pos: "noun", phonetic: "/er/" },
  { id: 61, english: "innate", hebrew: "מולד, טבעי", pos: "adj", phonetic: "/ɪˈneɪt/" },
  { id: 62, english: "persuade", hebrew: "לשכנע", pos: "verb", phonetic: "/pərˈsweɪd/" },
  { id: 63, english: "plausible", hebrew: "סביר, מתקבל על הדעת", pos: "adj", phonetic: "/ˈplɔːzəbəl/" },
  { id: 64, english: "prosperity", hebrew: "שגשוג", pos: "noun", phonetic: "/prɒˈsperɪti/" },
  { id: 65, english: "reconcile", hebrew: "לפייס; להתאים", pos: "verb", phonetic: "/ˈrekənsaɪl/" },
  { id: 66, english: "sufficient", hebrew: "מספיק", pos: "adj", phonetic: "/səˈfɪʃənt/" },
  { id: 67, english: "terminate", hebrew: "לסיים, להפסיק", pos: "verb", phonetic: "/ˈtɜːrmɪneɪt/" },
  { id: 68, english: "wisdom", hebrew: "חוכמה", pos: "noun", phonetic: "/ˈwɪzdəm/" },
  { id: 69, english: "adequate", hebrew: "מספיק, הולם", pos: "adj", phonetic: "/ˈædɪkwət/" },
  { id: 70, english: "compulsory", hebrew: "חובה", pos: "adj", phonetic: "/kəmˈpʌlsəri/" },
  { id: 71, english: "concise", hebrew: "תמציתי", pos: "adj", phonetic: "/kənˈsaɪs/" },
  { id: 72, english: "conspicuous", hebrew: "בולט לעין", pos: "adj", phonetic: "/kənˈspɪkjuəs/" },
  { id: 73, english: "courteous", hebrew: "אדיב, מנומס", pos: "adj", phonetic: "/ˈkɜːrtiəs/" },
  { id: 74, english: "distinctive", hebrew: "ייחודי, מובחן", pos: "adj", phonetic: "/dɪˈstɪŋktɪv/" },
  { id: 75, english: "drought", hebrew: "בצורת", pos: "noun", phonetic: "/draʊt/" },
  { id: 76, english: "eloquent", hebrew: "רהוט, נואם", pos: "adj", phonetic: "/ˈeləkwənt/" },
  { id: 77, english: "elude", hebrew: "להתחמק מ-", pos: "verb", phonetic: "/ɪˈluːd/" },
  { id: 78, english: "potent", hebrew: "חזק, עוצמתי", pos: "adj", phonetic: "/ˈpoʊtənt/" },
  { id: 79, english: "prejudice", hebrew: "דעה קדומה", pos: "noun", phonetic: "/ˈpredʒudɪs/" },
  { id: 80, english: "prevalent", hebrew: "נפוץ, שכיח", pos: "adj", phonetic: "/ˈprevələnt/" },
  { id: 81, english: "scarce", hebrew: "נדיר, מועט", pos: "adj", phonetic: "/skers/" },
  { id: 82, english: "timid", hebrew: "ביישן, פחדן", pos: "adj", phonetic: "/ˈtɪmɪd/" },
  { id: 83, english: "triumph", hebrew: "ניצחון", pos: "noun", phonetic: "/ˈtraɪʌmf/" },
  { id: 84, english: "verdict", hebrew: "פסק דין", pos: "noun", phonetic: "/ˈvɜːrdɪkt/" },
  { id: 85, english: "welfare", hebrew: "רווחה", pos: "noun", phonetic: "/ˈwelfer/" },
  { id: 86, english: "ample", hebrew: "מספיק, רב", pos: "adj", phonetic: "/ˈæmpəl/" },
  { id: 87, english: "bolster", hebrew: "לחזק", pos: "verb", phonetic: "/ˈboʊlstər/" },
  { id: 88, english: "cope", hebrew: "להתמודד", pos: "verb", phonetic: "/koʊp/" },
  { id: 89, english: "cultivate", hebrew: "לטפח, לגדל", pos: "verb", phonetic: "/ˈkʌltɪveɪt/" },
  { id: 90, english: "despise", hebrew: "לבוז", pos: "verb", phonetic: "/dɪˈspaɪz/" },
  { id: 91, english: "devoid", hebrew: "נטול, חסר", pos: "adj", phonetic: "/dɪˈvɔɪd/" },
  { id: 92, english: "expedite", hebrew: "לזרז", pos: "verb", phonetic: "/ˈekspɪdaɪt/" },
  { id: 93, english: "fertile", hebrew: "פורה", pos: "adj", phonetic: "/ˈfɜːrtaɪl/" },
  { id: 94, english: "foresee", hebrew: "לחזות", pos: "verb", phonetic: "/fɔːrˈsiː/" },
  { id: 95, english: "grief", hebrew: "אבל, צער", pos: "noun", phonetic: "/ɡriːf/" },
  { id: 96, english: "heed", hebrew: "לשים לב", pos: "verb", phonetic: "/hiːd/" },
  { id: 97, english: "resilient", hebrew: "עמיד, גמיש", pos: "adj", phonetic: "/rɪˈzɪliənt/" },
  { id: 98, english: "scrutinize", hebrew: "לבחון בקפידה", pos: "verb", phonetic: "/ˈskruːtɪnaɪz/" },
  { id: 99, english: "subsequent", hebrew: "עוקב, הבא", pos: "adj", phonetic: "/ˈsʌbsɪkwənt/" },
  { id: 100, english: "tentative", hebrew: "זמני, ניסיוני", pos: "adj", phonetic: "/ˈtentətɪv/" },
];

// Material Icon component
const Icon = ({ name, size = 24, fill = false, style = {} }) => (
  <span 
    className="material-symbols-outlined" 
    style={{ 
      fontSize: size, 
      fontVariationSettings: fill ? "'FILL' 1" : "'FILL' 0",
      ...style 
    }}
  >
    {name}
  </span>
);

const App = () => {
  const [view, setView] = useState('home');
  const [stats, setStats] = useState({});
  const [session, setSession] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState(null);
  const [opts, setOpts] = useState([]);
  const [results, setResults] = useState({ correct: 0, incorrect: 0 });
  const [mode, setMode] = useState('flash');

  useEffect(() => {
    const s = localStorage.getItem('wm');
    if (s) setStats(JSON.parse(s));
  }, []);

  const save = (s) => { setStats(s); localStorage.setItem('wm', JSON.stringify(s)); };

  const priority = useCallback((w) => {
    const s = stats[w.id] || { c: 0, i: 0, l: 0 };
    return (s.i * 3) - s.c - (s.l * 2);
  }, [stats]);

  const start = (m, n = 10) => {
    setMode(m);
    const sorted = [...WORDS].sort((a, b) => priority(b) - priority(a));
    const sel = sorted.slice(0, n).sort(() => Math.random() - 0.5);
    setSession(sel);
    setIdx(0);
    setFlipped(false);
    setSelected(null);
    setResults({ correct: 0, incorrect: 0 });
    if (m === 'quiz') makeOpts(sel[0]);
    setView('study');
  };

  const makeOpts = (w) => {
    const others = WORDS.filter(x => x.id !== w.id).sort(() => Math.random() - 0.5).slice(0, 3);
    setOpts([{ t: w.hebrew, ok: true }, ...others.map(x => ({ t: x.hebrew, ok: false }))].sort(() => Math.random() - 0.5));
  };

  const answer = (ok) => {
    const w = session[idx];
    const s = stats[w.id] || { c: 0, i: 0, l: 0 };
    save({ ...stats, [w.id]: { c: s.c + (ok ? 1 : 0), i: s.i + (ok ? 0 : 1), l: ok ? Math.min(s.l + 1, 5) : Math.max(s.l - 1, 0) } });
    setResults(p => ({ correct: p.correct + (ok ? 1 : 0), incorrect: p.incorrect + (ok ? 0 : 1) }));
    setFlipped(true);
  };

  const next = () => {
    if (idx < session.length - 1) {
      const n = idx + 1;
      setIdx(n);
      setFlipped(false);
      setSelected(null);
      if (mode === 'quiz') makeOpts(session[n]);
    } else setView('results');
  };

  const info = {
    total: WORDS.length,
    learned: Object.keys(stats).length,
    mastered: Object.values(stats).filter(s => s.l >= 4).length,
    acc: (() => { const c = Object.values(stats).reduce((a, s) => a + s.c, 0); const i = Object.values(stats).reduce((a, s) => a + s.i, 0); return c + i > 0 ? Math.round((c / (c + i)) * 100) : 0; })()
  };

  const gradient = 'linear-gradient(135deg, #fb923c, #ec4899, #9333ea)';
  const C = { bg: '#121212', surface: '#1e1e1e', border: '#2a2a2a', text: '#EDEDED', muted: '#9ca3af', dim: '#6b7280', pink: '#ec4899', purple: '#8B5CF6', orange: '#fb923c', green: '#22c55e', red: '#ef4444' };

  // HOME
  if (view === 'home') return (
    <div dir="rtl" style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Rubik, system-ui, sans-serif', paddingBottom: 100 }}>
      <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      
      <header style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(18,18,18,0.9)', backdropFilter: 'blur(12px)', padding: '24px 20px 8px', borderBottom: `1px solid ${C.border}50` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: C.muted, fontSize: 12, fontWeight: 500, letterSpacing: 0.5, margin: 0 }}>ערב טוב 👋</p>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: '2px 0 0', color: 'white' }}>מוכן ללמוד?</h1>
          </div>
          <button style={{ width: 40, height: 40, borderRadius: '50%', background: C.surface, border: `1px solid ${C.border}`, color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="settings" size={20} />
          </button>
        </div>
      </header>

      <main style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Stats */}
        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, padding: 12, opacity: 0.1 }}>
              <Icon name="school" size={40} style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>{info.learned}</span>
              <span style={{ fontSize: 12, color: C.muted, fontFamily: 'Manrope' }}>/ {info.total}</span>
            </div>
            <p style={{ color: C.muted, fontSize: 12, fontWeight: 500, marginTop: 4 }}>מילים שנלמדו</p>
            <div style={{ marginTop: 16, height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, width: `${(info.learned / info.total) * 100}%`, background: 'linear-gradient(to left, #fb923c, #ec4899, #9333ea)' }} />
            </div>
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, padding: 12, opacity: 0.1 }}>
              <Icon name="assignment" size={40} style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
            </div>
            <span style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Manrope' }}>{info.mastered}</span>
            <p style={{ color: C.muted, fontSize: 12, fontWeight: 500, marginTop: 4 }}>מילים שנשלטו</p>
            <div style={{ marginTop: 16 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.orange, background: 'rgba(251,146,60,0.1)', padding: '4px 8px', borderRadius: 16, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Icon name="trending_up" size={14} /> {info.acc}% דיוק
              </span>
            </div>
          </div>
        </section>

        {/* Continue Card */}
        <section onClick={() => start('flash', 10)} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}`, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
          <div style={{ position: 'absolute', inset: 0, background: C.surface }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(147,51,234,0.1), rgba(236,72,153,0.05), transparent)' }} />
          <div style={{ position: 'absolute', top: 0, width: '100%', height: 1, background: gradient, opacity: 0.7 }} />
          <div style={{ position: 'relative', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: 'linear-gradient(to right, rgba(251,146,60,0.2), rgba(236,72,153,0.2))', color: C.orange, border: '1px solid rgba(251,146,60,0.2)', marginBottom: 6 }}>המשך ללמוד</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px', color: 'white' }}>אוצר מילים מתקדם</h3>
              <p style={{ color: C.muted, fontSize: 14, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="style" size={14} /> נותרו {info.total - info.learned} כרטיסים
              </p>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(236,72,153,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Icon name="play_arrow" size={24} fill style={{ color: 'white' }} />
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 0, width: '100%', height: 2, background: C.border }}>
            <div style={{ height: '100%', width: '66%', background: gradient }} />
          </div>
        </section>

        {/* Modules */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 4px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', margin: 0 }}>מודולי למידה</h2>
            <button style={{ fontSize: 12, fontWeight: 600, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>הצג הכל</button>
          </div>
          {[
            { icon: 'style', title: 'אוצר מילים', desc: 'מילים נפוצות בבחינת אמירנט', color: C.pink, m: 'flash', n: 10 },
            { icon: 'edit_note', title: 'השלמת משפטים', desc: 'תרגול שיבוץ מילים בהקשר', color: C.purple, m: 'quiz', n: 10 },
            { icon: 'replay', title: 'חזרה מהירה', desc: 'מילים שטעית בהן', color: C.orange, m: 'flash', n: 20 },
            { icon: 'menu_book', title: 'אימון אינטנסיבי', desc: '20 מילים ברצף', color: '#818cf8', m: 'flash', n: 20 },
          ].map((item, i) => (
            <button key={i} onClick={() => start(item.m, item.n)} style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', padding: 16, marginBottom: 12, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, color: C.text, cursor: 'pointer', textAlign: 'right', transition: 'background 0.2s' }}>
              <div style={{ width: 48, height: 48, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
                <Icon name={item.icon} size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontWeight: 600, fontSize: 15, color: 'white' }}>{item.title}</h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: C.muted }}>{item.desc}</p>
              </div>
              <Icon name="chevron_right" size={20} style={{ color: C.muted, transform: 'rotate(180deg)' }} />
            </button>
          ))}
        </section>

        {/* Daily Goal */}
        <div style={{ textAlign: 'center', padding: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 24, background: C.surface, border: `1px solid ${C.border}`, fontSize: 12, color: C.muted }}>
            <Icon name="flag" size={16} style={{ color: C.orange }} />
            יעד יומי: 20 מילים <span style={{ color: 'white', margin: '0 4px' }}>•</span> נלמדו {Math.min(info.learned, 20)}
          </span>
        </div>
      </main>

      {/* Nav */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(18,18,18,0.85)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${C.border}50`, padding: '8px 8px 24px', zIndex: 50 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 64 }}>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: 'white' }}>
            <Icon name="home" size={24} fill style={{ background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} />
            <span style={{ fontSize: 10, fontWeight: 700, background: gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ראשי</span>
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: C.muted }}>
            <Icon name="style" size={24} />
            <span style={{ fontSize: 10 }}>מילים</span>
          </button>
          <button onClick={() => start('flash', 10)} style={{ width: 56, height: 56, borderRadius: '50%', background: gradient, border: `4px solid ${C.bg}`, cursor: 'pointer', marginTop: -32, boxShadow: '0 0 24px rgba(236,72,153,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="bolt" size={28} style={{ color: 'white' }} />
          </button>
          <button onClick={() => start('quiz', 10)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: C.muted }}>
            <Icon name="quiz" size={24} />
            <span style={{ fontSize: 10 }}>תרגול</span>
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: C.muted }}>
            <Icon name="bar_chart" size={24} />
            <span style={{ fontSize: 10 }}>מדדים</span>
          </button>
        </div>
      </nav>
    </div>
  );

  // FLASHCARD
  if (view === 'study' && mode === 'flash') {
    const w = session[idx];
    if (!w) return null;
    const prog = ((idx + 1) / session.length) * 100;
    return (
      <div dir="rtl" style={{ minHeight: '100vh', background: '#1a1a1a', color: C.text, fontFamily: 'Rubik, system-ui', display: 'flex', flexDirection: 'column' }}>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(26,26,26,0.95)', backdropFilter: 'blur(8px)' }}>
          <button onClick={() => setView('home')} style={{ width: 40, height: 40, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="arrow_forward" size={24} style={{ color: '#d1d5db' }} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 2, margin: '0 0 4px' }}>אוצר מילים</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{idx + 1}</span>
              <div style={{ width: 80, height: 4, background: '#282828', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 2, width: `${prog}%`, background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }} />
              </div>
              <span style={{ fontSize: 12, color: '#4b5563' }}>{session.length}</span>
            </div>
          </div>
          <button style={{ width: 40, height: 40, borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="more_horiz" size={24} style={{ color: '#d1d5db' }} />
          </button>
        </header>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 256, height: 256, background: 'rgba(139,92,246,0.1)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
          
          <div onClick={() => !flipped && setFlipped(true)} style={{ width: '100%', maxWidth: 340, aspectRatio: '3/4', background: '#282828', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', padding: 32, cursor: 'pointer', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
              <div style={{ padding: '6px 12px', borderRadius: 16, background: '#1a1a1a', border: '1px solid #333', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8B5CF6' }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1 }}>{w.pos}</span>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <Icon name="volume_up" size={20} style={{ color: '#6b7280' }} />
              </button>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }} dir="ltr">
              {!flipped ? (
                <>
                  <h1 style={{ fontSize: 42, fontWeight: 500, margin: '0 0 12px', fontFamily: 'Manrope, sans-serif', color: 'white', letterSpacing: -0.5 }}>{w.english}</h1>
                  <p style={{ fontSize: 18, color: '#6b7280', fontFamily: 'monospace', fontWeight: 300 }}>{w.phonetic}</p>
                </>
              ) : (
                <>
                  <h1 style={{ fontSize: 36, fontWeight: 700, margin: '0 0 16px' }} dir="rtl">{w.hebrew}</h1>
                  <p style={{ fontSize: 20, color: '#9ca3af', fontFamily: 'Manrope' }}>{w.english}</p>
                </>
              )}
            </div>
            <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid #33333380', textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: '#4b5563', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: 0.6 }}>
                <Icon name="touch_app" size={14} /> {!flipped ? 'הקש להיפוך' : 'בחר אם ידעת'}
              </p>
            </div>
          </div>

          <div style={{ width: '100%', maxWidth: 340, marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!flipped ? (
              <button onClick={() => setFlipped(true)} style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', color: 'white', fontSize: 16, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(236,72,153,0.2)' }}>
                <Icon name="sync_alt" size={20} /> הצג הגדרה
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => { answer(false); next(); }} style={{ flex: 1, padding: 16, borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: C.red, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Icon name="close" size={18} /> לא ידעתי
                </button>
                <button onClick={() => { answer(true); next(); }} style={{ flex: 1, padding: 16, borderRadius: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: C.green, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Icon name="check" size={18} /> ידעתי
                </button>
              </div>
            )}
            {!flipped && (
              <button onClick={() => { answer(true); next(); }} style={{ width: '100%', padding: 16, borderRadius: 12, background: '#282828', border: '1px solid #333', color: '#d1d5db', fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Icon name="check_circle" size={18} style={{ color: '#8B5CF6', opacity: 0 }} /> אני מכיר
              </button>
            )}
          </div>
        </main>

        <nav style={{ background: 'rgba(26,26,26,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid #333', padding: '8px 24px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setView('home')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: '#6b7280' }}>
            <Icon name="home" size={24} />
            <span style={{ fontSize: 10, letterSpacing: 0.5 }}>בית</span>
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: '#8B5CF6', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 6, height: 6, background: '#8B5CF6', borderRadius: '50%' }} />
            <Icon name="style" size={24} fill style={{ color: '#8B5CF6' }} />
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: '#8B5CF6' }}>ערכות</span>
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: '#6b7280' }}>
            <Icon name="bar_chart" size={24} />
            <span style={{ fontSize: 10, letterSpacing: 0.5 }}>מדדים</span>
          </button>
          <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', padding: 8, cursor: 'pointer', color: '#6b7280' }}>
            <Icon name="person" size={24} />
            <span style={{ fontSize: 10, letterSpacing: 0.5 }}>פרופיל</span>
          </button>
        </nav>
      </div>
    );
  }

  // QUIZ
  if (view === 'study' && mode === 'quiz') {
    const w = session[idx];
    if (!w) return null;
    const prog = ((idx + 1) / session.length) * 100;
    return (
      <div style={{ minHeight: '100vh', background: '#191919', color: C.text, fontFamily: 'Manrope, system-ui', display: 'flex', flexDirection: 'column' }}>
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
        
        <header style={{ background: 'rgba(25,25,25,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #2f2f2f50' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px', height: 56 }}>
            <button onClick={() => setView('home')} style={{ width: 40, height: 40, borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="close" size={24} style={{ color: '#9ca3af' }} />
            </button>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: '#6b7280' }}>AMIRNET EXAM</span>
              <p style={{ margin: '4px 0 0', fontSize: 12, fontWeight: 600, color: 'white' }}>Question {idx + 1} of {session.length}</p>
            </div>
            <button style={{ width: 40, height: 40, borderRadius: '50%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="bookmark_border" size={24} style={{ color: '#9ca3af' }} />
            </button>
          </div>
          <div style={{ width: '100%', height: 2, background: '#2f2f2f50' }}>
            <div style={{ height: '100%', width: `${prog}%`, background: 'linear-gradient(to left, #8B5CF6, #EC4899, #F97316)', boxShadow: '0 0 12px rgba(139,92,246,0.4)', transition: 'width 0.5s' }} />
          </div>
        </header>

        <main style={{ flex: 1, padding: 24, maxWidth: 448, margin: '0 auto', width: '100%' }} dir="ltr">
          <section style={{ marginTop: 8, textAlign: 'left' }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.6, color: 'rgba(255,255,255,0.95)', margin: 0 }}>
              The word "<span style={{ background: 'linear-gradient(to right, #a78bfa, #f472b6, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 700 }}>{w.english}</span>" means:
            </h2>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }} dir="rtl">
            {opts.map((o, i) => {
              const letter = ['A', 'B', 'C', 'D'][i];
              const sel = selected === i;
              let bg = '#232323', brd = '#2f2f2f';
              if (flipped) {
                if (o.ok) { bg = 'rgba(34,197,94,0.1)'; brd = C.green; }
                else if (sel) { bg = 'rgba(239,68,68,0.1)'; brd = C.red; }
              } else if (sel) { bg = '#2a2a2a'; brd = 'transparent'; }
              return (
                <button key={i} onClick={() => { if (!flipped) { setSelected(i); answer(o.ok); } }} disabled={flipped} style={{ display: 'flex', alignItems: 'center', padding: 14, borderRadius: 12, background: bg, border: sel && !flipped ? '1px solid transparent' : `1px solid ${brd}`, cursor: flipped ? 'default' : 'pointer', position: 'relative', backgroundClip: 'padding-box' }}>
                  {sel && !flipped && <div style={{ position: 'absolute', inset: -1, borderRadius: 13, padding: 1, background: 'linear-gradient(to right, #8B5CF6, #EC4899, #F97316)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none' }} />}
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: sel ? 'none' : '1.5px solid #6b728080', background: sel ? 'linear-gradient(135deg, #8B5CF6, #EC4899, #F97316)' : 'transparent', marginLeft: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: sel ? '#a78bfa' : '#6b728080', width: 16, marginLeft: 12 }}>{letter}</span>
                  <span style={{ fontSize: 17, fontWeight: 500, color: sel ? 'white' : '#e5e5e5' }}>{o.t}</span>
                </button>
              );
            })}
          </section>
        </main>

        <footer style={{ background: 'rgba(25,25,25,0.8)', backdropFilter: 'blur(20px)', borderTop: '1px solid #2f2f2f50', padding: '16px 16px 32px' }} dir="ltr">
          <div style={{ maxWidth: 448, margin: '0 auto' }}>
            <button onClick={next} disabled={!flipped} style={{ width: '100%', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, background: 'linear-gradient(to right, #7c3aed, #db2777, #ea580c)', border: 'none', color: 'white', fontSize: 17, fontWeight: 700, letterSpacing: 0.5, cursor: flipped ? 'pointer' : 'default', opacity: flipped ? 1 : 0.5, boxShadow: '0 8px 24px rgba(124,58,237,0.25)' }}>
              Check Answer <Icon name="arrow_forward" size={20} />
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // RESULTS
  if (view === 'results') {
    const total = results.correct + results.incorrect;
    const pct = total > 0 ? Math.round((results.correct / total) * 100) : 0;
    const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '⭐' : pct >= 50 ? '💪' : '📚';
    const msg = pct >= 90 ? 'מצוין! שליטה מרשימה!' : pct >= 70 ? 'כל הכבוד!' : pct >= 50 ? 'לא רע!' : 'המשך להתאמן!';
    return (
      <div dir="rtl" style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Rubik, system-ui', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
        <div style={{ fontSize: 80, marginBottom: 24 }}>{emoji}</div>
        <h2 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 8px' }}>סיום סט!</h2>
        <p style={{ color: C.muted, fontSize: 18, marginBottom: 32 }}>{msg}</p>
        <div style={{ position: 'relative', width: 160, height: 160, marginBottom: 32 }}>
          <svg style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke={C.border} strokeWidth="8" />
            <circle cx="50" cy="50" r="45" fill="none" stroke="url(#rg)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${pct * 2.83} 283`} />
            <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#EC4899" /></linearGradient></defs>
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 36, fontWeight: 700 }}>{pct}%</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 48, marginBottom: 40 }}>
          <div style={{ textAlign: 'center' }}><span style={{ fontSize: 32, color: C.green }}>✓</span><p style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 4px' }}>{results.correct}</p><span style={{ color: C.dim, fontSize: 14 }}>נכונות</span></div>
          <div style={{ textAlign: 'center' }}><span style={{ fontSize: 32, color: C.red }}>✗</span><p style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 4px' }}>{results.incorrect}</p><span style={{ color: C.dim, fontSize: 14 }}>שגויות</span></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
          <button onClick={() => start(mode, session.length)} style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: gradient, color: 'white', fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>תרגול נוסף</button>
          <button onClick={() => setView('home')} style={{ width: '100%', padding: 16, borderRadius: 12, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 18, fontWeight: 700, cursor: 'pointer' }}>חזרה לתפריט</button>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
