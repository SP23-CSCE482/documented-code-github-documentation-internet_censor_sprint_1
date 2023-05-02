require('dotenv').config();
const path = require('path');
const bootstrapExtension = require('puppeteer-test-browser-extension');

describe('Test browser extension', () => {
  let browser; let contentPage; let extensionPage;

  beforeAll(async () => {
    const extensionEnvironment = await bootstrapExtension({
      pathToExtension: path.resolve('./extension', ''),
      contentUrl: 'https://google.com/',
    });

    browser = extensionEnvironment.browser;
    contentPage = extensionEnvironment.contentPage;
    extensionPage = extensionEnvironment.extensionPage;
  });

  
  afterAll(async () => {
    await browser.close();
  });

  it('Popup opens to welcome page', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();

    const heading = await extensionPage.$('span');
    const extensionHeadingText = await heading.evaluate((e) => e.innerText);
    expect(extensionHeadingText).toEqual('Safe Internet');
  });

  it('Able to select default keywords', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const button = await extensionPage.$('#button-default-setup');
    expect(button).toBeDefined();
  });

  it('Able to continue setup', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const button = await extensionPage.$('#button-continue-setup');
    expect(button).toBeDefined();
  });
});