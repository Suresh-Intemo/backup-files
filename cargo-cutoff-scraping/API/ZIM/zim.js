import fs from 'fs';
import puppeteer from 'puppeteer-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import axios from "axios";
// import AnonymizeUAPlugin  from 'puppeteer-extra-plugin-anonymize-ua'

// import { chromium } from 'playwright';
// import { chromium } from 'playwright-extra';

const stealthPlugin = stealth();
puppeteer.use(stealthPlugin);
// chromium.use(stealthPlugin);

async function zim() {
  
  // const browser = await chromium.launch({
  //   headless: false,
  // });

  // const context = await browser.newContext();
  // const page = await context.newPage();

  const browser = await puppeteer.launch({
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure',
        ],
  });
    
  const page = await browser.newPage();

  await page.setRequestInterception(true);

  let request_api = "https://www.zim.com/api/v2/scheduleByRoute/getResult";

  let main_url = '';

  page.on('request', async (request) => {
      const url = request.url();
      if (url.includes('/api/v2/scheduleByRoute/getResult')) {
          main_url = url;
          console.log('Captured URL:', main_url);
        }
      if (request.url().includes(request_api)) {
      const requestHeaders = request.headers();
      const requestPayload = request.postData() || '';

      console.log('Request Headers:', requestHeaders);
      fs.writeFileSync('zim_req_header.json', JSON.stringify(requestHeaders, null, 2));

      console.log('Request Payload:', requestPayload);
      fs.writeFileSync('zim_req_payload.json', JSON.stringify(requestPayload, null, 2));
      }

      request.continue();
  });

  try {
      await page.goto('https://www.zim.com/schedules/point-to-point', { waitUntil: "domcontentloaded" });
      // await page.goto('https://www.zim.com/schedules/point-to-point');
      console.log('Successfully navigated to the page!');
  } 
  catch (error) {
      console.error('Navigation error:', error);
      await browser.close();
      return;
  }

  try {
      await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 5000 });
      await page.click('#onetrust-accept-btn-handler');
  } catch (error) {
      console.log("No cookie consent overlay found.");
  }

  const port_from = "Nhava";
  const port_to = "colombo";

  console.log("Entering port from...");

  await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 30000);
      });
  });

  await page.waitForSelector('#p2p-origin', { visible: true , timeout: 3000});

  await page.focus('#p2p-origin');
  for (let i = 0; i < port_from.length; i++) {
      await page.keyboard.type(port_from[i], { delay: 500 });
  }

  await page.waitForSelector('.rbt-menu', { visible: true , timeout: 3000});
  await page.click('.rbt-menu');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 5000);
      });
  });

  console.log("Entering port to...");

  await page.focus('#p2p-destination');
  for (let i = 0; i < port_to.length; i++) {
      await page.keyboard.type(port_to[i], { delay: 500 });
  }

  await page.waitForSelector('.rbt-menu', { visible: true });
  await page.focus('.rbt-menu');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 3000);
      });
  });

  await page.waitForSelector('.cards-search-button', { timeout: 5000 });

  await page.click('input.btn.btn-primary');  

  await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 5000);
      });
  });


  const headers = JSON.parse(fs.readFileSync('zim_req_header.json', 'utf-8'));

  try {
      const response = await axios.get(main_url, {
          headers: headers,
      });
      console.log('Response data:', response.data);
      fs.writeFileSync('zim_rawdata.json', JSON.stringify(response.data, null, 2));

  } catch (error) {
      console.error('Error sending request:', error.message);
  }

  await browser.close();
}

zim();