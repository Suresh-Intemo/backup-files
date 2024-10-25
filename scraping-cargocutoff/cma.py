from selenium_driverless import webdriver
from selenium_driverless.types.by import By
import asyncio
import json
import  time

async def cma():
    options = webdriver.ChromeOptions()

    driver = webdriver.Chrome(options=options)

    # targetUrl = "https://elines.coscoshipping.com/ebschedule/public/purpoShipmentWs"
    # timeout_seconds = 300
    async with driver as browser:
        try:

            await browser.get('https://www.cma-cgm.com/ebusiness/schedules', wait_load=True, timeout=30)
            await browser.sleep(2)

            print("Successfully navigated to the page!")
            # cookie_button = await browser.find_element(By.ID, 'onetrust-accept-btn-handler', timeout=10)
            # if cookie_button:
            #     print("Cookie consent button found.")
            #     await cookie_button.click(move_to=True)
            # else:
            #     print("Cookie consent button not found.")
            #
            # # await driver.wait_for_cdp("Page.domContentEventFired", timeout=15)
            #
            # await browser.execute_cdp_cmd('Network.enable', {})
            #
            # async def capture_request(request):
            #     data = request
            #     print(data['request']['url'])
            #     if targetUrl in data['request']['url']:
            #         print(f"Request matched the target URL: {data['request']['url']}")
            #         print(f"Request Headers: {json.dumps(data['request']['headers'], indent=2)}")
            #         if 'postData' in request:
            #             print(f"Payload: {data['request']['postDataEntries']}")
            #
            #         cookies = await browser.get_cookies()
            #         print(f"Cookies: {json.dumps(cookies, indent=2)}")
            #
            # await browser.add_cdp_listener('Network.requestWillBeSent', capture_request)

            port_from = "INNSA"
            pol = await browser.find_element(By.ID, 'AutoCompletePOL', timeout=3)
            await pol.focus()
            await pol.send_keys(port_from)
            await browser.sleep(5)
            dropdown_pol = await browser.find_element(By.ID, 'sortedAutocompletePopup-AutoCompletePOL', timeout=5)
            await dropdown_pol.click(move_to=True, timeout=2)
            await browser.sleep(5)

            port_to = "SGSIN"
            pod = await browser.find_element(By.ID, 'AutoCompletePOD', timeout=3)
            await pod.focus()
            await pod.send_keys(port_to)
            await browser.sleep(5)
            dropdown_pod = await browser.find_element(By.ID, 'sortedAutocompletePopup-AutoCompletePOD', timeout=5)
            await dropdown_pod.click(move_to=True, timeout=2)
            await browser.sleep(5)

            search_scedule = await browser.find_element(By.ID, 'searchSchedules', timeout=5)
            if search_scedule:
                print("Search button found.")
                await search_scedule.click(move_to=True, timeout=2)
                await asyncio.sleep(3)
            else:
                print("Search button not found.")

            data = {}

            await asyncio.sleep(5)

            card_elements = await browser.find_elements(By.CLASS_NAME, "cardelem")
            print(card_elements)

            for index, card in enumerate(card_elements):
                card_data = {}
                print(index)

                try:
                    # Extract Earliest Departure and Arrival
                    departure = await card.find_element(By.ID, "capsule-earliest-departure").get_text()
                    arrival = await card.find_element(By.ID, "capsule-earliest-arrival").get_text()
                    card_data['Earliest Departure'] = departure
                    card_data['Earliest Arrival'] = arrival

                    # Extract Cut-off dates
                    cut_off_div = await card.find_element(By.CLASS_NAME, "cut-off-dates")
                    cut_off_details = await cut_off_div.find_elements(By.TAG_NAME, "dd")
                    cut_off_dates = [await dd.get_text() for dd in cut_off_details]
                    card_data['Cut-off Dates'] = cut_off_dates

                    # Extract Route information
                    route_list = await card.find_elements(By.CLASS_NAME, "route")
                    routes = []
                    for route in route_list:
                        departure_date = await route.find_element(By.CLASS_NAME, "DepartureDatesCls").get_text()
                        pol = await route.find_element(By.CLASS_NAME, "capsule").get_text()
                        vessel = await route.find_element(By.CLASS_NAME, "vessel").get_text()

                        routes.append({
                            "Departure Date": departure_date,
                            "POL": pol,
                            "Vessel": vessel
                        })
                    card_data['Routes'] = routes

                    # Extract Transit time
                    transit_time = await card.find_element(By.CLASS_NAME, "Transitcls").get_text()
                    card_data['Transit Time'] = transit_time

                    # Store the card data in the main dictionary
                    data[f'Card {index + 1}'] = card_data
                except Exception as e:
                    print(f"Error extracting data from card {index + 1}: {e}")
                    # Refetch elements if there's a stale or missing element error
                    card_elements = fetch_card_elements()

            # Print the extracted data
            print(data)


        except Exception as e:
            print(f"Navigation error: {e}")
            browser.quit()
            return

        await browser.quit()


if __name__ == "__main__":
    asyncio.run(cma())