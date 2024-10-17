const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function runScraper(search) {
    const browser = await puppeteer.launch({
        headless: false, // Run in headful mode to avoid detection
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Update to your Chrome path
        slowMo: 100, // Slow down operations to mimic human interactions
        args: [
            '--window-size=1920,1080', // Set the window size to a large value
            '--disable-blink-features=AutomationControlled' // Helps to evade detection
        ]
    });

    const page = await browser.newPage();
    
    // Set the viewport size explicitly for better visibility
    await page.setViewport({ width: 1920, height: 1080 });

    const allLinks = [];

    // Loop through 5 pages to collect 500 results (100 results per page)
    for (let pageIndex = 0; pageIndex < 3; pageIndex++) {
        const searchUrl = `https://www.google.com/search?q=${search}&num=100&start=${pageIndex * 50}`;

        try {
            await page.goto(searchUrl, { waitUntil: 'networkidle2' });
        } catch (error) {
            console.log('Failed to load the page:', error.message);
            await browser.close();
            return;
        }

        // Wait for the search results to appear
        await page.waitForSelector('a h3');

        // Extract all result URLs on the current page
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                .map(link => link.href)
                .filter(url => url.startsWith('http') && !url.includes('google.com' || 'youtube.com')); // Filter out Google tracking URLs
        });

        allLinks.push(...links);

        console.log(`Page ${pageIndex + 1} done: Collected ${links.length} links.\n `);
    }

    // Write the collected URLs to a .txt file
    const top500Links = [...new Set(allLinks)].slice(0, 500); // Get unique links and limit to 500
    fs.writeFileSync('search_results.txt', top500Links.join('\n'));

    console.log(`Top 500 search results saved to search_results.txt`);

    await browser.close();
}

runScraper('Tesla').catch(console.error);
