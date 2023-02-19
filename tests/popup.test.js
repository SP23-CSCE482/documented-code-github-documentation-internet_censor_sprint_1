require('dotenv').config();
const puppeteer = require('puppeteer');
let browser; let page;
const path = process.env._PATH;
const pathToExtension = path.join(process.cwd(), 'src');
const puppeteerArgs = [
  `--disable-extensions-except=${pathToExtension}`,
  `--load-extension=${pathToExtension}`,
  '--disable-features=DialMediaRouteProvider',
];

describe('SIC Extensions', () => {
  beforeEach(async function() {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox'],
      executablePath: process.env.PUPPETEER_EXEC_PATH, // set by docker container
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
