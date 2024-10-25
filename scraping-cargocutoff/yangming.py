from selenium_driverless import webdriver
from selenium_driverless.types.by import By
import asyncio
import json


async def hmm():
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(options=options)

    # targetUrl = "https://www.hmm21.com/e-service/general/schedule/selectPointToPointList.do"
    async with driver as browser:
        try:
            await browser.get('https://www.yangming.com/e-service/schedule/PointToPoint.aspx', wait_load=True)
            await browser.sleep(1)
            print("Successfully navigated to the page!")
            cookie_button = await browser.find_element(By.CSS_SELECTOR, '.cc-btn.cc-dismiss', timeout=10)
            if cookie_button:
                print("Cookie consent button found.")
                await cookie_button.click(move_to=True)
            else:
                print("Cookie consent button not found.")
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
            #
            port_from = "Nhava Sheva"
            pol = await browser.find_element(By.ID, 'ContentPlaceHolder1_txtFrom', timeout=3)
            await pol.focus()
            await pol.send_keys(port_from)
            await browser.sleep(5)
            dropdown_pol = await browser.find_element(By.CSS_SELECTOR, 'body > div:nth-child(4)', timeout=5)
            await dropdown_pol.click(move_to=True)
            await asyncio.sleep(5)
            #
            port_to = "Singapore"
            pod = await browser.find_element(By.ID, 'ContentPlaceHolder1_txtTo', timeout=3)
            await pod.focus()
            await pod.send_keys(port_to)
            await browser.sleep(5)
            dropdown_pod = await browser.find_element(By.CSS_SELECTOR, 'body > div:nth-child(6)', timeout=5)
            await dropdown_pod.click(move_to=True)
            await asyncio.sleep(5)
            # #
            # # search_card = await browser.find_element(By.CSS_SELECTOR, '.cards-search-button', timeout=5)
            # # print(search_card)
            search_scedule = await browser.find_element(By.CSS_SELECTOR, '.form_btn_100px', timeout=5)
            if search_scedule:
                print("Search button found.")
                await search_scedule.click(move_to=True)
                await asyncio.sleep(3)
            else:
                print("Search button not found.")
            #
            await asyncio.sleep(3)


        except Exception as e:
            print(f"Navigation error: {e}")
            browser.quit()
            return

        await browser.quit()


if __name__ == "__main__":
    asyncio.run(hmm())