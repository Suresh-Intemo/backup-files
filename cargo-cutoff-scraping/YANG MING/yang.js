import { chromium } from 'playwright';
import fs from 'fs';

async function evergreen() {
    const browser = await chromium.launch({
        headless: false
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://www.yangming.com/e-service/schedule/PointToPoint.aspx');

    const port_from = "Nhava Sheva";
    const port_to = "Jebel Ali";

    await page.waitForTimeout(2000);

    console.log("Entering port from...");

    for (let i = 0; i < port_from.length; i++) {
        await page.type('#ContentPlaceHolder1_txtFrom', port_from[i], { delay: 500 });
    }

    // await page.fill('#ContentPlaceHolder1_txtFrom', port_from);
    const dropdownFrom = page.locator('.ac_results').nth(0);
    await dropdownFrom.waitFor({ state: 'visible' });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.waitForTimeout(3000);


    await page.evaluate(() => {
        const inputTo = document.querySelector('#ContentPlaceHolder1_txtTo');
        if (inputTo.hasAttribute('disabled')) {
            inputTo.removeAttribute('disabled');
        }
    });

    console.log("Entering port to...");
    await page.fill('#ContentPlaceHolder1_txtTo', ''); 
    for (let i = 0; i < port_to.length; i++) {
        await page.type('#ContentPlaceHolder1_txtTo', port_to[i], { delay: 500 });
    }
    // await page.fill('#ContentPlaceHolder1_txtTo', port_to);
    const dropdownTo = page.locator('.ac_results').first();
    // await dropdownTo.waitFor({ state: 'visible' });
    await page.waitForSelector('.ac_results:visible', { timeout: 5000 });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.waitForSelector('.form_btn_100px', { timeout: 5000 });

    // await page.evaluate(() => {
    //     document.querySelector('#form1').submit();  // Replace 'form' with your form selector
    // });
    await page.click('.form_btn_100px');  

    // await page.waitForTimeout(10000);

    await Promise.all([
        page.waitForResponse(response => response.url().includes('https://www.yangming.com/e-service/schedule/PointToPointResult.aspx?localSite=') && response.status() === 200),
    ]);
    

    // await page.goForward("https://www.yangming.com/e-service/schedule/PointToPointResult.aspx?localSite=")
    // await page.waitForResponse('https://www.yangming.com/e-service/schedule/PointToPointResult.aspx?localSite=', { timeout: 30000 });

    await page.waitForSelector('table.gvRouting', { timeout: 30000 });

    const response = await page.evaluate(() => {
        const results = document.querySelectorAll('table thead.Corner');
        console.log(results.length);
        let data = [];
        results.forEach((header) => {
            const rows = header.querySelectorAll('tr');  // Select rows directly under thead
            let rowData = [];

            rows.forEach((row) => {
                const columns = row.querySelectorAll('td');  
                let columnData = [];

                columns.forEach((column) => {
                    const text = column.innerText.trim();
                    if (text) {
                        columnData.push(text);
                    }
                });

                if (columnData.length > 0) { 
                    rowData.push(columnData);
                }
            });

            if (rowData.length > 0) { 
                data.push({
                    header: rowData 
                });
            }
        });
        return data; 
    });

    console.log(response);

    fs.writeFileSync('evergreen_rawdata.json', JSON.stringify(response, null, 2));
    console.log("Data saved to evergreen_rawdata.json")

    // Wait for 1 second to ensure page content loads properly
    await page.waitForTimeout(2000);

    // Close the browser instance after task completion
    await browser.close();
}

evergreen();