const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function runScraper(search) {
    const browser = await puppeteer.launch({
        headless: false, // Run in headful mode to avoid detection
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Update to your Chrome path
        slowMo: 100, // Slow down operations to mimic human interactions
        args: [
            '--window-size=1920,1080',
            '--disable-blink-features=AutomationControlled' // Helps to evade detection
        ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        await page.goto(`https://www.google.com/search?q=${search}`, { waitUntil: 'networkidle2' });
    } catch (error) {
        console.log('Failed to load the page:', error.message);
        await browser.close();
        return;
    }

    // Wait for the search results to appear
    await page.waitForSelector('a h3');

    // Extract all result URLs (not only Tesla domains)
    const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
            .map(link => link.href)
            .filter(url => url.startsWith('http') && !url.includes('google.com')); // Filter out Google tracking URLs
    });

    // Limit the list to the top 10 distinct domains
    const top10Links = [...new Set(links)].slice(0, 10);

    // Write the URLs to a .txt file
    fs.writeFileSync('search_results.txt', top10Links.join('\n'));

    console.log('Top 10 search results saved to search_results.txt');

    await browser.close();
}

runScraper('Tesla').catch(console.error);
