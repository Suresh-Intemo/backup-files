import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const getData = async () => {
  const browser = await puppeteer.launch({
    headless: true, // Set to true for production
    defaultViewport: null,
  });

  const page = await browser.newPage();

  try {
    await page.goto("https://tax2win.in/guide/gst-hsn-code", {
      waitUntil: "domcontentloaded",
    });

    const tableSelector = "body > section > section.container-fluid.guides-section > div.gst-cnt-panel > div.col-md-9.col-lg-9 > div.row > div > div.table-responsive > table";
    await page.waitForSelector(tableSelector);
    const aTags = await page.$$eval(`${tableSelector} tbody a`, links => links.map(link => link.href));

    for (let i = 0; i < aTags.length; i++) {
      let href = aTags[i];

      // Extract the last segment of the URL path
      const urlSegment = path.basename(href);

      // Log the URL segment being used
      console.log(`URL segment extracted: ${urlSegment}`);

      // Navigate to the new page in the same tab
      await page.goto(href, {
        waitUntil: "domcontentloaded",
      });
      console.log(`Navigated to ${href}`);

      // Extract data from the table on the new page
      const table = await page.$("body > section > section.container-fluid > div > div > div > div > table");
      if (!table) {
        console.error(`Table not found on ${href}`);
        continue;
      }

      const jsonResult = await extractTableData(table);

      // Log extracted data
      console.log(`Data extracted from ${href}:`, jsonResult);

      // Write the collected data to a JSON file
      let allData = [];
      try {
        const existingData = fs.readFileSync('collected_data.json', 'utf8');
        allData = JSON.parse(existingData);
      } catch (error) {
        console.error("Error reading existing data:", error);
      }

      allData.push({
        Title: urlSegment, // Use the extracted URL segment
        data: jsonResult
      });

      try {
        fs.writeFileSync('collected_data.json', JSON.stringify(allData, null, 2));
        console.log(`Data appended to collected_data.json for ${urlSegment}`);
      } catch (error) {
        console.error("Error writing updated data:", error);
      }
    }

  } catch (error) {
    console.error("Error during scraping:", error);
  } finally {
    await browser.close();
  }
};

const extractTableData = async (tableHandle) => {
  const rows = await tableHandle.$$("tbody tr");

  // Define static headers
  const staticHeaders = ["Rate", "Products Description", "HSN Codes", "Export and Import HSN Codes"];

  const data = [];

  for (let i = 1; i < rows.length; i++) {
    // Extract both <th> and <td> elements
    let thCells = await rows[i].$$eval("th", elements => elements.map(element => element.innerText.trim()));
    let tdCells = await rows[i].$$eval("td", elements => elements.map(element => element.innerText.trim()));
    
    // Combine the contents of <th> and <td> elements
    const cells = thCells.concat(tdCells);

    const rowData = {};
    staticHeaders.forEach((header, index) => {
      rowData[header] = cells[index] || null;
    });
    data.push(rowData);
  }

  return data;
};

getData();
