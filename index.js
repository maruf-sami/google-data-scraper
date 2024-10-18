const puppeteer = require('puppeteer-core');
const fs = require('fs');
const url = require('url');

async function runScraper(search) {
    const browser = await puppeteer.launch({
        headless: true, 
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', // Update to your Chrome path
        slowMo: 100, // Slow down operations to mimic human interactions
        args: [
            '--window-size=1920,1080', // Set the window size to a large value
            '--disable-blink-features=AutomationControlled' // Helps to evade detection
        ]
    });

    const page = await browser.newPage();
    
    // Set the viewport size explicitly for better visibility
    // await page.setViewport({ width: 1920, height: 1080 });

    const allDomains = new Set();
    const allLinks = [];

    // Loop through 5 pages to collect 500 results (100 results per page)
    for (let pageIndex = 0; pageIndex < 3; pageIndex++) {
        const searchUrl = `https://www.google.com/search?q=${search}&num=10&start=${pageIndex * 10}`;

        try {
            await page.goto(searchUrl, { waitUntil: 'networkidle2' });
        } catch (error) {
            console.log('Failed to load the page:', error.message);
            await browser.close();
            return;
        }

        // Wait for the search results to appear
        await page.waitForSelector('a h3');

        // Extract all result URLs on the current page and avoid duplicates
        const links = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
                .map(link => link.href)
                .filter(url => url.startsWith('http') && !url.includes('google.com')); // Filter out Google tracking URLs
        });

        // Filter out duplicate domains
        for (let link of links) {
            const domain = url.parse(link).hostname;
            if (!allDomains.has(domain)) {
                allDomains.add(domain);
                allLinks.push(link);
            }
        }

        console.log(`Page ${pageIndex + 1} done: Collected ${links.length} links.`);
    }

    // Write the collected URLs to a .txt file (without repeating domains)
    const top500Links = allLinks.slice(0, 500); // Get first 500 unique domain links
    const sanitizedSearch = search.replace(/\s+/g, ''); // Removes spaces

    fs.writeFileSync(`${sanitizedSearch}.txt`, top500Links.join('\n'));

    console.log(`Top 500 unique domain search results saved to ${sanitizedSearch}.txt`);

    await browser.close();
}

runScraper('Smart Home').catch(console.error);
