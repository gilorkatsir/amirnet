import React from 'react';
import { useLocation } from 'wouter';
import { ArrowRight, Shield } from 'iconsax-react';
import { C, GLASS } from '../styles/theme';

/**
 * Privacy Policy Page — מדיניות פרטיות
 * Full Hebrew privacy policy for AmirNet, compliant with Israeli Privacy Protection Law
 */
const PrivacyPolicy = () => {
    const [, navigate] = useLocation();

    const Section = ({ title, children }) => (
        <section style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 12 }}>{title}</h2>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: C.muted }}>{children}</div>
        </section>
    );

    return (
        <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
            {/* Header */}
            <header style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                ...GLASS.header
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
                    <ArrowRight size={24} color={C.muted} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Shield size={20} color={C.purple} />
                    <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: C.text }}>
                        מדיניות פרטיות
                    </h1>
                </div>
            </header>

            <main style={{ padding: 20, paddingBottom: 80 }}>
                <p style={{ color: C.dim, fontSize: 12, marginBottom: 28 }}>
                    עודכן לאחרונה: 20 בפברואר 2026
                </p>

                {/* 1. מבוא */}
                <Section title="1. מבוא">
                    <p>
                        ברוכים הבאים ל-AmirNet (להלן: <strong style={{ color: C.text }}>"האפליקציה"</strong> או <strong style={{ color: C.text }}>"השירות"</strong>).
                        AmirNet היא אפליקציית אינטרנט להכנה למקטע האנגלית של הבחינה הפסיכומטרית הישראלית.
                    </p>
                    <p>
                        מדיניות פרטיות זו מתארת כיצד אנו אוספים, משתמשים, מאחסנים ומגנים על המידע האישי שלך
                        בהתאם לחוק הגנת הפרטיות, התשמ"א-1981, ותקנות הגנת הפרטיות (אבטחת מידע), התשע"ז-2017.
                    </p>
                    <p>
                        <strong style={{ color: C.text }}>בעל השליטה במידע (Data Controller):</strong> AmirNet.
                    </p>
                    <p>
                        השימוש באפליקציה מהווה הסכמה לתנאי מדיניות פרטיות זו. אם אינך מסכים לתנאים אלה,
                        אנא הימנע משימוש באפליקציה.
                    </p>
                </Section>

                {/* 2. המידע שאנו אוספים */}
                <Section title="2. המידע שאנו אוספים">
                    <p>
                        אנו אוספים את סוגי המידע הבאים:
                    </p>
                    <p><strong style={{ color: C.text }}>2.1 מידע שנמסר על ידך ישירות:</strong></p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>כתובת דואר אלקטרוני (בעת הרשמה באמצעות אימייל וסיסמה)</li>
                        <li>שם מלא ותמונת פרופיל (בעת התחברות באמצעות חשבון Google OAuth)</li>
                        <li>סיסמה מוצפנת (בעת הרשמה באמצעות אימייל וסיסמה; הסיסמה אינה נשמרת בגרסתה המקורית)</li>
                    </ul>
                    <p><strong style={{ color: C.text }}>2.2 מידע שנאסף באופן אוטומטי:</strong></p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>נתוני התקדמות בלמידה: מילים שנלמדו, תשובות נכונות ושגויות, ציוני מבחנים</li>
                        <li>תאריך ושעת כניסה אחרונה</li>
                        <li>מזהה משתמש ייחודי (UUID) שנוצר על ידי מערכת האימות</li>
                        <li>רמת מנוי (חינם/פרימיום) ונתוני צריכת מכסות יומיות</li>
                    </ul>
                    <p><strong style={{ color: C.text }}>2.3 נתוני שימוש ואנליטיקה:</strong></p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>דפים שנצפו, זמני שהייה, אינטראקציות עם האפליקציה</li>
                        <li>סוג דפדפן, מערכת הפעלה, רזולוציית מסך</li>
                        <li>מדינת גישה (ללא כתובת IP מדויקת)</li>
                    </ul>
                </Section>

                {/* 3. מטרות איסוף המידע */}
                <Section title="3. מטרות איסוף המידע">
                    <p>המידע שנאסף משמש למטרות הבאות:</p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li><strong style={{ color: C.text }}>מתן השירות:</strong> יצירת חשבון, אימות זהות, ניהול מנויים, ושמירת התקדמות הלמידה</li>
                        <li><strong style={{ color: C.text }}>התאמה אישית:</strong> הצגת שאלות ומילים מותאמות לרמת המשתמש, יצירת שאלות AI מבוססות על המילים הקשות שלך</li>
                        <li><strong style={{ color: C.text }}>אנליטיקה ושיפור השירות:</strong> הבנת דפוסי שימוש, שיפור חוויית המשתמש, תיקון שגיאות, וזיהוי בעיות ביצועים</li>
                        <li><strong style={{ color: C.text }}>תקשורת:</strong> שליחת הודעות שירות חיוניות (למשל, שינויים בתנאי השימוש)</li>
                    </ul>
                </Section>

                {/* 4. הבסיס החוקי לעיבוד */}
                <Section title="4. הבסיס החוקי לעיבוד המידע">
                    <p>אנו מעבדים את המידע שלך על בסיס:</p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li><strong style={{ color: C.text }}>הסכמה:</strong> בעת ההרשמה לשירות, אתה מסכים לאיסוף ועיבוד המידע כמתואר במדיניות זו</li>
                        <li><strong style={{ color: C.text }}>קיום חוזה:</strong> עיבוד המידע נדרש לצורך מתן השירות שהתבקש על ידך, לרבות ניהול חשבון, שמירת התקדמות, ומתן גישה לתכנים בהתאם לרמת המנוי</li>
                        <li><strong style={{ color: C.text }}>אינטרס לגיטימי:</strong> לצורך אבטחת המערכת, מניעת שימוש לרעה, ושיפור השירות</li>
                    </ul>
                    <p>
                        באפשרותך לחזור בך מהסכמתך בכל עת באמצעות מחיקת חשבונך. חזרה מהסכמה לא תפגע
                        בחוקיות העיבוד שבוצע לפני כן.
                    </p>
                </Section>

                {/* 5. שיתוף מידע עם צדדים שלישיים */}
                <Section title="5. שיתוף מידע עם צדדים שלישיים">
                    <p>
                        אנו לא מוכרים, משכירים או סוחרים במידע האישי שלך. עם זאת, אנו משתמשים בשירותי
                        צד שלישי הנדרשים לתפעול האפליקציה:
                    </p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>
                            <strong style={{ color: C.text }}>Supabase</strong> — מערכת אימות משתמשים ומסד נתונים.
                            שומרת את פרטי ההרשמה, פרופיל המשתמש, ונתוני ההתקדמות.
                            <br />
                            <span style={{ fontSize: 12 }}>מדיניות פרטיות: supabase.com/privacy</span>
                        </li>
                        <li>
                            <strong style={{ color: C.text }}>Vercel</strong> — אירוח האפליקציה ואנליטיקה.
                            מעבדת בקשות שרת ואוספת נתוני ביצועים אנונימיים.
                            <br />
                            <span style={{ fontSize: 12 }}>מדיניות פרטיות: vercel.com/legal/privacy-policy</span>
                        </li>
                        <li>
                            <strong style={{ color: C.text }}>OpenRouter</strong> — שירות בינה מלאכותית ליצירת שאלות תרגול מותאמות אישית.
                            מקבל רשימת מילים (ללא מידע מזהה) ומחזיר שאלות. אין העברת מידע אישי.
                            <br />
                            <span style={{ fontSize: 12 }}>מדיניות פרטיות: openrouter.ai/privacy</span>
                        </li>
                        <li>
                            <strong style={{ color: C.text }}>ElevenLabs</strong> — שירות המרת טקסט לדיבור (TTS) להשמעת מילים באנגלית.
                            מקבל טקסט בלבד (מילה או משפט), ללא מידע מזהה.
                            <br />
                            <span style={{ fontSize: 12 }}>מדיניות פרטיות: elevenlabs.io/privacy</span>
                        </li>
                        <li>
                            <strong style={{ color: C.text }}>Google</strong> — שירות OAuth להתחברות מהירה.
                            מקבלים ממנו שם, אימייל ותמונת פרופיל בלבד, בכפוף להסכמתך.
                        </li>
                    </ul>
                    <p>
                        כל ספקי השירות הנ"ל מחויבים לשמור על סודיות המידע ולעבדו אך ורק למטרות
                        האמורות לעיל.
                    </p>
                </Section>

                {/* 6. העברת מידע מחוץ לישראל */}
                <Section title="6. העברת מידע מחוץ לישראל">
                    <p>
                        חלק מספקי השירות שלנו (Supabase, Vercel, OpenRouter, ElevenLabs) מפעילים שרתים
                        מחוץ לישראל, לרבות בארצות הברית ובאירופה.
                    </p>
                    <p>
                        העברת מידע מחוץ לישראל נעשית בהתאם לסעיף 36 לחוק הגנת הפרטיות ובכפוף לכך
                        שספקי השירות מקיימים רמת הגנה נאותה על המידע, לרבות באמצעות הסכמי עיבוד מידע
                        מתאימים וציות לתקני אבטחה מקובלים.
                    </p>
                </Section>

                {/* 7. אבטחת מידע */}
                <Section title="7. אבטחת מידע">
                    <p>
                        אנו נוקטים באמצעי אבטחה סבירים להגנה על המידע שלך:
                    </p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li><strong style={{ color: C.text }}>הצפנה:</strong> תקשורת מוצפנת באמצעות HTTPS/TLS. סיסמאות מוצפנות באמצעות bcrypt ואינן נשמרות בגרסתן המקורית</li>
                        <li><strong style={{ color: C.text }}>בקרת גישה:</strong> גישה למסד הנתונים מוגנת באמצעות מדיניות Row Level Security (RLS) שמבטיחה שכל משתמש יכול לגשת אך ורק למידע שלו</li>
                        <li><strong style={{ color: C.text }}>מפתחות API:</strong> מפתחות גישה לשירותים חיצוניים נשמרים בצד השרת בלבד (משתני סביבה) ואינם חשופים בקוד הלקוח</li>
                        <li><strong style={{ color: C.text }}>אימות:</strong> מערכת אימות מבוססת Supabase Auth עם תמיכה בטוקנים מאובטחים</li>
                    </ul>
                    <p>
                        למרות האמצעים שאנו נוקטים, אין שיטת אבטחה מושלמת. אנו ממליצים להשתמש בסיסמה
                        חזקה וייחודית ולא לשתף את פרטי ההתחברות שלך.
                    </p>
                </Section>

                {/* 8. שמירת מידע */}
                <Section title="8. שמירת מידע">
                    <p>אנו שומרים את המידע שלך בהתאם לעקרונות הבאים:</p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li><strong style={{ color: C.text }}>נתוני חשבון:</strong> נשמרים כל עוד החשבון פעיל. עם מחיקת החשבון, המידע יימחק תוך 30 יום</li>
                        <li><strong style={{ color: C.text }}>נתוני למידה והתקדמות:</strong> נשמרים כל עוד החשבון פעיל, על מנת לאפשר המשכיות בלמידה</li>
                        <li><strong style={{ color: C.text }}>נתוני אנליטיקה:</strong> נשמרים באופן מצטבר ואנונימי למשך 24 חודשים</li>
                        <li><strong style={{ color: C.text }}>נתונים מקומיים:</strong> חלק מהנתונים נשמרים ב-localStorage בדפדפן שלך. ניתן למחוק אותם בכל עת דרך הגדרות הדפדפן או דרך מסך ההגדרות באפליקציה</li>
                    </ul>
                </Section>

                {/* 9. זכויות המשתמש */}
                <Section title="9. זכויות המשתמש">
                    <p>
                        בהתאם לחוק הגנת הפרטיות, עומדות לך הזכויות הבאות בנוגע למידע האישי שלך:
                    </p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li><strong style={{ color: C.text }}>זכות עיון:</strong> הזכות לקבל מידע על המידע האישי שאנו מחזיקים אודותיך</li>
                        <li><strong style={{ color: C.text }}>זכות תיקון:</strong> הזכות לתקן מידע שגוי או לא מדויק</li>
                        <li><strong style={{ color: C.text }}>זכות מחיקה:</strong> הזכות לבקש מחיקת המידע האישי שלך ומחיקת חשבונך</li>
                        <li><strong style={{ color: C.text }}>זכות הגבלה:</strong> הזכות לבקש הגבלת עיבוד המידע שלך</li>
                        <li><strong style={{ color: C.text }}>זכות ניידות:</strong> הזכות לקבל את המידע שלך בפורמט מובנה ומכונה-קריא</li>
                        <li><strong style={{ color: C.text }}>זכות התנגדות:</strong> הזכות להתנגד לעיבוד המידע למטרות שיווק ישיר</li>
                    </ul>
                    <p>
                        לצורך מימוש זכויותיך, ניתן לפנות אלינו בכתובת האימייל המפורטת בסעיף "יצירת קשר" להלן.
                        נשיב לפנייתך תוך 30 יום ממועד קבלתה.
                    </p>
                </Section>

                {/* 10. עוגיות וטכנולוגיות מעקב */}
                <Section title="10. עוגיות וטכנולוגיות מעקב">
                    <p>האפליקציה משתמשת בסוגי העוגיות הבאים:</p>
                    <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                        <li>
                            <strong style={{ color: C.text }}>עוגיות חיוניות:</strong> עוגיות הנדרשות לתפקוד מערכת האימות
                            ולשמירת מצב ההתחברות שלך. ללא עוגיות אלה, לא ניתן יהיה להשתמש בשירות
                        </li>
                        <li>
                            <strong style={{ color: C.text }}>אנליטיקה (Vercel Analytics):</strong> איסוף נתונים אנונימיים על ביצועי האפליקציה
                            ודפוסי שימוש. אין שימוש בעוגיות צד שלישי למטרות פרסום
                        </li>
                    </ul>
                    <p>
                        בנוסף, האפליקציה משתמשת ב-localStorage של הדפדפן לשמירת הגדרות,
                        התקדמות למידה ומידע מקומי. ניתן לנהל ולמחוק נתונים אלה דרך הגדרות הדפדפן.
                    </p>
                </Section>

                {/* 11. קטינים */}
                <Section title="11. קטינים">
                    <p>
                        האפליקציה מיועדת למשתמשים מגיל <strong style={{ color: C.text }}>16 ומעלה</strong>.
                        אנו לא אוספים ביודעין מידע אישי מקטינים מתחת לגיל 16.
                    </p>
                    <p>
                        אם נודע לנו כי נאסף מידע של קטין מתחת לגיל 16 ללא הסכמת הורה או אפוטרופוס,
                        נמחק מידע זה בהקדם האפשרי. אם אתה הורה או אפוטרופוס ויש לך יסוד להאמין
                        שילדך מסר מידע אישי, אנא פנה אלינו.
                    </p>
                </Section>

                {/* 12. שינויים במדיניות */}
                <Section title="12. שינויים במדיניות">
                    <p>
                        אנו רשאים לעדכן מדיניות פרטיות זו מעת לעת. שינויים מהותיים יפורסמו באפליקציה
                        ויצוינו בתאריך העדכון בראש מסמך זה.
                    </p>
                    <p>
                        המשך השימוש באפליקציה לאחר עדכון המדיניות מהווה הסכמה לשינויים.
                        אנו ממליצים לעיין במדיניות זו מעת לעת.
                    </p>
                </Section>

                {/* 13. יצירת קשר */}
                <Section title="13. יצירת קשר">
                    <p>
                        לכל שאלה, בקשה או תלונה בנוגע למדיניות פרטיות זו או לעיבוד המידע האישי שלך,
                        ניתן לפנות אלינו:
                    </p>
                    <div style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 12,
                        padding: 16,
                        marginTop: 12,
                        marginBottom: 16
                    }}>
                        <p style={{ margin: '0 0 8px', fontSize: 14 }}>
                            <strong style={{ color: C.text }}>דוא"ל:</strong>{' '}
                            <a href="mailto:support@amirnet.app" style={{ color: C.purple, textDecoration: 'none' }}>
                                support@amirnet.app
                            </a>
                        </p>
                    </div>
                    <p>
                        בנוסף, עומדת לך הזכות להגיש תלונה לרשות להגנת הפרטיות (הממונה על הגנת הפרטיות)
                        במשרד המשפטים:
                    </p>
                    <div style={{
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: 12,
                        padding: 16,
                        marginTop: 12
                    }}>
                        <p style={{ margin: '0 0 4px', fontSize: 14 }}>
                            <strong style={{ color: C.text }}>הרשות להגנת הפרטיות</strong>
                        </p>
                        <p style={{ margin: '0 0 4px', fontSize: 13, color: C.muted }}>
                            אתר: www.gov.il/he/departments/the_privacy_protection_authority
                        </p>
                    </div>
                </Section>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
