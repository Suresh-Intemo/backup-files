import fs from 'fs';
import puppeteer from 'puppeteer-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

puppeteer.use(stealth());

async function hapag() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    
    const page = await browser.newPage();

    try {
        await page.goto('https://www.hapag-lloyd.com/en/online-business/schedule/interactive-schedule/interactive-schedule-solution.html', { waitUntil: "domcontentloaded" });
        console.log('Successfully navigated to the page!');
    } 
    catch (error) {
        console.error('Navigation error:', error);
    }

    await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 10000);
        });
    });

    await page.waitForSelector('input[type="checkbox"]');
    await page.click('input[type="checkbox"]');
  
    await browser.close();
}

hapag();