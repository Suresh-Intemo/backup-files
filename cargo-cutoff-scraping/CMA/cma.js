import fs from 'fs';
import puppeteer from 'puppeteer-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import axios from "axios";

puppeteer.use(stealth());

async function cma() {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    
    const page = await browser.newPage();

    // await page.goto('https://www.hapag-lloyd.com/en/online-business/schedule/interactive-schedule/interactive-schedule-solution.html');
    await page.goto("https://www.cma-cgm.com/ebusiness/schedules")
    // await page.waitForSelector('input[type="checkbox"]', {timeout: 10000 });
    // await page.click('input[type="checkbox"]');
  

    // await page.waitForTimeout(5000);

    // try {
    //     await page.click('.save-preference-btn-handler onetrust-close-btn-handler');
    // } catch (error) {
    //     console.log("No cookie consent overlay found.");
    // }

    // const port_from = "Nhava Sheva";
    // const port_to = "Jebel Ali";

    // await page.waitForTimeout(2000);

    // console.log("Entering port from...");

    // for (let i = 0; i < port_from.length; i++) {
    //     await page.type('#ContentPlaceHolder1_txtFrom', port_from[i], { delay: 500 });
    // }

    // await page.fill('#AutoCompletePOL', port_from);
    // const dropdownFrom = page.locator('.sorted-autocomplete-popup').nth(0);
    // await dropdownFrom.waitFor({ state: 'visible' });
    // await page.keyboard.press('ArrowDown');
    // await page.keyboard.press('Enter');

    // await page.waitForTimeout(3000);

    // console.log("Entering port to...");
    // await page.fill('#ContentPlaceHolder1_txtTo', ''); 
    // for (let i = 0; i < port_to.length; i++) {
    //     await page.type('#ContentPlaceHolder1_txtTo', port_to[i], { delay: 500 });
    // }
    // await page.fill('#AutoCompletePOD', port_to);
    // const dropdownTo = page.locator('.sorted-autocomplete-popup').first();
    // // await dropdownTo.waitFor({ state: 'visible' });
    // await page.waitForSelector('.ac_results:visible', { timeout: 5000 });
    // await page.keyboard.press('ArrowDown');
    // await page.keyboard.press('Enter');

    // await page.waitForSelector('.form_btn_100px', { timeout: 5000 });

    // // await page.evaluate(() => {
    // //     document.querySelector('#form1').submit();  // Replace 'form' with your form selector
    // // });
    // await page.click('.form_btn_100px');  

    // // await page.waitForTimeout(10000);

    // await Promise.all([
    //     page.waitForResponse(response => response.url().includes('https://www.yangming.com/e-service/schedule/PointToPointResult.aspx?localSite=') && response.status() === 200),
    // ]);
    

    // // await page.goForward("https://www.yangming.com/e-service/schedule/PointToPointResult.aspx?localSite=")
    // // await page.waitForResponse('https://www.yangming.com/e-service/schedule/PointToPointResult.aspx?localSite=', { timeout: 30000 });

    // await page.waitForSelector('table.gvRouting', { timeout: 30000 });

    // const response = await page.evaluate(() => {
    //     const results = document.querySelectorAll('table thead.Corner');
    //     console.log(results.length);
    //     let data = [];
    //     results.forEach((header) => {
    //         const rows = header.querySelectorAll('tr');  // Select rows directly under thead
    //         let rowData = [];

    //         rows.forEach((row) => {
    //             const columns = row.querySelectorAll('td');  
    //             let columnData = [];

    //             columns.forEach((column) => {
    //                 const text = column.innerText.trim();
    //                 if (text) {
    //                     columnData.push(text);
    //                 }
    //             });

    //             if (columnData.length > 0) { 
    //                 rowData.push(columnData);
    //             }
    //         });

    //         if (rowData.length > 0) { 
    //             data.push({
    //                 header: rowData 
    //             });
    //         }
    //     });
    //     return data; 
    // });

    // console.log(response);

    // fs.writeFileSync('zim_rawdata.json', JSON.stringify(response, null, 2));
    // console.log("Data saved to zim_rawdata.json")

    // // Wait for 1 second to ensure page content loads properly
    // await page.waitForTimeout(2000);

    // Close the browser instance after task completion
    await browser.close();
}

cma();