const puppeteer = require('puppeteer-core');

async function runScraper(search) {
    const browser = await puppeteer.launch({
        headless: false, // Run in headful mode to avoid detection
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Double slashes for Windows

        slowMo: 100, // Slow down operations to mimic human interactions
        args: [
            '--window-size=1920,1080',
            '--disable-blink-features=AutomationControlled' // Helps to evade detection
        ]
    });

    const page = await browser.newPage();
    try {
        await page.goto(`https://www.google.com/search?q=${search}`);
    } catch (error) {
        console.log('Failed to load the page:', error.message);
        await browser.close();
        return;
    }
    // Wait for the search input to appear (with increased timeout)
   
    await page.screenshot({ path: 'google_search_screenshot.png' });

    console.log('Screenshot taken!');
    await browser.close();
}

runScraper('Tesla').catch(console.error);
