const fs = require('fs').promises;
const path = require('path');
const cheerio = require('cheerio');
const axios = require('axios');

async function translateText(text, targetLang) {
    try {
        const response = await axios.get(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
        );
        return response.data[0][0][0];
    } catch (error) {
        console.error(`Translation error for "${text}":`, error.message);
        return text;
    }
}

async function translateHtml(inputFile, outputFile, targetLang) {
    try {
        const html = await fs.readFile(inputFile, 'utf8');
        const $ = cheerio.load(html);

        // Dropdown menü başlıklarını çevir
        const dropdownToggles = $('.dropdown-toggle');
        for (let i = 0; i < dropdownToggles.length; i++) {
            const $toggle = $(dropdownToggles[i]);
            const text = $toggle.text().trim();
            if (text) {
                const translatedText = await translateText(text, targetLang);
                $toggle.contents().filter(function() {
                    return this.type === 'text';
                }).first().replaceWith(translatedText);
            }
        }

        // Diğer metinleri çevir
        const elements = $('body').find('*').filter((_, el) => $(el).children().length === 0 && $(el).text().trim());

        for (let i = 0; i < elements.length; i++) {
            const $el = $(elements[i]);
            const originalText = $el.text().trim();
            if (originalText) {
                const translatedText = await translateText(originalText, targetLang);
                $el.text(translatedText);
            }
        }

        await fs.writeFile(outputFile, $.html());
        console.log(`Translated and saved: ${outputFile}`);
    } catch (err) {
        console.error(`Error processing ${inputFile}:`, err);
    }
}

async function processDirectory(inputDir, outputDir, targetLang) {
    try {
        const files = await fs.readdir(inputDir);
        
        for (const file of files) {
            if (path.extname(file).toLowerCase() === '.html') {
                const inputFile = path.join(inputDir, file);
                const outputFile = path.join(outputDir, file);
                await translateHtml(inputFile, outputFile, targetLang);
            }
        }
    } catch (err) {
        console.error('Error processing directory:', err);
    }
}

async function main() {
    const inputDir = path.join(__dirname, 'ru');
    const outputDir = path.join(__dirname, 'ru');
    const targetLang = 'ru';

    try {
        await fs.access(inputDir);
    } catch (error) {
        console.error(`Input directory not found: ${inputDir}`);
        return;
    }

    try {
        await fs.access(outputDir);
    } catch (error) {
        console.log(`Output directory not found. Creating: ${outputDir}`);
        await fs.mkdir(outputDir, { recursive: true });
    }

    await processDirectory(inputDir, outputDir, targetLang);
    console.log('Translation process completed.');
}

main().catch(error => console.error('Unhandled error:', error));