require('dotenv').config();
const parser = require('../extension/parser.js');
const path = require('path');
const bootstrapExtension = require('puppeteer-test-browser-extension');

describe('Test browser extension', () => {
	let browser, contentPage, extensionPage;

	beforeAll(async () => {
		const extensionEnvironment = await bootstrapExtension({
			pathToExtension: path.resolve('./extension',''), //The path to the uncompressed extension's folder. It shouldn't be a ZIP file.
			contentUrl: `https://wikipedia.com/`, // The URL of the content page that is being browsed
			//slowMo: 100, //(uncomment this line to slow down Puppeteer's actions)
			//devtools: true, //(uncomment this line to open the browser's devtools)
		});

		browser = extensionEnvironment.browser;
		contentPage = extensionEnvironment.contentPage;
		extensionPage = extensionEnvironment.extensionPage;
	});

	afterAll(async () => {
		await browser.close();
	});

	it("Should return Pure Text", async () => {
		// Use contentPage to interact with the content page (the page that is being browsed)
		// First, activate the content page
		contentPage.bringToFront();
        const bodyHTML = await contentPage.content();
        const bodyText = parser.parsePage(bodyHTML);
		expect(bodyText).not.toMatch('<');
		expect(bodyText).not.toMatch('>');
	});

	it("Should expect the title of the website", async () => {
		// Use contentPage to interact with the content page (the page that is being browsed)
		// First, activate the content page
		contentPage.bringToFront();
        const bodyHTML = await contentPage.content();
        const bodyText = parser.parsePage(bodyHTML);
		expect(bodyText).toMatch('Wikipedia');
	});

});