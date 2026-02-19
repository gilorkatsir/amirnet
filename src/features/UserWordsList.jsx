import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, X, Check, ListChecks, Layers, Clock, ArrowDownAZ, Languages, Trash2, SearchX, Bookmark } from 'lucide-react';
import { C } from '../styles/theme';
import { playCorrect, playIncorrect } from '../utils/sounds';
import { useUserWords } from '../contexts/UserWordsContext';

const UserWordsList = () => {
    const [, navigate] = useLocation();
    const { userWords: words, deleteWord: onDelete, updateWord: onUpdateWord } = useUserWords();
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('date'); // 'date', 'alpha', 'studied'
    const [editingId, setEditingId] = useState(null);
    const [editTranslation, setEditTranslation] = useState('');
    const [studyMode, setStudyMode] = useState(false);
    const [studyIndex, setStudyIndex] = useState(0);
    const [studyFlipped, setStudyFlipped] = useState(false);
    const [bulkSelect, setBulkSelect] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());

    // Filtered and sorted words
    const displayWords = useMemo(() => {
        let filtered = words;
        if (search) {
            const q = search.toLowerCase();
            filtered = words.filter(w =>
                w.text.toLowerCase().includes(q) ||
                (w.translation && w.translation.includes(q))
            );
        }
        return [...filtered].sort((a, b) => {
            if (sortBy === 'alpha') return a.text.localeCompare(b.text);
            if (sortBy === 'studied') return (b.translation ? 1 : 0) - (a.translation ? 1 : 0);
            return b.date - a.date; // newest first
        });
    }, [words, search, sortBy]);

    const handleSaveTranslation = (wordId) => {
        if (onUpdateWord && editTranslation.trim()) {
            onUpdateWord(wordId, { translation: editTranslation.trim() });
        }
        setEditingId(null);
        setEditTranslation('');
    };

    const handleBulkDelete = () => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`למחוק ${selectedIds.size} מילים?`)) return;
        selectedIds.forEach(id => onDelete(id));
        setSelectedIds(new Set());
        setBulkSelect(false);
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // Flashcard study mode for personal words
    if (studyMode && displayWords.length > 0) {
        const word = displayWords[studyIndex % displayWords.length];

        return (
            <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                <button onClick={() => setStudyMode(false)} style={{
                    position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: '50%',
                    background: C.surface, border: `1px solid ${C.border}`, color: C.muted, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <X size={24} />
                </button>

                <p style={{ color: C.muted, fontSize: 13, marginBottom: 20 }}>
                    {studyIndex + 1} / {displayWords.length}
                </p>

                <div
                    onClick={() => setStudyFlipped(!studyFlipped)}
                    style={{
                        width: '100%', maxWidth: 320, aspectRatio: '3/4',
                        background: '#282828', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', padding: 32,
                        cursor: 'pointer', textAlign: 'center'
                    }}
                    dir="ltr"
                >
                    {!studyFlipped ? (
                        <h1 style={{ fontSize: 36, fontWeight: 500, margin: 0, color: 'white' }}>{word.text}</h1>
                    ) : (
                        <>
                            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 12px' }} dir="rtl">
                                {word.translation || 'לא הוגדר תרגום'}
                            </h1>
                            <p style={{ fontSize: 18, color: '#9ca3af' }}>{word.text}</p>
                        </>
                    )}
                </div>

                <p style={{ fontSize: 12, color: '#4b5563', marginTop: 16 }}>
                    הקש להיפוך (Space)
                </p>

                <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                    <button
                        onClick={() => { playIncorrect(); setStudyFlipped(false); setStudyIndex(prev => prev + 1); }}
                        style={{ flex: 1, padding: 14, borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: C.red, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                        <X size={18} /> לא ידעתי
                    </button>
                    <button
                        onClick={() => { playCorrect(); setStudyFlipped(false); setStudyIndex(prev => prev + 1); }}
                        style={{ flex: 1, padding: 14, borderRadius: 12, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: C.green, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                    >
                        <Check size={18} /> ידעתי
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 10,
                background: 'rgba(18,18,18,0.95)', backdropFilter: 'blur(12px)',
                padding: '16px 20px', borderBottom: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', gap: 16
            }}>
                <button onClick={() => navigate('/')} style={{
                    width: 40, height: 40, borderRadius: '50%', background: 'transparent', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <ArrowLeft size={24} style={{ color: 'white' }} />
                </button>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'white' }}>המילים שלי</h1>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: C.muted }}>
                        {words.length} מילים שמורות
                    </p>
                </div>
                {words.length > 0 && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { setBulkSelect(!bulkSelect); setSelectedIds(new Set()); }} style={{
                            width: 36, height: 36, borderRadius: 8, background: bulkSelect ? C.purple : C.surface,
                            border: `1px solid ${C.border}`, color: bulkSelect ? 'white' : C.muted,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <ListChecks size={18} />
                        </button>
                        <button onClick={() => { setStudyMode(true); setStudyIndex(0); setStudyFlipped(false); }} style={{
                            width: 36, height: 36, borderRadius: 8, background: C.surface,
                            border: `1px solid ${C.border}`, color: C.muted,
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Layers size={18} />
                        </button>
                    </div>
                )}
            </header>

            <main style={{ flex: 1, padding: 20 }}>
                {words.length > 0 && (
                    <>
                        {/* Search */}
                        <div style={{ marginBottom: 16 }}>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="חפש מילה..."
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: 10,
                                    background: C.surface, border: `1px solid ${C.border}`,
                                    color: 'white', fontSize: 14, outline: 'none',
                                    direction: 'ltr', textAlign: 'right'
                                }}
                            />
                        </div>

                        {/* Sort */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            {[
                                { key: 'date', label: 'תאריך', Icon: Clock },
                                { key: 'alpha', label: 'א-ב', Icon: ArrowDownAZ },
                                { key: 'studied', label: 'תורגם', Icon: Languages }
                            ].map(opt => (
                                <button
                                    key={opt.key}
                                    onClick={() => setSortBy(opt.key)}
                                    style={{
                                        padding: '6px 12px', borderRadius: 16,
                                        background: sortBy === opt.key ? C.purple : C.surface,
                                        border: sortBy === opt.key ? 'none' : `1px solid ${C.border}`,
                                        color: sortBy === opt.key ? 'white' : C.muted,
                                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 4
                                    }}
                                >
                                    <opt.Icon size={14} />
                                    {opt.label}
                                </button>
                            ))}
                        </div>

                        {/* Bulk delete bar */}
                        {bulkSelect && selectedIds.size > 0 && (
                            <button
                                onClick={handleBulkDelete}
                                style={{
                                    width: '100%', padding: 12, marginBottom: 16,
                                    background: 'rgba(239,68,68,0.1)', border: `1px solid ${C.red}50`,
                                    borderRadius: 10, color: C.red, fontSize: 14, fontWeight: 600,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                }}
                            >
                                <Trash2 size={18} />
                                מחק {selectedIds.size} מילים
                            </button>
                        )}
                    </>
                )}

                {displayWords.length === 0 && words.length > 0 ? (
                    <div style={{ textAlign: 'center', marginTop: 40, color: C.muted }}>
                        <SearchX size={48} style={{ opacity: 0.5 }} />
                        <p style={{ marginTop: 12 }}>לא נמצאו מילים</p>
                    </div>
                ) : words.length === 0 ? (
                    <div style={{
                        textAlign: 'center', marginTop: 60, padding: 32,
                        background: 'rgba(255,255,255,0.03)', borderRadius: 16,
                        border: `1px solid ${C.border}`
                    }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%',
                            background: 'rgba(236, 72, 153, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}>
                            <Bookmark size={32} style={{ color: C.pink }} />
                        </div>
                        <h3 style={{ margin: '0 0 8px', color: 'white' }}>עדיין אין מילים שמורות</h3>
                        <p style={{ margin: 0, color: C.muted, lineHeight: 1.5, fontSize: 14 }}>
                            כשתתקל במילים לא מוכרות במהלך התרגול,
                            <br />
                            תוכל לשמור אותן כאן לחזרה.
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {displayWords.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    background: C.surface,
                                    border: `1px solid ${selectedIds.has(item.id) ? C.purple : C.border}`,
                                    borderRadius: 12, padding: 16
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        {bulkSelect && (
                                            <button
                                                onClick={() => toggleSelect(item.id)}
                                                style={{
                                                    width: 24, height: 24, borderRadius: 6,
                                                    background: selectedIds.has(item.id) ? C.purple : 'transparent',
                                                    border: `2px solid ${selectedIds.has(item.id) ? C.purple : C.border}`,
                                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                            >
                                                {selectedIds.has(item.id) && <Check size={14} style={{ color: 'white' }} />}
                                            </button>
                                        )}
                                        <div>
                                            <h3 style={{ margin: '0 0 2px', fontSize: 18, fontWeight: 600, color: 'white', letterSpacing: 0.5 }} dir="ltr">
                                                {item.text}
                                            </h3>
                                            <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
                                                {new Date(item.date).toLocaleDateString('he-IL')}
                                            </p>
                                        </div>
                                    </div>
                                    {!bulkSelect && (
                                        <button
                                            onClick={() => {
                                                if (window.confirm('למחוק את המילה מהרשימה?')) onDelete(item.id);
                                            }}
                                            style={{
                                                width: 36, height: 36, borderRadius: 8,
                                                background: 'rgba(239, 68, 68, 0.1)', border: 'none',
                                                color: C.red, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>

                                {/* Translation row */}
                                <div style={{ marginTop: 8 }}>
                                    {editingId === item.id ? (
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <input
                                                type="text"
                                                value={editTranslation}
                                                onChange={(e) => setEditTranslation(e.target.value)}
                                                placeholder="הקלד תרגום..."
                                                autoFocus
                                                style={{
                                                    flex: 1, padding: '8px 12px', borderRadius: 8,
                                                    background: C.bg, border: `1px solid ${C.border}`,
                                                    color: 'white', fontSize: 14, outline: 'none'
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveTranslation(item.id);
                                                    if (e.key === 'Escape') setEditingId(null);
                                                }}
                                            />
                                            <button
                                                onClick={() => handleSaveTranslation(item.id)}
                                                style={{
                                                    padding: '0 14px', borderRadius: 8,
                                                    background: C.purple, border: 'none',
                                                    color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                                                }}
                                            >
                                                שמור
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setEditingId(item.id);
                                                setEditTranslation(item.translation || '');
                                            }}
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                padding: '4px 0', color: item.translation ? C.text : C.muted,
                                                fontSize: 14, display: 'flex', alignItems: 'center', gap: 6
                                            }}
                                            dir="rtl"
                                        >
                                            <Languages size={14} style={{ color: C.muted }} />
                                            {item.translation || 'הוסף תרגום לעברית...'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserWordsList;
