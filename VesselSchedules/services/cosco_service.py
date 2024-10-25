from selenium_driverless import webdriver
from selenium_driverless.types.by import By
import asyncio
import requests
import json

async def cosco_scraper(port_from: str, port_to: str):

    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(options=options)

    targetUrl = "https://elines.coscoshipping.com/ebschedule/public/purpoShipmentWs"

    request_data = {
        "url": '',
        "all_request_cookies": None,
        "request_headers": None,
        "request_payload": None
    }
    timeout_seconds = 300

    async with driver as browser:
        try:
            await browser.get('https://elines.coscoshipping.com/ebusiness/sailingSchedule/searchByCity', wait_load=True,  timeout=timeout_seconds)
            await browser.sleep(2)
            print("Successfully navigated to the page!")

            await browser.execute_cdp_cmd('Network.enable', {})

            async def capture_request(request):
                data = request
                print(data['request']['url'])
                if targetUrl in data['request']['url']:
                    request_data['url'] = data['request']['url']
                    request_data['request_headers'] = data['request']['headers']
                    print(f"Request matched the target URL: {data['request']['url']}")
                    print(f"Request: {json.dumps(data, indent=2)}")
                    print(f"Request Headers: {json.dumps(data['request']['headers'], indent=2)}")
                    request_data['request_payload'] = data['request']['postData']
                    # if 'postData' in request:
                    #     request_data['request_payload'] = data['request']['postData']
                    #     print(f"Payload: {data['request']['postDataEntries']}")

                    cookies = await browser.get_cookies()
                    cookies_str = "; ".join([f"{cookie['name']}={cookie['value']}" for cookie in cookies])
                    request_data['all_request_cookies'] = cookies_str
                    print(f"Cookies: {json.dumps(cookies, indent=2)}")

            await browser.add_cdp_listener('Network.requestWillBeSent', capture_request)

            # Input the origin port
            pol = await browser.find_element(By.CSS_SELECTOR,
                                             'input.ivu-select-input[placeholder="Origin City (City,Province,Country/Region)"]',
                                             timeout=3)
            await pol.focus()
            await pol.send_keys(port_from)
            await browser.sleep(5)
            dropdown_pol = await browser.find_element(By.CSS_SELECTOR,
                                                      'body > div.app-wrapper.new-eb-layout > div > div.__panel > div > div.content > div.main-content > div:nth-child(1) > div > div > div > div > div > div > form > div:nth-child(1) > div.ivu-col.ivu-col-span-14 > div > div > div > div.ivu-select-dropdown > ul.ivu-select-dropdown-list > div',
                                                      timeout=5)
            await dropdown_pol.click(move_to=True)
            await asyncio.sleep(5)

            # Input the destination port
            pod = await browser.find_element(By.CSS_SELECTOR,
                                             'input.ivu-select-input[placeholder="Destination City (City,Province,Country/Region)"]',
                                             timeout=3)
            await pod.focus()
            await pod.send_keys(port_to)
            await browser.sleep(5)
            dropdown_pod = await browser.find_element(By.CSS_SELECTOR,
                                                      'body > div.app-wrapper.new-eb-layout > div > div.__panel > div > div.content > div.main-content > div:nth-child(1) > div > div > div > div > div > div > form > div:nth-child(2) > div.ivu-col.ivu-col-span-14 > div > div > div > div.ivu-select-dropdown > ul.ivu-select-dropdown-list > div',
                                                      timeout=5)
            await dropdown_pod.click(move_to=True)
            await asyncio.sleep(5)

            search_scedule = await browser.find_element(By.CSS_SELECTOR, '.btnSearch.ivu-btn', timeout=5)
            if search_scedule:
                print("Search button found.")
                await search_scedule.click(move_to=True)
                await asyncio.sleep(3)
            else:
                print("Search button not found.")

            await asyncio.sleep(5)

            headers_with_cookie = request_data['request_headers'].copy()
            headers_with_cookie['Cookie'] = request_data['all_request_cookies']

            try:
                payload = json.loads(request_data['request_payload'])
                print("after updated:", payload)
                response = requests.request("POST", request_data['url'], json=payload, headers=headers_with_cookie)
                response.raise_for_status()
                print('Response data:', response.json())
                return response.json()
            except requests.exceptions.RequestException as e:
                return {"error": str(e)}

        except Exception as e:
            return {"error": str(e)}
        finally:
            await browser.quit()
