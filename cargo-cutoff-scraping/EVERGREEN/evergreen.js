import { chromium } from 'playwright';
import fs from 'fs';

async function evergreen() {
    const browser = await chromium.launch({
        headless: false
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://ss.shipmentlink.com/tvs2/jsp/TVS2_InteractiveSchedule.jsp');

    const port_from = "Nhava";
    const port_to = "Dublin, Ireland";

    await page.waitForTimeout(2000);

    console.log("Entering port from...");

    for (let i = 0; i < port_from.length; i++) {
        await page.type('#tvs2OriAC', port_from[i], { delay: 500 });
    }

    // await page.fill('#tvs2OriAC', port_from);
    const dropdownFrom = page.locator('#tuf1ac_tat_table').nth(0);
    await dropdownFrom.waitFor({ state: 'visible' });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.waitForTimeout(2000);


    console.log("Entering port to...");

    for (let i = 0; i < port_to.length; i++) {
        await page.type('#tvs2DesAC', port_to[i], { delay: 500 });
    }
    // await page.fill('#tvs2DesAC', port_to);
    const dropdownTo = page.locator('#tuf1ac_tat_table').nth(0);
    await dropdownTo.waitFor({ state: 'visible' });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.waitForSelector('.ec-btn.ec-btn-default.ec-fs-16');
    await page.click('.ec-btn.ec-btn-default.ec-fs-16');  


    await page.waitForSelector('table.ec-table', { timeout: 30000 });

    const response = await page.evaluate(() => {
        const results = document.querySelectorAll('table thead.Corner');
        console.log(results.length);
        let data = [];
        results.forEach((header) => {
            const rows = header.querySelectorAll('tr'); 
            let rowData = [];

            rows.forEach((row) => {
                const columns = row.querySelectorAll('td');  
                let columnData = [];

                columns.forEach((column) => {
                    const text = column.innerText.trim();
                    if (text) {
                        columnData.push(text);
                    }
                    const link = column.querySelector('span[ectype="modalbox"]');
                    if (link) {
                    const linkDetails = fetchLinkDetails(link);
                    columnData.push({ linkText: text, details: linkDetails });
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

        async function fetchLinkDetails(linkUrl) {
            linkUrl.click();
            const tempElement = document.createElement('div');
            tempElement.innerHTML = html;
            const detailRows = tempElement.querySelectorAll('table.ec-table tr'); // Assuming the details are in a table
    
            let details = [];
            detailRows.forEach((row) => {
                const columns = row.querySelectorAll('td');
                let detailData = [];
                columns.forEach((col) => {
                    detailData.push(col.innerText.trim());
                });
                if (detailData.length > 0) {
                    details.push(detailData);
                }
            });
            return details;
        }

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