from selenium_driverless import webdriver
from selenium_driverless.types.by import By
import asyncio
import json
import requests


async def zim():
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(options=options)

    targetUrl = "https://www.zim.com/api/v2/scheduleByRoute/getResult"

    request_data = {
        "url": '',
        "all_request_cookies": None,
        "request_headers": None,
        "request_payload": None
    }


    async with driver as browser:
        try:
            await browser.get('https://www.zim.com/schedules/point-to-point', wait_load=True)
            await browser.sleep(0.5)
            print("Successfully navigated to the page!")
            cookie_button = await browser.find_element(By.ID, 'onetrust-accept-btn-handler', timeout=10)
            if cookie_button:
                print("Cookie consent button found.")
                await cookie_button.click(move_to=True)
            else:
                print("Cookie consent button not found.")

            # await driver.wait_for_cdp("Page.domContentEventFired", timeout=15)

            await browser.execute_cdp_cmd('Network.enable', {})

            async def capture_request(request):
                data = request
                print(data['request']['url'])
                # print(f"Request: {json.dumps(data, indent=2)}")
                if targetUrl in data['request']['url']:
                    print(f"Request matched the target URL: {data['request']['url']}")
                    request_data['url'] = data['request']['url']
                    request_data['request_headers'] = data['request']['headers']
                    # print(f"Request: {json.dumps(data, indent=2)}")
                    print(f"Request Headers: {json.dumps(data['request']['headers'], indent=2)}")
                    if 'postData' in request:
                        request_data['request_payload'] = data['request']['postDataEntries']
                        print(f"Payload: {data['request']['postDataEntries']}")

                    cookies = await browser.get_cookies()
                    cookies_str = "; ".join([f"{cookie['name']}={cookie['value']}" for cookie in cookies])
                    request_data['all_request_cookies'] = cookies_str
                    print(f"Cookies: {json.dumps(cookies, indent=2)}")



            await browser.add_cdp_listener('Network.requestWillBeSent', capture_request)

            port_from = "Nhava Sheva"
            pol = await browser.find_element(By.ID, 'p2p-origin', timeout=3)
            await pol.focus()
            await pol.send_keys(port_from)
            await browser.sleep(5)
            dropdown_pol = await browser.find_element(By.CSS_SELECTOR, '.rbt-menu', timeout=5)
            await dropdown_pol.click(move_to=True)
            await asyncio.sleep(5)

            port_to = "Dublin "
            pod = await browser.find_element(By.ID, 'p2p-destination', timeout=3)
            await pod.focus()
            await pod.send_keys(port_to)
            await browser.sleep(5)
            dropdown_pod = await browser.find_element(By.CSS_SELECTOR, '.rbt-menu', timeout=5)
            await dropdown_pod.click(move_to=True)
            await asyncio.sleep(5)

            search_card = await browser.find_element(By.CSS_SELECTOR, '.cards-search-button', timeout=5)
            print(search_card)
            search_scedule = await search_card.find_element(By.CSS_SELECTOR, 'input.btn.btn-primary', timeout=5)
            if search_scedule:
                print("Search button found.")
                await search_scedule.click(move_to=True)
            else:
                print("Search button not found.")

            await asyncio.sleep(7)

            print("Captured Cookies:", request_data['all_request_cookies'])

            print("Captured Headers:", json.dumps(request_data['request_headers'], indent=2))
            headers_with_cookie = request_data['request_headers'].copy()
            headers_with_cookie['cookie'] = request_data['all_request_cookies']  # Add the cookies string to headers
            print(f"Updated Request Headers with Cookie: {json.dumps(headers_with_cookie, indent=2)}")
            print("Captured Payload:", json.dumps(request_data['request_payload'], indent=2))
            print("request url:", request_data['url'])

            try:
                response = requests.get(request_data['url'], headers=headers_with_cookie)
                response.raise_for_status()
                print(response.json())

                with open('response_data.json', 'w') as json_file:
                    json.dump(response.json(), json_file, indent=4)
            except requests.exceptions.RequestException as e:
                print(f"Error: {e}")


        except Exception as e:
            print(f"Navigation error: {e}")
            browser.quit()
            return

        await browser.quit()


if __name__ == "__main__":
    asyncio.run(zim())