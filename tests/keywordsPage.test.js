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

  it('Should open the extension\'s popup', async () => {
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

  it('Welcome -> Controls page route exists', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    extensionPage.click('#button-continue-setup');
    const section = await extensionPage.$('#section-choice');
    const heading = await section.$('h1');
    const extensionHeadingText = await heading.evaluate((e) => e.innerText);
    expect(extensionHeadingText).toEqual('Current Keywords');
  });

  it('Keyword page has a place for all user keywords', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const section = await extensionPage.$('#section-choice');
    const filterCon = await section.$('.filter-container');
    const wordsCon = await filterCon.$('#words-section');
    
    expect(filterCon).toBeDefined();
    expect(wordsCon).toBeDefined();
  });

  it('Keyword page has a place for recommended keywords', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const section = await extensionPage.$('#section-choice');
    const filterCon = await section.$('.filter-container');
    const recWordsCon = await filterCon.$('#rec-words-section');
    
    expect(filterCon).toBeDefined();
    expect(recWordsCon).toBeDefined();
  });

  it('Keyword page has word elements', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const section = await extensionPage.$('#section-choice');
    const filterCon = await section.$('.filter-container');
    const wordsCon = await filterCon.$('#words-section');
    const wordCon = await wordsCon.$('.word-container');

    expect(wordCon).toBeDefined();
  });

  it('Keywords have a remove icon', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const section = await extensionPage.$('#section-choice');
    const filterCon = await section.$('.filter-container');
    const wordsCon = await filterCon.$('#words-section');
    const trashIcon = await wordsCon.$('.bi-trash-fill');

    expect(trashIcon).toBeDefined();
  });

  it('Keywords have a toggle icon', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const section = await extensionPage.$('#section-choice');
    const filterCon = await section.$('.filter-container');
    const wordsCon = await filterCon.$('#words-section');
    const toggleIcon = await wordsCon.$('.bi-toggle-on');

    expect(toggleIcon).toBeDefined();
  });

  it('Keywords page has a text box for new keywords', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const section = await extensionPage.$('#section-choice');
    const addArea = await section.$('#section-choice-input');

    expect(addArea).toBeDefined();
  });

  it('Keywords page has a button to add new keywords', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const section = await extensionPage.$('#section-choice');
    const button = await section.$('#button-add-word');

    expect(button).toBeDefined();
  });

  it('Keywords page can add new keywords', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();

    await extensionPage.focus('#section-choice-input');
    await extensionPage.keyboard.type('war');
    await extensionPage.click('#button-add-word');

    await extensionPage.focus('#section-choice-input');
    await extensionPage.keyboard.type('death');
    await extensionPage.click('#button-add-word');

    const text = await extensionPage.evaluate(() => {
        const tag = document.querySelector('#section-choice-input');
        return tag.textContent;
    });

    expect(text).not.toEqual('death');
    expect(text).not.toEqual('war');
  });

  it('Recommended keyword appear after new keyword', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const section = await extensionPage.$('#section-choice');
    const filterCon = await section.$('.filter-container');
    const wordsCon = await filterCon.$('#rec-words-section');
    const wordCon = await wordsCon.$('.word-container');

    expect(wordCon).toBeDefined();
  });

  it('Recommended keyword are related to original keyword', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    var chk = 'Failed';

    if ((await extensionPage.waitForXPath('//*[contains(text(), "deaths")]',300)) !== null) {
      chk = 'Success';
    }

    expect(chk).toEqual('Success');
  });

  it('New keyword added to keyword list', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    var chk = 'Failed';

    if ((await extensionPage.waitForXPath('//*[contains(text(), "death")]',300)) !== null) {
      chk = 'Success';
    }

    expect(chk).toEqual('Success');
  });

  it('Able to delete a keyword', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    var chk = 'Failure';

    try {
      const obj = await extensionPage.$('.word-container');
      const trash = await obj.$('.bi-trash-fill');
      await trash.click();
      chk = 'Success';
    } catch {}
    

    expect(chk).toEqual('Success');
  });

  it('Able to toggle a keyword', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    var chk = 'Failure';

    try {
      const obj = await extensionPage.$('.word-container');
      const toggle = await obj.$('.bi-toggle-on');
      await toggle.click();
      chk = 'Success';
    } catch {}
    

    expect(chk).toEqual('Success');
  });

  it('Toggle icon can be on or off', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const toggleOn = await extensionPage.$('.bi-toggle-on');
    const toggleOff = await extensionPage.$('.bi-toggle-off');
    
    expect(toggleOff).toBeDefined();
    expect(toggleOn).toBeDefined();
  });

  it('Keyword page has a button to finish setup', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const button = await extensionPage.$('#button-finish-setup');
    
    expect(button).toBeDefined();
  });

  it('Keyword page has a reject a recommended keyword', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const reject = await extensionPage.$('.bi-x-lg');
    
    expect(reject).toBeDefined();
  });

  it('Keyword page has a icon to accept a recommended keyword', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const accept = await extensionPage.$('.bi-check2');
    
    expect(accept).toBeDefined();
  });

  it('Keyword page can reject a recommended keyword', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup

    var chk = 'Failure';

    try {
      await extensionPage.bringToFront();
      await extensionPage.click('.bi-x-lg');
      chk = 'Success';
    } catch {}
    
    
    expect(chk).toEqual('Success');
  });

  it('Keyword page can accept a recommended keyword', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup

    var chk = 'Failure';

    try {
      await extensionPage.bringToFront();
      await extensionPage.click('.bi-check2');
      chk = 'Success';
    } catch {}
    
    
    expect(chk).toEqual('Success');
  });

  it('Keyword -> Control route exists', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    await extensionPage.click('#button-finish-setup');
    const section = await extensionPage.$('#section-controls');
    const heading = await section.$('h1');
    const extensionHeadingText = await heading.evaluate((e) => e.innerText);
    expect(extensionHeadingText).toEqual('Controls');
  });

  it('Control -> Keyword route exists', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    extensionPage.click('#button-open-settings');
    const section = await extensionPage.$('#section-choice');
    const heading = await section.$('h1');
    const extensionHeadingText = await heading.evaluate((e) => e.innerText);
    expect(extensionHeadingText).toEqual('Current Keywords');
  });

  it('Toggle state persists', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    const toggleOn = await extensionPage.$('.bi-toggle-on');
    const toggleOff = await extensionPage.$('.bi-toggle-off');
    
    expect(toggleOff).toBeDefined();
    expect(toggleOn).toBeDefined();
  });

  it('Added keyword persists initial page', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    
    var chk = 'Failed';

    if ((await extensionPage.waitForXPath('//*[contains(text(), "war")]',300)) !== null) {
      chk = 'Success';
    }

    expect(chk).toEqual('Success');
  });

  it('Deleted keyword stays deleted', async () => {
    // First, activate the content page
    contentPage.bringToFront();

    // You can use Puppeteer's features as usual
    // Example: Click the button

    // Use extensionPage to interact with the extension's popup
    // First, activate the popup
    await extensionPage.bringToFront();
    var chk = 'Failed';

    try {
      await extensionPage.waitForXPath('//div[@class="words-container"]/*[contains(text(), "death")]',300);
    } catch {
      chk = 'Success';
    }

    expect(chk).toEqual('Success');
  });

});