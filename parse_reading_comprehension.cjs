/**
 * Script to parse English Reading Comprehension data from extracted PDFs
 * and create a proper database with passages, questions, and correct answers.
 * Run with: node parse_reading_comprehension.cjs
 */
const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, 'src', 'data', 'extracted_passages.json');
const OUTPUT_FILE = path.join(__dirname, 'src', 'data', 'reading_comprehension_database.json');

// Read extracted data
const rawData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));

// Parse English answer keys from the last page of each PDF
function parseAnswerKey(text) {
    const englishSection1 = {};
    const englishSection2 = {};

    // Match אנגלית - פרק ראשון pattern followed by answer numbers
    const section1Match = text.match(/אנגלית - פרק ראשון[\s\S]*?התשובה\s*הנכונה\s*([\d\s\t]+)/);
    if (section1Match) {
        const answers = section1Match[1].trim().split(/[\s\t]+/).filter(n => n.match(/^[1-4]$/));
        answers.forEach((ans, idx) => {
            englishSection1[idx + 1] = parseInt(ans);
        });
    }

    // Match אנגלית - פרק שני pattern
    const section2Match = text.match(/אנגלית - פרק שני[\s\S]*?התשובה\s*הנכונה\s*([\d\s\t]+)/);
    if (section2Match) {
        const answers = section2Match[1].trim().split(/[\s\t]+/).filter(n => n.match(/^[1-4]$/));
        answers.forEach((ans, idx) => {
            englishSection2[idx + 1] = parseInt(ans);
        });
    }

    return { section1: englishSection1, section2: englishSection2 };
}

// Parse reading passages and questions from text
function parseReadingComprehension(pages, pdfName) {
    const results = [];
    let currentText = null;
    let currentQuestions = [];
    let inReadingComp = false;
    let textId = '';
    let examName = pdfName.replace('.pdf', '');

    for (const page of pages) {
        const text = page.text;

        // Detect Reading Comprehension section
        if (text.includes('Reading Comprehension') && text.includes('Text I')) {
            inReadingComp = true;
        }

        // Extract Text I passages
        const textIMatch = text.match(/Text I \(Questions (\d+)-(\d+)\)\n([\s\S]+?)(?=Questions\n|$)/);
        if (textIMatch) {
            const startQ = parseInt(textIMatch[1]);
            const endQ = parseInt(textIMatch[2]);
            const passageText = textIMatch[3].trim()
                .replace(/^\(\d+\)\s*/, '') // Remove leading paragraph numbers
                .replace(/\n\(\d+\)/g, '\n') // Remove inline paragraph numbers
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();

            textId = `${examName}_text_1`;
            currentText = {
                id: textId,
                exam: examName,
                textNumber: 1,
                passage: passageText,
                questionRange: { start: startQ, end: endQ }
            };
        }

        // Extract Text II passages
        const textIIMatch = text.match(/Text II \(Questions (\d+)-(\d+)\)\n([\s\S]+?)(?=Questions\n|$)/);
        if (textIIMatch) {
            // Save previous text if exists
            if (currentText) {
                results.push({ ...currentText, questions: currentQuestions });
                currentQuestions = [];
            }

            const startQ = parseInt(textIIMatch[1]);
            const endQ = parseInt(textIIMatch[2]);
            const passageText = textIIMatch[3].trim()
                .replace(/^\(\d+\)\s*/, '')
                .replace(/\n\(\d+\)/g, '\n')
                .replace(/\s+/g, ' ')
                .trim();

            textId = `${examName}_text_2`;
            currentText = {
                id: textId,
                exam: examName,
                textNumber: 2,
                passage: passageText,
                questionRange: { start: startQ, end: endQ }
            };
        }

        // Extract questions with choices
        const questionPattern = /(\d+)\.\s+([^\n]+(?:\n(?!\d+\.\s|\(\d\)).*)*)\n\(1\)\s+([^\n]+)\n\(2\)\s+([^\n]+)\n\(3\)\s+([^\n]+)\n\(4\)\s+([^\n]+)/g;
        let match;
        while ((match = questionPattern.exec(text)) !== null) {
            const qNum = parseInt(match[1]);
            // Only capture questions in reading comprehension range
            if (currentText && qNum >= currentText.questionRange.start && qNum <= currentText.questionRange.end) {
                currentQuestions.push({
                    questionNumber: qNum,
                    question: match[2].trim().replace(/\s+/g, ' '),
                    choices: [
                        match[3].trim(),
                        match[4].trim(),
                        match[5].trim(),
                        match[6].trim()
                    ]
                });
            }
        }
    }

    // Don't forget the last text
    if (currentText) {
        results.push({ ...currentText, questions: currentQuestions });
    }

    return results;
}

// Main processing
const database = {
    metadata: {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        description: 'Reading Comprehension database extracted from Psychometric exams'
    },
    passages: []
};

for (const [pdfName, pdfData] of Object.entries(rawData)) {
    console.log(`Processing ${pdfName}...`);

    // Get answer key from last page(s)
    const fullText = pdfData.pages ? pdfData.pages.map(p => p.text).join('\n') : pdfData;
    const answerKeys = parseAnswerKey(fullText);
    console.log(`  Found ${Object.keys(answerKeys.section1).length} section 1 answers, ${Object.keys(answerKeys.section2).length} section 2 answers`);

    // Parse reading comprehension sections
    if (pdfData.pages) {
        const passages = parseReadingComprehension(pdfData.pages, pdfName);

        // Add correct answers to questions
        for (const passage of passages) {
            // Determine which section (based on question numbers, typically 13+ is section-specific)
            const answerKey = passage.textNumber === 1 ? answerKeys.section1 : answerKeys.section1;

            for (const question of passage.questions) {
                const correctAnswer = answerKey[question.questionNumber];
                if (correctAnswer) {
                    question.correctAnswer = correctAnswer;
                    question.correctAnswerText = question.choices[correctAnswer - 1];
                }
            }

            database.passages.push(passage);
        }
        console.log(`  Extracted ${passages.length} passages with questions`);
    }
}

// Write output
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(database, null, 2));
console.log(`\nDatabase saved to: ${OUTPUT_FILE}`);
console.log(`Total passages: ${database.passages.length}`);
