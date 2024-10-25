from selenium_driverless import webdriver
from selenium_driverless.types.by import By
import asyncio
import requests


async def zim_scraper(port_from: str, port_to: str):

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
                await cookie_button.click(move_to=True)

            await browser.execute_cdp_cmd('Network.enable', {})

            async def capture_request(request):
                if targetUrl in request['request']['url']:
                    request_data['url'] = request['request']['url']
                    request_data['request_headers'] = request['request']['headers']
                    if 'postData' in request:
                        request_data['request_payload'] = request['request']['postDataEntries']
                    cookies = await browser.get_cookies()
                    request_data['all_request_cookies'] = "; ".join([f"{cookie['name']}={cookie['value']}" for cookie in cookies])

            await browser.add_cdp_listener('Network.requestWillBeSent', capture_request)

            # Input the origin port
            pol = await browser.find_element(By.ID, 'p2p-origin', timeout=3)
            await pol.focus()
            await pol.send_keys(port_from)
            await browser.sleep(5)
            dropdown_pol = await browser.find_element(By.CSS_SELECTOR, '.rbt-menu', timeout=5)
            pol_first_option = await dropdown_pol.find_element(By.CSS_SELECTOR, 'a:first-child')
            await pol_first_option.click(move_to=True)
            # await dropdown_pol.click(move_to=True)
            await asyncio.sleep(5)

            # Input the destination port
            pod = await browser.find_element(By.ID, 'p2p-destination', timeout=3)
            await pod.focus()
            await pod.send_keys(port_to)
            await browser.sleep(5)
            dropdown_pod = await browser.find_element(By.CSS_SELECTOR, '.rbt-menu', timeout=5)
            pod_first_option = await dropdown_pod.find_element(By.CSS_SELECTOR, 'a:first-child')
            await pod_first_option.click(move_to=True)
            await asyncio.sleep(5)

            search_card = await browser.find_element(By.CSS_SELECTOR, '.cards-search-button', timeout=5)
            search_schedule = await search_card.find_element(By.CSS_SELECTOR, 'input.btn.btn-primary', timeout=5)
            await search_schedule.click(move_to=True)

            await asyncio.sleep(7)

            headers_with_cookie = request_data['request_headers'].copy()
            headers_with_cookie['cookie'] = request_data['all_request_cookies']

            try:
                response = requests.get(request_data['url'], headers=headers_with_cookie)
                response.raise_for_status()
                print(response.json())
                return response.json()
            except requests.exceptions.RequestException as e:
                return {"error": str(e)}

        except Exception as e:
            return {"error": str(e)}
        finally:
            await browser.quit()
