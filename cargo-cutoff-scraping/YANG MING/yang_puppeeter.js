import fs from 'fs';
import puppeteer from 'puppeteer-extra';
import stealth from 'puppeteer-extra-plugin-stealth';

puppeteer.use(stealth());

async function yangming() {
    const browser = await puppeteer.launch({
        headless: false
    });

    const page = await browser.newPage();

    await page.goto('https://www.yangming.com/e-service/schedule/PointToPoint.aspx');

    try {
        await page.click('.cc-btn.cc-dismiss');
    } catch (error) {
        console.log("No cookie consent overlay found.");
    }

    const port_from = "Nhava Sheva";
    const port_to = "Jebel Ali";

    console.log("Entering port from...");

    await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 5000);
        });
    });

    for (let i = 0; i < port_from.length; i++) {
        await page.type('#ContentPlaceHolder1_txtFrom', port_from[i], { delay: 500 });
    }

    await page.waitForSelector('body > div:nth-child(4)', { visible: true, timeout: 3000 });
    // await page.click('body > div:nth-child(4)');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.evaluate(() => {
        const inputTo = document.querySelector('#ContentPlaceHolder1_txtTo');
        if (inputTo.hasAttribute('disabled')) {
            inputTo.removeAttribute('disabled');
        }
    });

    console.log("Entering port to...");
    await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 3000);
        });
    });
    await page.focus('#ContentPlaceHolder1_txtTo');
    await page.evaluate(() => { document.querySelector('#ContentPlaceHolder1_txtTo').value = ''; });
    for (let i = 0; i < port_to.length; i++) {
        await page.type('#ContentPlaceHolder1_txtTo', port_to[i], { delay: 500 });
    }

    await page.waitForSelector('body > div:nth-child(6)', { visible: true, timeout: 3000 });
    // await page.click('body > div:nth-child(6)');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.waitForSelector('.form_btn_100px', { timeout: 6000 });

    // await page.click('.form_btn_100px');

    // await page.evaluate(() => {
    //     return new Promise((resolve) => {
    //       setTimeout(() => {
    //         resolve();
    //       }, 7000);
    //     });
    // });

    await Promise.all([
        page.click('.form_btn_100px'),
        page.waitForNavigation({ waitUntil: 'networkidle0' }) // Wait for the page to fully load
    ]);

    console.log('Button clicked and navigation completed.');

    // Now that the navigation is complete, wait for the table and extract the data
    await page.waitForSelector('table.gvRouting', { timeout: 30000 });

    const tableData = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll('table.gvRouting tr'));
        return rows.map(row => {
            const columns = row.querySelectorAll('td');
            return Array.from(columns, column => column.innerText.trim());
        });
    });

    console.log(tableData);

    // Optionally save data to a file
    fs.writeFileSync('yangming_schedule.json', JSON.stringify(tableData, null, 2));

    console.log("Data saved");

    await page.waitForSelector('table.gvRouting', { timeout: 30000 });

    console.log('button clicked');
    
    console.log("Data saved");

    await page.waitForTimeout(2000);

    await browser.close();
}

yangming();
