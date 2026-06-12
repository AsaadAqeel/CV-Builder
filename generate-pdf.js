const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log('🚀 Starting PDF generation...');

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Get absolute path to index.html
    const filePath = path.resolve(__dirname, 'index.html');
    const fileUrl = `file://${filePath}`;

    console.log(`📄 Loading: ${fileUrl}`);

    // Determine theme from saved data or default
    // Since this is headless, we might want to inject the user's saved theme from localStorage if possible.
    // However, localStorage is browser-specific.
    // For now, we'll load the default page. 
    // If we wanted to support themes, we'd need to inject script to set localStorage before loading.

    await page.goto(fileUrl, {
        waitUntil: 'networkidle0'
    });

    // Inject current date just for fun or versioning if needed
    // await page.evaluate(() => { ... });

    console.log('✨ Generating PDF...');

    // PDF Generation Options
    await page.pdf({
        path: 'CV.pdf',
        format: 'A4',
        printBackground: true,
        margin: {
            top: '10mm',
            right: '10mm',
            bottom: '10mm',
            left: '10mm'
        },
        displayHeaderFooter: false
    });

    console.log('✅ PDF generated successfully: CV.pdf');

    await browser.close();
})();
