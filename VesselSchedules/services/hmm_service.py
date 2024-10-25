from selenium_driverless import webdriver
from selenium_driverless.types.by import By
import asyncio
import requests
import json

async def hmm_scraper(port_from: str, port_to: str):

    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(options=options)

    targetUrl = "https://www.hmm21.com/e-service/general/schedule/selectPointToPointList.do"

    request_data = {
        "url": '',
        "all_request_cookies": None,
        "request_headers": None,
        "request_payload": None
    }

    async with driver as browser:
        try:
            await browser.get('https://www.hmm21.com/e-service/general/schedule/ScheduleMain.do', wait_load=True)
            await browser.sleep(0.5)
            print("Successfully navigated to the page!")


            await browser.execute_cdp_cmd('Network.enable', {})

            async def capture_request(request):
                if targetUrl in request['request']['url']:
                    request_data['url'] = request['request']['url']
                    request_data['request_headers'] = request['request']['headers']
                    request_data['request_payload'] = request['request']['postData']


                    cookies = await browser.get_cookies()
                    request_data['all_request_cookies'] = "; ".join([f"{cookie['name']}={cookie['value']}" for cookie in cookies])

            await browser.add_cdp_listener('Network.requestWillBeSent', capture_request)

            # Input the origin port
            pol = await browser.find_element(By.ID, 'srchPointFrom', timeout=3)
            await pol.focus()
            await pol.send_keys(port_from)
            await browser.sleep(5)
            dropdown_pol = await browser.find_element(By.CSS_SELECTOR, 'body > div.ac_results', timeout=5)
            await dropdown_pol.click(move_to=True)
            await asyncio.sleep(5)

            # Input the destination port
            pod = await browser.find_element(By.ID, 'srchPointTo', timeout=3)
            await pod.focus()
            await pod.send_keys(port_to)
            await browser.sleep(5)
            dropdown_pod = await browser.find_element(By.CSS_SELECTOR, 'body > div:nth-child(34)', timeout=5)
            await dropdown_pod.click(move_to=True)
            await asyncio.sleep(5)

            search_scedule = await browser.find_element(By.ID, 'btnRetrieve', timeout=5)
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
                print(request_data['url'])
                print(request_data['request_payload'])
                print(headers_with_cookie)
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
