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

  it('Welcome -> Control -> Category Route', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();

    await extensionPage.click('#button-default-setup');
    await extensionPage.click('#button-open-toxic-settings');
    const h1 = await extensionPage.$x('//h1[contains(text(),"Categories")]');

    expect(h1).toBeDefined();
  });

  it('Category page has a Categories section', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();

    const section = await extensionPage.$('#section-catagories');
    const catagories = await section.$('#catagories-section');

    expect(catagories).toBeDefined();
  });

  it('Category page loads with Categories', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();

    const section = await extensionPage.$('#section-catagories');
    const catagories = await section.$('#catagories-section');
    const category = await catagories.$('.word-container');

    expect(category).toBeDefined();
  });

  it('Categories obj contains text', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();

    const section = await extensionPage.$('#section-catagories');
    const catagories = await section.$('#catagories-section');
    const category = await catagories.$('.word-container');
    const extensionHeadingText = await category.evaluate((e) => e.innerText);
    expect(extensionHeadingText).toBeDefined();
  });

  it('Category obj contains a toggle icon', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();

    const section = await extensionPage.$('#section-catagories');
    const catagories = await section.$('#catagories-section');
    const category = await catagories.$('.word-container');
    const toggle = await category.$('.bi-toggle-on');

    expect(toggle).toBeDefined();
  });

  it('Categories page has a button to finish setup', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();

    const button = await extensionPage.$('#button-finish-catagories');

    expect(button).toBeDefined();
  });

  it('Category -> Control -> Category Route', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();

    await extensionPage.click('#button-finish-catagories');
    await extensionPage.click('#button-open-toxic-settings');
    const h1 = await extensionPage.$x('//h1[contains(text(),"Categories")]');

    expect(h1).toBeDefined();
  });

  it('Toggles state persists past original screen', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();

    const toggleOff = await extensionPage.$('.bi-toggle-off');
    const toggleOn = await extensionPage.$('.bi-toggle-on');

    expect(toggleOn).toBeDefined();
  });

  afterAll(async () => {
    await browser.close();
  });
});
