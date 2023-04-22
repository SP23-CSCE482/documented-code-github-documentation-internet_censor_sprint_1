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

  it('Should open the extension\'s popup', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();

    // (Assuming your content page contains <h1>Extension popup</h1>)
    // The user should see the heading on the popup
    const heading = await extensionPage.$('span');
    const extensionHeadingText = await heading.evaluate((e) => e.innerText);
    expect(extensionHeadingText).toEqual('Safe Internet');
  });

  it('Welcome -> Controls page route exists', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    extensionPage.click('#button-default-setup');
    const section = await extensionPage.$('#section-controls');
    const heading = await section.$('h1');
    const extensionHeadingText = await heading.evaluate((e) => e.innerText);
    expect(extensionHeadingText).toEqual('Controls');
  });

  it('Control Page has a keyword toggle', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const section = await extensionPage.$('#section-controls');
    const button2 = await section.$('button-toggle-active');
    expect(button2).toBeDefined();
  });

  it('Control Page has a category toggle', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const section = await extensionPage.$('#section-controls');
    const button1 = await section.$('button-context-toggle-active');
    expect(button1).toBeDefined();
  });

  it('Control Page has the buttons to the other pages', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const section = await extensionPage.$('#section-controls');
    const button3 = await section.$('button-open-settings');
    const button4 = await section.$('button-open-toxic-settings');
    expect(button3).toBeDefined();
    expect(button4).toBeDefined();
  });

  it('Control Page Toggles start as On', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const section = await extensionPage.$('#section-controls');
    const button1 = await section.$('#button-context-toggle-active');
    const button1text = await button1.getProperty('.btn-success');
    expect(button1text).toBeDefined();
    const button2 = await section.$('#button-toggle-active');
    const button2text = await button2.getProperty('.btn-success');
    expect(button2text).toBeDefined();
  });

  it('Control Page Toggles can be toggled', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const section = await extensionPage.$('#section-controls');
    extensionPage.click('#button-context-toggle-active');
    extensionPage.click('#button-toggle-active');
    const button1 = await section.$('#button-context-toggle-active');
    const button1text = await button1.getProperty('.btn-danger');
    expect(button1text).toBeDefined();
    const button2 = await section.$('#button-toggle-active');
    const button2text = await button2.getProperty('.btn-danger');
    expect(button2text).toBeDefined();
    extensionPage.click('#button-context-toggle-active');
  });

  it('Control -> Category -> Control Route', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    await extensionPage.click('#button-open-toxic-settings');
    await extensionPage.click('#button-finish-catagories');
    const section = await extensionPage.$('#section-controls');
    const heading = await section.$('h1');
    const extensionHeadingText = await heading.evaluate((e) => e.innerText);
    expect(extensionHeadingText).toEqual('Controls');
  });

  it('Control Page Toggles can keep state', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const section = await extensionPage.$('#section-controls');
    const button1 = await section.$('#button-context-toggle-active');
    const button1text = await button1.getProperty('.btn-success');
    expect(button1text).toBeDefined();
    const button2 = await section.$('#button-toggle-active');
    const button2text = await button2.getProperty('.btn-danger');
    expect(button2text).toBeDefined();
  });

  afterAll(async () => {
    await browser.close();
  });
});
