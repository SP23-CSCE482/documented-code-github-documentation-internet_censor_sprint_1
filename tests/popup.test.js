require('dotenv').config();
const path = require('path');
const bootstrapExtension = require('puppeteer-test-browser-extension');

describe('Test browser extension', () => {
	let browser, contentPage, extensionPage;

	beforeAll(async () => {
		const extensionEnvironment = await bootstrapExtension({
			pathToExtension: path.resolve('./SIC',''), //The path to the uncompressed extension's folder. It shouldn't be a ZIP file.
			contentUrl: `https://google.com/`, // The URL of the content page that is being browsed
			//slowMo: 100, //(uncomment this line to slow down Puppeteer's actions)
			//devtools: true, //(uncomment this line to open the browser's devtools)
		});

		browser = extensionEnvironment.browser;
		contentPage = extensionEnvironment.contentPage;
		extensionPage = extensionEnvironment.extensionPage;
	});

	it("Should open the extension's popup", async () => {
		// Use contentPage to interact with the content page (the page that is being browsed)
		// First, activate the content page
		contentPage.bringToFront();

		// You can use Puppeteer's features as usual
		//Example: Click the button

		// Use extensionPage to interact with the extension's popup
		// First, activate the popup
		await extensionPage.bringToFront();

		// (Assuming your content page contains <h1>Extension popup</h1>)
		// The user should see the heading on the popup
		const heading = await extensionPage.$('span');
		const extensionHeadingText = await heading.evaluate((e) => e.innerText);
		expect(extensionHeadingText).toEqual('Safe Internet');
	});

	afterAll(async () => {
		await browser.close();
	});
});