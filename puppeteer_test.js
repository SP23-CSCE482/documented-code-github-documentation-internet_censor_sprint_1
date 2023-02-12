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

        console.log('==>Navigate to Extension');
        const page = await browser.newPage();

        // Name of the extension
        const extensionName = 'SIC Internet Censor';

        // Find the extension
        const targets = await browser.targets();
        const extensionTarget = targets.find(({ _targetInfo }) => {
            return _targetInfo.title === extensionName && _targetInfo.type === 'background_page';
        });

        // Extract the URL
        const extensionURL = extensionTarget._targetInfo.url;
        console.log("\nExtracted URL ==>" + extensionURL);
        const urlSplit = extensionURL.split('/');
        console.log("Split URL ==>");
        console.log(urlSplit);
        const extensionID = urlSplit[2];
        console.log("Extension ID ==>" + extensionID +"\n");

        // Define the extension page
        const extensionEndURL = 'popup.html';

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

