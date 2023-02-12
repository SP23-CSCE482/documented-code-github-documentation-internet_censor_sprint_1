const puppeteer = require('puppeteer');

(async () => {
    // Path to extension folder
    const paths = 'C:/Users/jonat/Documents/csce431/github-setup-internet_censor_sprint_1/src';
    try {
        console.log('==>Open Browser');
        const browser = await puppeteer.launch({
            // Disable headless mode
            headless: false,
            // Pass the options to install the extension
            args: [
                `--disable-extensions-except=${paths}`,
                `--load-extension=${paths}`,
                `--window-size=800,600`
                ]
        });

        // Navigate to extension page
        await page.goto('https://google.com');
        // Take a screenshot of the extension page
        console.log('==>Take Screenshot');
        await page.screenshot({path: 'extension.png'});

        console.log('==>Close Browser');
        await browser.close();
    }
    catch (err) {
        console.error(err);
    }
})();

