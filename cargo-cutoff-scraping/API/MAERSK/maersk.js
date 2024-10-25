import axios from "axios";
import fs from 'fs';

async function Maersk() {
    const porCode = 'INNSA';
    const delCode = 'AEJEA';
    const headerKey = 'Consumer-Key';
    const location_type = 'CITY'
    const consumer_key = 'lCTMXoSszDHdGbDn2pGhM3GzyiNsNiZj';

    const pol_url = `https://api.maersk.com/reference-data/locations?UNLocationCode=${porCode}&locationType=${location_type}`;
    const pol_res = await axios.get(pol_url,{
        headers: {
          [headerKey]: consumer_key,  
          'Content-Type': 'application/json' 
        }
    });

    fs.writeFileSync('pol.json', JSON.stringify(pol_res.data, null, 2));
    console.log('Data has been saved to pol.json');

    const del_url = `https://api.maersk.com/reference-data/locations?UNLocationCode=${delCode}&locationType=${location_type}`;
    const del_res = await axios.get(del_url,{
        headers: {
            [headerKey]: consumer_key,  
            'Content-Type': 'application/json'   
        }
    });
    fs.writeFileSync('del.json', JSON.stringify(del_res.data, null, 2));
    console.log('Data has been saved to del.json');

    let pol_geoCode;
    let del_geoCode;
    let pol_cityName;
    let pol_countyCode;
    try {
        const data = fs.readFileSync('pol.json', 'utf8');
        const jsonData = JSON.parse(data);
        jsonData.forEach((item) => {
          pol_geoCode = item.carrierGeoID
          pol_cityName = item.cityName
          pol_countyCode = item.countryCode
        });

        console.log(pol_geoCode)
    } catch (err) {
      console.error('Error reading or parsing JSON file:', err);
    }

    try {
      const data = fs.readFileSync('del.json', 'utf8');
      const jsonData = JSON.parse(data);
      jsonData.forEach((item) => {
        del_geoCode = item.carrierGeoID
      });

      console.log(del_geoCode)
      const CarrierCode = 'MAEU'

      const schedule_url = `https://api.maersk.com/products/ocean-products?vesselOperatorCarrierCode=${CarrierCode}&carrierCollectionOriginGeoID=${pol_geoCode}&carrierDeliveryDestinationGeoID=${del_geoCode}`;
      const schedule_res = await axios.get(schedule_url,{
              headers: {
                  [headerKey]: consumer_key,  
                  'Content-Type': 'application/json'   
              }
          });
          fs.writeFileSync('schedule_info.json', JSON.stringify(schedule_res.data, null, 2));
          console.log('Data has been saved to schedule_info.json');
    } catch (err) {
      console.error('Error reading or parsing JSON file:', err);
    }

    let vesselDetails = [];
    try {
      const data = fs.readFileSync('schedule_info.json', 'utf8');
      const jsonData = JSON.parse(data);
      jsonData.oceanProducts.forEach((item) => {
          item.transportSchedules.forEach((data) => {
              data.transportLegs.forEach((value) => {
                  console.log("IMONumber",value.transport.vessel.vesselIMONumber);
                  console.log("voyage",value.transport.carrierDepartureVoyageNumber);
                  vesselDetails.push({
                    vesselIMONumber: value.transport.vessel.vesselIMONumber,
                    carrierDepartureVoyageNumber: value.transport.carrierDepartureVoyageNumber
                  });
              })
              
          })
        })
    }
    catch (err) {
      console.error('Error reading or parsing JSON file:', err);
    }
    console.log(vesselDetails);
    // const vesselIMONumber = '9193276'
    // const carrierDepartureVoyageNumber = '438W'

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const makeApiCalls = async () => {
      for (const vessel of vesselDetails) {
        const deadline_url = `https://api.maersk.com/shipment-deadlines?ISOCountryCode=${pol_countyCode}&portOfLoad=${pol_cityName}&vesselIMONumber=${vessel.vesselIMONumber}&voyage=${vessel.carrierDepartureVoyageNumber}`;
        
        try {
          const deadline_res = await axios.get(deadline_url, {
            headers: {
              [headerKey]: consumer_key,
              'Content-Type': 'application/json'
            }
          });
          fs.appendFileSync('deadline.json', JSON.stringify(deadline_res.data, null, 2));
          console.log('Data has been saved to deadline.json');
          console.log(deadline_res.data);
        } catch (err) {
          console.error('Error fetching API:', "No deadlines found");
        }
  
        await sleep(2000);
      }
    };

    makeApiCalls();

}

Maersk();