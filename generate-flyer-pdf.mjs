import puppeteer from 'puppeteer';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const flyerPath = resolve(__dirname, 'flyer.html');
const outputPath = resolve(__dirname, 'Downloads/cv/Max_Simon_Flyer.pdf');

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

await page.goto(`file:///${flyerPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

// Wait for QR code to render
await new Promise(r => setTimeout(r, 2000));

await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
});

await browser.close();
console.log('PDF saved to:', outputPath);
