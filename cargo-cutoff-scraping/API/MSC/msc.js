import { chromium } from 'playwright';
import fs from 'fs';
import axios from "axios";

async function msc() {

    const browser = await chromium.launch({
        headless: false
    });

    const context = await browser.newContext();
    
    const page = await context.newPage();

    await page.route('https://www.msc.com/api/feature/tools/SearchSailingRoutes', async (route, request) => {
        // Get request headers
        const requestHeaders = request.headers();
        // Get request payload (POST data)
        const requestPayload = request.postData();

        console.log('Request Headers:', requestHeaders);
        fs.writeFileSync('msc_req_header.json', JSON.stringify(requestHeaders, null, 2))
        console.log('Request Payload:', requestPayload);
        fs.writeFileSync('msc_req_payload.json', JSON.stringify(requestPayload, null, 2))
        route.continue();
        
    });

    await page.goto('https://www.msc.com/en/search-a-schedule');

    try {
        await page.click('#onetrust-accept-btn-handler');
    } catch (error) {
        console.log("No cookie consent overlay found.");
    }

    const port_from = "NHAVA";
    const port_to = "DUBLIN";

    await page.waitForTimeout(2000);

    console.log("Entering port from...");

    await page.fill('#from', port_from);
    const dropdownFrom = page.locator('.msc-search-schedule__autocomplete').nth(0);
    await dropdownFrom.waitFor({ state: 'visible' });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await page.waitForTimeout(2000);


    console.log("Entering port to...");

    await page.fill('#to', port_to);
    const dropdownTo = page.locator('.msc-search-schedule__autocomplete').nth(1);
    await dropdownTo.waitFor({ state: 'visible' });
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    const button = page.locator('button.msc-cta');
    await button.waitFor({ state: 'visible' });
    await button.click();

    

    const url = 'https://www.msc.com/api/feature/tools/SearchSailingRoutes';

    const headers = JSON.parse(fs.readFileSync('msc_req_header.json', 'utf-8'));

    const body = JSON.parse(fs.readFileSync('msc_req_payload.json', 'utf-8'))

    try {
        const response = await axios.post(url, body, {
            headers: headers,
        });
        console.log('Response data:', response.data);
        fs.writeFileSync('test.json', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('Error sending request:', error.message);
    }


    // await page.waitForSelector('div.msc-search-schedule-point-to-point-details__result', { timeout: 30000 });

    // const response = await page.evaluate(() => {
    //     const results = document.querySelectorAll('div.msc-search-schedule-point-to-point-details__result');
    //     return Array.from(results).map(result => {

    //         const button = result.querySelector('button.msc-cta-icon-simple.msc-search-schedule-point-to-point-details__more-button.no-print');
    //         if (button && button.classList.contains('open') === false) {
    //             button.click();
    //         }

    //         const scheduleData = result.querySelectorAll('div.msc-search-schedule__result-step');
    //         console.log("length",scheduleData.length)
    //         return Array.from(scheduleData).map(data => {
    //             const polEle = data.querySelector('div.msc-search-schedule-point-to-point-details__timeline-data > span.data-value').innerText;
    //             const etaEle = data.querySelector('div.msc-search-schedule-point-to-point-details__timeline-data > span.data-value.data-value--date');
    //             const etdEle = data.querySelector('div.msc-search-schedule-point-to-point-details__timeline-data > span.data-value.data-value--date[x-text="legDetails.EstimatedDepartureTimeFormatted"]');
    //             const vesselEle = data.querySelector('span[x-text="legDetails.Vessel.VesselName"]');
    //             const voyageEle = data.querySelector('span[x-text="legDetails.DepartureVoyageNo"]');
    //             const PortCutoffEle = data.querySelector('div.msc-search-schedule__tooltip-box--cut-off ul > li > span.data-tooltip-value[x-text="entry.CutOffs.ContainerYardCutOffDate"]');
    //             const DocsCutoffEle = data.querySelector('div.msc-search-schedule__tooltip-box--cut-off ul > li > span.data-tooltip-value[x-text="entry.CutOffs.ShippingInstructionsCutOffDate"]');
                
    //             const departureSpan = data.querySelector('#main > div.msc-search-schedule.separator--bottom-big > div.msc-search-schedule__wrapper > div > div.grid-x.align-center > div > div.grid-x.msc-search-schedule__result-details > div > div > div:nth-child(6) > div.msc-search-schedule-point-to-point-details__tracking > div:nth-child(4) > div.grid-container.full.msc-search-schedule__result-step.msc-search-schedule__result-step--last > div.grid-x.grid-padding-x > div.cell.small-12.medium-3 > div > div > span:nth-child(7)');

    //             const departurePortText = departureSpan ? departureSpan.textContent.trim() : '';
                
    //             const pol = polEle ? polEle : departurePortText;
    //             const eta = etaEle ? etaEle.innerText.trim().replace(/\s+/g, ' ') : null;
    //             const etd = etdEle ? etdEle.innerText.trim().replace(/\s+/g, ' ') : null;
    //             const vessel = vesselEle ? vesselEle.innerText : null;
    //             const voyage = voyageEle ? voyageEle.innerText : null;
    //             const PortCutoff = PortCutoffEle ? PortCutoffEle.innerText : null;
    //             const DocsCutoff = DocsCutoffEle ? DocsCutoffEle.innerText : null;

    //             const formattedEta = eta ? eta.replace(/\s+/g, ' ').trim() : '';
    //             const formattedEtd = etd ? etd.replace(/\s+/g, ' ').trim() : '';

    //             return {
    //                 pol : pol,
    //                 eta : formattedEta,
    //                 etd : formattedEtd,
    //                 vessel : vessel,
    //                 voyage : voyage,
    //                 PortCutoff : PortCutoff,
    //                 DocsCutoff : DocsCutoff,
    //             }
    //         });
    //     });
    // });

    // fs.writeFileSync('msc_rawdata.json', JSON.stringify(response, null, 2));
    // console.log("Data saved to msc_rawdata.json")

    // Wait for 1 second to ensure page content loads properly
    await page.waitForTimeout(2000);

    // Close the browser instance after task completion
    await browser.close();
}

msc();