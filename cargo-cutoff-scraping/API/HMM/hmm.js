import fs from 'fs';
import puppeteer from 'puppeteer-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
// import AnonymizeUAPlugin  from 'puppeteer-extra-plugin-anonymize-ua'
import axios from "axios";
// import { chromium } from 'playwright-extra';


const stealthPlugin = stealth();
// chromium.use(stealthPlugin);
puppeteer.use(stealthPlugin);
// puppeteer.use(stealth());

async function hmm() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        // args: [
        //   '--no-sandbox',
        //   '--disable-setuid-sandbox',
        //   '--disable-features=SameSiteByDefaultCookies,CookiesWithoutSameSiteMustBeSecure', // Allow third-party cookies
        // ],
    });
    
    const page = await browser.newPage();

    await page.setRequestInterception(true);

    let request_api = "https://www.hmm21.com/e-service/general/schedule/selectPointToPointList.do";

    const client = await page.createCDPSession();
    await client.send('Network.enable');

    client.on('Network.requestWillBeSent', async (params) => {
        if (params.request.url.includes(request_api)) {
            let cookies = await page.cookies();
            console.log("cookies ", cookies);
            fs.writeFileSync('cookie.json', JSON.stringify(cookies, null, 2));
            const cookieHeader = cookie();
            const requestHeaders = params.request.headers;
            requestHeaders['Cookie'] = cookieHeader;
            console.log('Request Headers:', requestHeaders);
            fs.writeFileSync('hmm_req_header.json', JSON.stringify(requestHeaders, null, 2));
            console.log('Request Payload:', params.request.postData);
            fs.writeFileSync('hmm_req_payload.json', JSON.stringify(params.request.postData, null, 2));

            function cookie(){
              const cookiesJson = JSON.parse(fs.readFileSync('cookie.json', 'utf-8'));
              const cookieHeader = cookiesJson.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
              return cookieHeader;
            }
        }
    });

    page.on('request', async (request) => {
        console.log(request.url());
        if (request.url().includes(request_api)) 
        {
            const requestHeaders = request.headers() | '';
            const requestPayload = request.postData() || '';

            console.log('Request Headers:', requestHeaders);
            fs.writeFileSync('hmm_req_header.json', JSON.stringify(requestHeaders, null, 2));

            console.log('Request Payload:', requestPayload);
            fs.writeFileSync('hmm_req_payload.json', JSON.stringify(requestPayload, null, 2));
        }

        request.continue();
    });

    try {
        await page.goto('https://www.hmm21.com/e-service/general/schedule/ScheduleMain.do', { waitUntil: 'networkidle2' });
        console.log('Successfully navigated to the page!');
    } 
    catch (error) {
        console.error('Navigation error:', error);
    }

    // const pageContent = await page.content();
    // console.log(pageContent);

    const port_from = "Nhava Sheva";
    const port_to = "singapore";


    console.log("Entering port from...");

    await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 30000);
        });
    });

    await page.waitForSelector('#srchPointFrom', { visible: true, timeout: 5000 });
    await page.focus('#srchPointFrom');
    for (let i = 0; i < port_from.length; i++) {
        await page.keyboard.type(port_from[i], { delay: 500 });
    }

    await page.waitForSelector('body > div.ac_results', { visible: true , timeout: 3000});
    await page.click('body > div.ac_results');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 3000);
        });
    });

    console.log("Entering port to...");

    await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 6000);
        });
    });

    await page.waitForSelector('#srchPointTo', { visible: true, timeout: 5000 });
    await page.focus('#srchPointTo');
    for (let i = 0; i < port_to.length; i++) {
        await page.keyboard.type(port_to[i], { delay: 500 });
    }

    await page.waitForSelector('body > div:nth-child(34)', { visible: true, timeout: 3000 });
    await page.click('body > div:nth-child(34)');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 3000);
        });
    });


    await page.waitForSelector('#btnRetrieve', { timeout: 5000 });

    await page.click('#btnRetrieve');  

    await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 30000);
        });
    });

    const url = 'https://www.hmm21.com/e-service/general/schedule/selectPointToPointList.do';

    const headers = JSON.parse(fs.readFileSync('hmm_req_header.json', 'utf-8'));

    const body = JSON.parse(fs.readFileSync('hmm_req_payload.json', 'utf-8'));

    console.log("api call")

    try {
        const response = await axios.post(url, body, {
            headers: headers,
        });
        console.log('Response data:', response.data);
        fs.writeFileSync('hmm_rawdata.json', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Error sending request:', error.message);
    }

    await browser.close();
}

hmm();