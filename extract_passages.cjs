/**
 * Script to extract text from PDF files in the pdfs folder
 * Run with: node extract_passages.cjs
 */
const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const PDFS_DIR = path.join(__dirname, 'pdfs');
const OUTPUT_FILE = path.join(__dirname, 'src', 'data', 'extracted_passages.json');

async function extractPdfs() {
    const results = {};
    const files = fs.readdirSync(PDFS_DIR).filter(f => f.endsWith('.pdf'));

    console.log(`Found ${files.length} PDF files`);

    for (const file of files) {
        const filePath = path.join(PDFS_DIR, file);
        console.log(`Processing: ${file}`);

        try {
            const dataBuffer = fs.readFileSync(filePath);
            // Convert Buffer to Uint8Array
            const uint8Array = new Uint8Array(dataBuffer);
            const parser = new PDFParse(uint8Array);
            await parser.load();
            const text = await parser.getText();
            results[file] = text;
            console.log(`  Extracted ${text.length} characters`);
            parser.destroy();
        } catch (err) {
            console.error(`  Error processing ${file}:`, err.message);
            results[file] = `ERROR: ${err.message}`;
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`\nOutput saved to: ${OUTPUT_FILE}`);
}

extractPdfs();
