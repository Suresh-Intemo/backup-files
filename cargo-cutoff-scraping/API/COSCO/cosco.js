import fs from 'fs';
import puppeteer from 'puppeteer-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import axios from "axios";

puppeteer.use(stealth());

async function cosco() {

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    
    const page = await browser.newPage();

    await page.setRequestInterception(true);

    let request_api = "https://elines.coscoshipping.com/ebschedule/public/purpoShipmentWs";

    const client = await page.createCDPSession();
    await client.send('Network.enable');

    client.on('Network.requestWillBeSent', async (params) => {
        if (params.request.url.includes('purpoShipmentWs')) {
            let cookies = await page.cookies();
            console.log("cookies ", cookies);
            fs.writeFileSync('cookie.json', JSON.stringify(cookies, null, 2));
            const cookieHeader = cookie();
            const requestHeaders = params.request.headers;
            requestHeaders['Cookie'] = cookieHeader;
            console.log('Request Headers:', requestHeaders);
            fs.writeFileSync('cosco_req_header.json', JSON.stringify(requestHeaders, null, 2));
            console.log('Request Payload:', params.request.postData);
            fs.writeFileSync('cosco_req_payload.json', JSON.stringify(params.request.postData, null, 2));

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
            fs.writeFileSync('cosco_req_header.json', JSON.stringify(requestHeaders, null, 2));

            console.log('Request Payload:', requestPayload);
            fs.writeFileSync('cosco_req_payload.json', JSON.stringify(requestPayload, null, 2));
        }

        request.continue();
    });

    try {
        await page.goto('https://elines.coscoshipping.com/ebusiness/sailingSchedule/searchByCity', { waitUntil: 'networkidle2' });
        console.log('Successfully navigated to the page!');
    } 
    catch (error) {
        console.error('Navigation error:', error);
    }


    const port_from = "Nhava sheva";
    const port_to = "Dublin";
    

    console.log("Entering port from...");

    await page.click('input.ivu-select-input[placeholder="Origin City (City,Province,Country/Region)"]');
    for (let i = 0; i < port_from.length; i++) {
        await page.keyboard.type(port_from[i], { delay: 500 });
    }

    // await page.waitForSelector('.ivu-select-dropdown', { visible: true, timeout: 3000 });
    await page.waitForSelector('body > div.app-wrapper.new-eb-layout > div > div.__panel > div > div.content > div.main-content > div:nth-child(1) > div > div > div > div > div > div > form > div:nth-child(1) > div.ivu-col.ivu-col-span-14 > div > div > div > div.ivu-select-dropdown > ul.ivu-select-dropdown-list > div', { visible: true, timeout: 3000 });
    await page.click('body > div.app-wrapper.new-eb-layout > div > div.__panel > div > div.content > div.main-content > div:nth-child(1) > div > div > div > div > div > div > form > div:nth-child(1) > div.ivu-col.ivu-col-span-14 > div > div > div > div.ivu-select-dropdown > ul.ivu-select-dropdown-list > div');
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

    await page.click('input.ivu-select-input[placeholder="Destination City (City,Province,Country/Region)"]');
    for (let i = 0; i < port_to.length; i++) {
        await page.type('input.ivu-select-input[placeholder="Destination City (City,Province,Country/Region)"]', port_to[i], { delay: 500 });
    }

    await page.waitForSelector('body > div.app-wrapper.new-eb-layout > div > div.__panel > div > div.content > div.main-content > div:nth-child(1) > div > div > div > div > div > div > form > div:nth-child(2) > div.ivu-col.ivu-col-span-14 > div > div > div > div.ivu-select-dropdown > ul.ivu-select-dropdown-list > div', { visible: true , timeout: 3000});
    await page.click('body > div.app-wrapper.new-eb-layout > div > div.__panel > div > div.content > div.main-content > div:nth-child(1) > div > div > div > div > div > div > form > div:nth-child(2) > div.ivu-col.ivu-col-span-14 > div > div > div > div.ivu-select-dropdown > ul.ivu-select-dropdown-list > div');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.waitForSelector('.btnSearch.ivu-btn', { timeout: 5000 });

    await page.click('.btnSearch.ivu-btn');  

    await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 30000);
        });
    });


    const url = 'https://elines.coscoshipping.com/ebschedule/public/purpoShipmentWs';

    const headers = JSON.parse(fs.readFileSync('cosco_req_header.json', 'utf-8'));

    const body = JSON.parse(fs.readFileSync('cosco_req_payload.json', 'utf-8'));

    try {
        const response = await axios.post(url, body, {
            headers: headers,
        });
        console.log('Response data:', response.data);
        fs.writeFileSync('cosco_rawdata.json', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Error sending request:', error.message);
    }

    await browser.close();
}

cosco();