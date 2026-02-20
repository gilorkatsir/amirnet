import React from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, FileText } from 'lucide-react';
import { C } from '../styles/theme';

/**
 * Terms of Service Page — תנאי שימוש
 * Full Hebrew terms of service for AmirNet, compliant with Israeli Consumer Protection Law
 */
const TermsOfService = () => {
    const [, navigate] = useLocation();

    const Section = ({ title, children }) => (
        <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 12 }}>{title}</h2>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: C.muted }}>{children}</div>
        </section>
    );

    return (
        <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
            {/* Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                background: 'rgba(18,18,18,0.95)',
                backdropFilter: 'blur(12px)',
                padding: '16px 20px',
                borderBottom: `1px solid ${C.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 16
            }}>
                <button
                    onClick={() => navigate('/')}
                    aria-label="חזרה לדף הבית"
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 8
                    }}
                >
                    <ArrowRight size={24} style={{ color: C.muted }} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <FileText size={20} style={{ color: C.purple }} />
                    <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'white' }}>
                        תנאי שימוש
                    </h1>
                </div>
            </header>

            <main style={{ padding: 20, paddingBottom: 80 }}>
                <p style={{ color: C.dim, fontSize: 12, marginBottom: 28 }}>
                    עודכן לאחרונה: 20 בפברואר 2026
                </p>

                {/* 1. מבוא והגדרות */}
                <Section title="1. מבוא והגדרות">
                    <p>
                        ברוכים הבאים ל-AmirNet (להלן: <strong style={{ color: 'white' }}>"האפליקציה"</strong>, <strong style={{ color: 'white' }}>"השירות"</strong> או <strong style={{ color: 'white' }}>"אנחנו"</strong>).
                        תנאי שימוש אלה (להלן: <strong style={{ color: 'white' }}>"התנאים"</strong>) מסדירים את היחסים בינך לבין AmirNet בכל הנוגע לשימוש באפליקציה.
                    </p>
                    <p>הגדרות:</p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li><strong style={{ color: 'white' }}>"משתמש"</strong> — כל אדם הגולש באפליקציה או משתמש בשירותיה</li>
                        <li><strong style={{ color: 'white' }}>"חשבון"</strong> — חשבון משתמש רשום באפליקציה</li>
                        <li><strong style={{ color: 'white' }}>"תוכן"</strong> — כל מילה, שאלה, תרגול, הקלטה, טקסט, או חומר אחר המוצג באפליקציה</li>
                        <li><strong style={{ color: 'white' }}>"מנוי"</strong> — תוכנית שימוש בתשלום המעניקה גישה לתכנים ופיצ'רים נוספים</li>
                    </ul>
                    <p>
                        השימוש באפליקציה מהווה הסכמה מלאה לתנאים אלה. אם אינך מסכים לתנאים, אנא
                        הימנע משימוש באפליקציה.
                    </p>
                </Section>

                {/* 2. תיאור השירות */}
                <Section title="2. תיאור השירות">
                    <p>
                        AmirNet היא אפליקציית אינטרנט להכנה למקטע האנגלית של הבחינה הפסיכומטרית הישראלית.
                        השירות כולל:
                    </p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>למידת אוצר מילים באנגלית עם כרטיסיות, בחנים, ותרגולים</li>
                        <li>שאלות תרגול בפורמט הבחינה (השלמת משפטים, ניסוח מחדש, הבנת הנקרא)</li>
                        <li>תרגול שמיעה (Vocal) עם הקלטות אודיו</li>
                        <li>יצירת שאלות מותאמות אישית באמצעות בינה מלאכותית (AI)</li>
                        <li>מעקב התקדמות וסטטיסטיקות</li>
                    </ul>
                    <p><strong style={{ color: 'white' }}>מגבלות החשבון החינמי:</strong></p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>גישה ל-30 מילים מתוך מאגר אוצר המילים</li>
                        <li>גישה ל-10 שאלות תרגול</li>
                        <li>שימוש אחד ביום ביצירת שאלות AI</li>
                        <li>גישה ל-4 מקטעי שמיעה</li>
                    </ul>
                    <p>
                        מנויים בתשלום מקבלים גישה מלאה לכל התכנים והפיצ'רים ללא הגבלה.
                    </p>
                </Section>

                {/* 3. הרשמה וחשבון */}
                <Section title="3. הרשמה וחשבון">
                    <p>לצורך שימוש בשירות, נדרשת הרשמה באחת מהדרכים הבאות:</p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>הרשמה באמצעות כתובת דואר אלקטרוני וסיסמה</li>
                        <li>התחברות באמצעות חשבון Google (OAuth)</li>
                    </ul>
                    <p>בעת ההרשמה, המשתמש מתחייב:</p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>להיות בן <strong style={{ color: 'white' }}>16 ומעלה</strong></li>
                        <li>לספק מידע נכון ומדויק</li>
                        <li>לשמור על סודיות פרטי ההתחברות שלו</li>
                        <li>לא ליצור יותר מחשבון אחד</li>
                        <li>להודיע לנו מיד על כל שימוש לא מורשה בחשבונו</li>
                    </ul>
                    <p>
                        המשתמש אחראי לכל פעולה שבוצעה בחשבונו. AmirNet לא תישא באחריות לנזק
                        הנובע מגישה לא מורשית לחשבון שנגרמה עקב רשלנות המשתמש.
                    </p>
                </Section>

                {/* 4. תוכניות מנוי ומחירים */}
                <Section title="4. תוכניות מנוי ומחירים">
                    <p>האפליקציה מציעה את תוכניות המנוי הבאות:</p>
                    <div style={{
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: 12,
                        padding: 16,
                        margin: '12px 0'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <th style={{ textAlign: 'right', padding: '8px 4px', color: 'white', fontWeight: 600 }}>תוכנית</th>
                                    <th style={{ textAlign: 'right', padding: '8px 4px', color: 'white', fontWeight: 600 }}>מחיר</th>
                                    <th style={{ textAlign: 'right', padding: '8px 4px', color: 'white', fontWeight: 600 }}>תקופה</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '8px 4px' }}>חינם</td>
                                    <td style={{ padding: '8px 4px' }}>&#8362;0</td>
                                    <td style={{ padding: '8px 4px' }}>ללא הגבלה</td>
                                </tr>
                                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '8px 4px' }}>חודשי</td>
                                    <td style={{ padding: '8px 4px' }}>&#8362;29.90</td>
                                    <td style={{ padding: '8px 4px' }}>חודש</td>
                                </tr>
                                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                                    <td style={{ padding: '8px 4px' }}>רבעוני</td>
                                    <td style={{ padding: '8px 4px' }}>&#8362;69.90</td>
                                    <td style={{ padding: '8px 4px' }}>3 חודשים</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px 4px' }}>שנתי</td>
                                    <td style={{ padding: '8px 4px' }}>&#8362;199.90</td>
                                    <td style={{ padding: '8px 4px' }}>שנה</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p>
                        המחירים כוללים מע"מ. AmirNet שומרת לעצמה את הזכות לעדכן את המחירים בכפוף
                        להודעה מוקדמת של 30 יום. שינוי מחיר לא יחול על תקופת מנוי שכבר שולמה.
                    </p>
                </Section>

                {/* 5. תשלום וחיוב */}
                <Section title="5. תשלום וחיוב">
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>התשלום מבוצע מראש לתקופת המנוי שנבחרה</li>
                        <li>
                            <strong style={{ color: 'white' }}>חידוש אוטומטי:</strong> המנוי מתחדש אוטומטית בתום כל תקופה,
                            בכפוף להסכמה מפורשת של המשתמש בעת הרכישה הראשונה.
                            הודעת תזכורת תישלח 7 ימים לפני החידוש
                        </li>
                        <li>ניתן לבטל את החידוש האוטומטי בכל עת דרך הגדרות החשבון</li>
                        <li>ביטול החידוש לא ישפיע על המנוי הנוכחי — הגישה תישמר עד תום התקופה ששולמה</li>
                    </ul>
                </Section>

                {/* 6. ביטול עסקה והחזר כספי */}
                <Section title="6. ביטול עסקה והחזר כספי">
                    <p>
                        בהתאם לחוק הגנת הצרכן, התשמ"א-1981 ותקנות הגנת הצרכן (ביטול עסקה), התשע"א-2010:
                    </p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>
                            <strong style={{ color: 'white' }}>תקופת צינון:</strong> ניתן לבטל את העסקה תוך <strong style={{ color: 'white' }}>14 ימים</strong> ממועד
                            הרכישה או ממועד קבלת מסמך הגילוי (המאוחר מביניהם), ובתנאי שטרם חלפו
                            מעל שני שלישים מתקופת המנוי
                        </li>
                        <li>
                            <strong style={{ color: 'white' }}>החזר יחסי (Pro-rata):</strong> בביטול במהלך תקופת הצינון, יינתן החזר יחסי
                            בניכוי התקופה שנוצלה בפועל
                        </li>
                        <li>
                            <strong style={{ color: 'white' }}>דמי ביטול:</strong> בהתאם לחוק, דמי הביטול לא יעלו על 5% ממחיר העסקה
                            או <strong style={{ color: 'white' }}>&#8362;100</strong>, הנמוך מביניהם
                        </li>
                        <li>ההחזר יבוצע באמצעי התשלום המקורי תוך 14 ימי עסקים</li>
                    </ul>
                    <p>
                        לצורך ביטול עסקה, ניתן לפנות אלינו באימייל המפורט בסעיף "יצירת קשר" להלן,
                        בצירוף פרטי החשבון ומספר העסקה.
                    </p>
                </Section>

                {/* 7. זכויות קניין רוחני */}
                <Section title="7. זכויות קניין רוחני">
                    <p>
                        כל הזכויות באפליקציה, לרבות אך לא רק:
                    </p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>קוד המקור, העיצוב, הממשק הגרפי</li>
                        <li>תוכן לימודי, שאלות, מילים, תרגומים</li>
                        <li>הקלטות אודיו</li>
                        <li>סימני מסחר, לוגו, ושם המותג AmirNet</li>
                        <li>אלגוריתמים ומודלים לימודיים</li>
                    </ul>
                    <p>
                        שייכות ל-AmirNet ומוגנות על ידי חוקי זכויות יוצרים וקניין רוחני בישראל ובעולם.
                    </p>
                    <p>
                        הרישיון שניתן למשתמש הוא רישיון אישי, לא בלעדי, שאינו ניתן להעברה,
                        לשימוש באפליקציה בהתאם לתנאים אלה בלבד.
                    </p>
                </Section>

                {/* 8. שימוש מקובל */}
                <Section title="8. שימוש מקובל">
                    <p>המשתמש מתחייב:</p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>להשתמש באפליקציה <strong style={{ color: 'white' }}>למטרות אישיות ולימודיות בלבד</strong></li>
                        <li>לא להעתיק, להפיץ, לשכפל או למכור תוכן מהאפליקציה</li>
                        <li>לא לבצע הנדסה לאחור (reverse engineering) של האפליקציה</li>
                        <li>לא לנסות לעקוף מגבלות החשבון החינמי או מערכות האבטחה</li>
                        <li>לא להשתמש בכלים אוטומטיים (bots, scrapers) לגישה לתוכן</li>
                        <li>לא לשתף את חשבונך או פרטי ההתחברות שלך עם אחרים</li>
                        <li>לא להשתמש באפליקציה באופן שעלול לפגוע בתפקודה או בחוויית משתמשים אחרים</li>
                    </ul>
                    <p>
                        הפרה של סעיף זה עלולה לגרום להשעיה או סגירה של החשבון ללא התראה מוקדמת.
                    </p>
                </Section>

                {/* 9. תוכן שנוצר בבינה מלאכותית */}
                <Section title="9. תוכן שנוצר בבינה מלאכותית (AI)">
                    <p>
                        האפליקציה מציעה יצירת שאלות תרגול באמצעות בינה מלאכותית (AI).
                        בנוגע לתכונה זו, חשוב לדעת:
                    </p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>
                            <strong style={{ color: 'white' }}>אי-דיוקים:</strong> תוכן שנוצר על ידי AI עלול להכיל שגיאות,
                            אי-דיוקים, או ניסוחים לא מושלמים. התוכן נועד לתרגול בלבד ואינו מהווה
                            תחליף לחומרי הכנה רשמיים
                        </li>
                        <li>
                            <strong style={{ color: 'white' }}>אין ערבות לתוצאות:</strong> שאלות AI הן כלי עזר ללמידה.
                            איננו מתחייבים שהתרגול ישקף במדויק את מבנה או רמת הקושי של הבחינה הפסיכומטרית
                        </li>
                        <li>
                            <strong style={{ color: 'white' }}>ספק חיצוני:</strong> שאלות AI נוצרות באמצעות שירות OpenRouter.
                            אין מידע אישי מזהה מועבר לספק זה — רק רשימת מילים לתרגול
                        </li>
                        <li>
                            <strong style={{ color: 'white' }}>מגבלת שימוש:</strong> שימוש בתכונת ה-AI כפוף למכסה יומית
                            בהתאם לרמת המנוי
                        </li>
                    </ul>
                </Section>

                {/* 10. הגבלת אחריות */}
                <Section title="10. הגבלת אחריות">
                    <p>
                        האפליקציה מסופקת <strong style={{ color: 'white' }}>"כמות שהיא" (AS IS)</strong> וללא כל מצג
                        או התחייבות מכל סוג שהוא, במפורש או מכללא.
                    </p>
                    <p>AmirNet אינה אחראית ל:</p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>תוצאות הלמידה או ציוני בחינה של המשתמש</li>
                        <li>דיוק או שלמות התוכן הלימודי</li>
                        <li>הפסקות שירות, תקלות טכניות, או אובדן נתונים</li>
                        <li>נזק ישיר, עקיף, מיוחד, או תוצאתי הנובע מהשימוש באפליקציה</li>
                        <li>פעולות של צדדים שלישיים (ספקי שירות, Google, וכד')</li>
                    </ul>
                    <p>
                        בכל מקרה, אחריות AmirNet לא תעלה על הסכום ששולם על ידי המשתמש
                        ב-12 החודשים שקדמו לאירוע.
                    </p>
                    <p>
                        <strong style={{ color: 'white' }}>חשוב:</strong> האפליקציה מהווה כלי עזר ללמידה בלבד ואינה
                        מהווה תחליף להכנה מקצועית ומקיפה לבחינה הפסיכומטרית.
                    </p>
                </Section>

                {/* 11. שינויים בשירות ובתנאים */}
                <Section title="11. שינויים בשירות ובתנאים">
                    <p>
                        AmirNet שומרת לעצמה את הזכות:
                    </p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>לעדכן, לשנות, או להפסיק תכונות באפליקציה</li>
                        <li>לעדכן תנאי שימוש אלה מעת לעת</li>
                        <li>להוסיף או להסיר תכנים לימודיים</li>
                    </ul>
                    <p>
                        שינויים מהותיים בתנאי השימוש יפורסמו באפליקציה 30 יום מראש.
                        המשך השימוש לאחר כניסת השינויים לתוקף מהווה הסכמה לתנאים המעודכנים.
                    </p>
                    <p>
                        שינויים בפיצ'רים או בתוכן הלימודי עשויים להתבצע ללא הודעה מוקדמת,
                        כחלק מהפיתוח והשיפור השוטף של השירות.
                    </p>
                </Section>

                {/* 12. סיום והשעיה */}
                <Section title="12. סיום והשעיה">
                    <p><strong style={{ color: 'white' }}>סיום על ידי המשתמש:</strong></p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>באפשרותך למחוק את חשבונך בכל עת דרך הגדרות החשבון או פנייה אלינו</li>
                        <li>עם מחיקת החשבון, כל הנתונים האישיים יימחקו תוך 30 יום</li>
                    </ul>
                    <p><strong style={{ color: 'white' }}>סיום או השעיה על ידי AmirNet:</strong></p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>AmirNet רשאית להשעות או לסגור חשבון במקרה של הפרת תנאי שימוש אלה</li>
                        <li>במקרה של השעיה בשל הפרה, לא יינתן החזר כספי על תקופת מנוי ששולמה</li>
                        <li>במקרה של סגירת השירות, יינתנו 60 ימי הודעה מוקדמת והחזר יחסי לתקופה שלא נוצלה</li>
                    </ul>
                </Section>

                {/* 13. דין חל וסמכות שיפוט */}
                <Section title="13. דין חל וסמכות שיפוט">
                    <p>
                        על תנאי שימוש אלה יחולו <strong style={{ color: 'white' }}>דיני מדינת ישראל</strong> בלבד.
                    </p>
                    <p>
                        כל סכסוך הנובע מתנאים אלה או הקשור אליהם יידון אך ורק בבתי המשפט המוסמכים
                        במחוז תל אביב-יפו.
                    </p>
                    <p>
                        הצדדים מסכימים לנסות ליישב מחלוקות בדרך של משא ומתן בתום לב לפני פנייה
                        להליכים משפטיים.
                    </p>
                </Section>

                {/* 14. יצירת קשר */}
                <Section title="14. יצירת קשר">
                    <p>
                        לכל שאלה, הערה או בקשה בנוגע לתנאי שימוש אלה, ניתן לפנות אלינו:
                    </p>
                    <div style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 12,
                        padding: 16,
                        marginTop: 12
                    }}>
                        <p style={{ margin: '0 0 8px', fontSize: 14 }}>
                            <strong style={{ color: 'white' }}>דוא"ל:</strong>{' '}
                            <a href="mailto:support@amirnet.app" style={{ color: C.purple, textDecoration: 'none' }}>
                                support@amirnet.app
                            </a>
                        </p>
                    </div>
                    <p style={{ marginTop: 24, fontSize: 13, color: C.dim }}>
                        תנאי שימוש אלה מהווים את ההסכם המלא בינך לבין AmirNet בנוגע לשימוש באפליקציה,
                        ומחליפים כל הסכם קודם, בכתב או בעל-פה, בנושא זה.
                    </p>
                </Section>
            </main>
        </div>
    );
};

export default TermsOfService;
