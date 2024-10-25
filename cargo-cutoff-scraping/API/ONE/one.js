
import axios from "axios";
import fs from 'fs';

async function one() {
    try {
        // Get input for query parameters
        const porCode = 'INNSA'
        const delCode = 'AEJEA'
        const rcvTermCode = 'Y';
        const deTermCode = 'Y';
        const fromDate = '2024-09-26';
        const toDate = '2024-10-10';
    
        // API URL with user-provided query parameters
        // const url = `https://ecomm.one-line.com/api/v1/schedule/point-to-point?porCode=${porCode}&delCode=${delCode}&rcvTermCode=${rcvTermCode}&deTermCode=${deTermCode}&fromDate=${fromDate}&toDate=${toDate}`;

        const url = 'https://ecomm.one-line.com/api/v1/schedule/point-to-point?porCode=INNSA&delCode=AEJEA&rcvTermCode=Y&deTermCode=Y&fromDate=2024-09-26&toDate=2024-10-10';
        // Make the API request
        const response = await axios.get(url);
    
        // Save the response to a JSON file
        fs.writeFileSync('one_rawdata.json', JSON.stringify(response.data, null, 2));
    
        console.log('Data has been saved to response.json');
    
      } catch (error) {
        console.error('Error fetching data:', error);
      }
//     const browser = await chromium.launch({
//         headless: false
//     });

//     const context = await browser.newContext();
//     const page = await context.newPage();

//     await page.goto('https://ecomm.one-line.com/one-ecom/schedule/point-to-point-schedule');

//     const port_from = "NHAVA";
//     const port_to = "DUBLIN";

//     const display_items = "All items"

//     await page.waitForTimeout(2000);

//     console.log("Entering port from...");

//     await page.fill('#downshift-1-input', port_from);
//     const dropdownFrom = page.locator('.Autocomplete_menu__xojsJ').nth(0);
//     await dropdownFrom.waitFor({ state: 'visible' });
//     await page.keyboard.press('ArrowDown');
//     await page.keyboard.press('Enter');

//     await page.waitForTimeout(2000);


//     console.log("Entering port to...");

//     await page.fill('#downshift-2-input', port_to);
//     const dropdownTo = page.locator('.Autocomplete_menu__xojsJ').nth(1);
//     await dropdownTo.waitFor({ state: 'visible' });
//     await page.keyboard.press('ArrowDown');
//     await page.keyboard.press('Enter');

//     const button = page.locator('button.NewScheduleTabContent_search-btn__bv1HC');
//     await button.waitFor({ state: 'visible' });
//     await button.click();

//     await page.waitForSelector('div.ScheduleDetailCard_root__mSjFM', { timeout: 30000 });

//     let response;
//     try {
//             response = await page.evaluate(async () => {
//             const results = document.querySelectorAll('div.ScheduleDetailCard_root__mSjFM');
//             return await Promise.all(Array.from(results).map(async result => {
//                 const headerETD = result.querySelector('div.ScheduleItem_date__WLAPW[data-cy="new-schedule-departure"]').innerText;
//                 const headerETA = result.querySelector('div.ScheduleItem_date__WLAPW[data-cy="new-schedule-arrival"]').innerText;
    
//                 const button = result.querySelector('button.ScheduleButton_base__ivpyn.ScheduleButton_colorPrimary__phL_p.ScheduleButton_variantText__aRMWW.ScheduleButton_sizeMd__0xGYi.ScheduleDetailCard_displayDetailButton__31DcM');
//                 if (button && !button.classList.contains('open')) {
//                     button.click();
//                 }
    
//                 await new Promise(resolve => setTimeout(resolve, 3000));
    
//                 const scheduleData = result.querySelectorAll('div.ScheduleDetail_root__2wrBk');
                
//                 return Array.from(scheduleData).flatMap(data => {
//                     const finalresult = data.querySelectorAll('div.LocationItem_root__wCakl');
//                     return Array.from(finalresult).map(resultData => {
//                         const polEle = resultData.querySelector('div.LocationItem_info__Bx9tq > div > a.LocationItem_linkText__WdVKt');
//                         const etdEle = resultData.querySelector('div.LocationItem_info__Bx9tq > div.LocationItem_scheduleContainer__k_Uur > span.LocationItem_scheduleItem__JX_CL');
//                         const vesselEle = data.querySelector('div.JourneyItem_root__Eseoz > div.JourneyItem_detail__lKs_u > div.JourneyItem_leftSideContainer__UTvQd > div.JourneyItem_vesselWrapper__NlMjz > div.JourneyItem_vesselInfoContainer__lDV6P > div.JourneyItem_vesselInfo__VBlAY > a.JourneyItem_linkText__dU4D_').innerText;
//                         const PortCutoffEle = data.querySelector('div.JourneyItem_root__Eseoz > div.JourneyItem_detail__lKs_u > div.CutOffContent_wrapper__sJ0t9 > div.CutOffContent_cut-off__Zv7su > div.CutOffContent_info__Cmphz[data-cy="new-schedule-inland-cut-off"]');
//                         const DocsCutoffEle = data.querySelector('div.JourneyItem_root__Eseoz > div.JourneyItem_detail__lKs_u > div.CutOffContent_wrapper__sJ0t9 > div.CutOffContent_cut-off__Zv7su > div.CutOffContent_info__Cmphz[data-cy="new-schedule-doc-cut-off"]');
                        
//                         const regex = /^(.+?)\s([A-Z0-9]+)$/;

//                         const match = vesselEle.match(regex)
//                         let formattedVessel;
//                         let formattedVoyage;
//                         if (match) {
//                             formattedVessel = match[1].trim();
//                             formattedVoyage = match[2].trim();
//                         }

//                         const pol = polEle ? polEle.innerText : null;
//                         const etd = etdEle ? etdEle.innerText.trim().replace(/\s+/g, ' ') : null;
//                         const vessel = formattedVessel ? formattedVessel : null;
//                         const voyage = formattedVoyage ? formattedVoyage : null;
//                         const PortCutoff = PortCutoffEle ? PortCutoffEle.innerText : null;
//                         const DocsCutoff = DocsCutoffEle ? DocsCutoffEle.innerText : null;
        
//                         // const formattedEta = eta ? eta.replace(/\s+/g, ' ').trim() : '';
//                         const formattedEtd = etd ? etd.replace(/\s+/g, ' ').trim() : '';
        
//                         return {
//                             headerETD: headerETD,
//                             headerETA: headerETA,
//                             pol: pol,
//                             etd: formattedEtd,
//                             vessel: vessel,
//                             voyage: voyage,
//                             PortCutoff: PortCutoff,
//                             DocsCutoff : DocsCutoff
//                         };
//                     });
//                 });
//             }));
//         });
    
//         fs.writeFileSync('msc_rawdata.json', JSON.stringify(response, null, 2));
//         console.log("Data saved to msc_rawdata.json");

//     } catch (error) {
//         console.error("An error occurred:", error);
//     } finally {
//         if (browser) {
//             await browser.close();
//         }
//     }

//     fs.writeFileSync('one_rawdata.json', JSON.stringify(response, null, 2));
//     console.log("Data saved to one_rawdata.json")
//     await page.waitForTimeout(2000);
//     await browser.close();
}
one();