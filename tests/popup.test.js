const puppeteer = require('puppeteer');
let browser; let page;
const path = 'C:/Users/jonat/Documents/csce431/github-setup-internet_censor_sprint_1/src';
const puppeteerArgs = [
  `--disable-extensions-except=${path}`,
  `--load-extension=${path}`,
  '--disable-features=DialMediaRouteProvider',
];

describe('SIC Extensions', () => {
  beforeEach(async function() {
    browser = await puppeteer.launch({
      headless: false,
      slowMo: 200,
      args: puppeteerArgs,
    });
    [page] = await browser.pages();
  });

  afterEach(() => browser.close());

  it('displays popup', (async () => {
    const appPage = await browser.newPage();

    const targets = await browser.targets();
    const extensionTarget = targets.find(
        (target) => target.type() === 'service_worker');
    const partialExtensionUrl = extensionTarget.url() || '';
    const [, , extensionId] = partialExtensionUrl.split('/');
    console.log(extensionId);

    const extensionUrl = `chrome-extension://${extensionId}/popup.html`;

    await appPage.goto(
        extensionUrl, {waitUntil: ['domcontentloaded', 'networkidle2']});

    const popupHeading = await appPage.$eval('h2', ((e) => e.innerText));
    expect(popupHeading).toEqual('SIC Extension');
  }));
});
