from selenium_driverless import webdriver
from selenium_driverless.types.by import By
import asyncio
import json
import requests


async def hmm():
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(options=options)

    targetUrl = "https://www.hmm21.com/e-service/general/schedule/selectPointToPointList.do"

    request_data = {
        "url": '',
        "all_request_cookies": None,
        "request_headers": None,
        "request_payload": None
    }

    async with (driver as browser):
        try:
            await browser.get('https://www.hmm21.com/e-service/general/schedule/ScheduleMain.do', wait_load=True)
            await browser.sleep(1)
            print("Successfully navigated to the page!")
            # # cookie_button = await browser.find_element(By.ID, 'onetrust-accept-btn-handler', timeout=10)
            # # if cookie_button:
            # #     print("Cookie consent button found.")
            # #     await cookie_button.click(move_to=True)
            # # else:
            # #     print("Cookie consent button not found.")
            # #
            # # # await driver.wait_for_cdp("Page.domContentEventFired", timeout=15)
            # #
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
            #
            port_from = "Nhava Sheva"
            pol = await browser.find_element(By.ID, 'srchPointFrom', timeout=3)
            await pol.focus()
            await pol.send_keys(port_from)
            await browser.sleep(5)
            dropdown_pol = await browser.find_element(By.CSS_SELECTOR, 'body > div.ac_results', timeout=5)
            await dropdown_pol.click(move_to=True)
            await asyncio.sleep(5)

            port_to = "Singapore"
            pod = await browser.find_element(By.ID, 'srchPointTo', timeout=3)
            await pod.focus()
            await pod.send_keys(port_to)
            await browser.sleep(5)
            dropdown_pod = await browser.find_element(By.CSS_SELECTOR, 'body > div:nth-child(34)', timeout=5)
            await dropdown_pod.click(move_to=True)
            await asyncio.sleep(5)
            #
            # search_card = await browser.find_element(By.CSS_SELECTOR, '.cards-search-button', timeout=5)
            # print(search_card)
            search_scedule = await browser.find_element(By.ID, 'btnRetrieve', timeout=5)
            if search_scedule:
                print("Search button found.")
                await search_scedule.click(move_to=True)
                await asyncio.sleep(3)
            else:
                print("Search button not found.")
            #
            await asyncio.sleep(5)
            print("Captured Cookies:", request_data['all_request_cookies'])

            print("Captured Headers:", json.dumps(request_data['request_headers'], indent=2))
            headers_with_cookie = request_data['request_headers'].copy()
            headers_with_cookie['Cookie'] = request_data['all_request_cookies']  # Add the cookies string to headers
            print(f"Updated Request Headers with Cookie: {json.dumps(headers_with_cookie, indent=2)}")
            print("Captured Payload:", json.dumps(request_data['request_payload'], indent=2))
            print("request url:", request_data['url'])

            try:
                print(request_data['url'])
                print(request_data['request_payload'])
                print(headers_with_cookie)
                payload = json.loads(request_data['request_payload'])
                print("after updated:",payload)
                # headers1 = {
                #   "accept": "application/json, text/javascript, */*; q=0.01",
                #   "accept-encoding": "gzip, deflate, br, zstd",
                #   "accept-language": "en-IN,en-GB;q=0.9,en-US;q=0.8,en;q=0.7",
                #   "content-length": "106",
                #   "content-type": "application/json; charset=UTF-8",
                #   "cookie": "ACEUCI=1; WMONID=56ALRB3UjNy; ACEFCID=UID-66D54CCC597E41723BC4648E; AUFAH2A43577377344=1725980400000000000|6|1726115274389222738|1|1725254860814658565; ACEUACS=1725254860814AUATMM; JSESSIONID=40470e1e09b34535912278299aad2090411aac5d4dd27e9d9374!-1463218541; X-Oracle-BMC-LBS-Route=6f87e2864f32a20cf423186fe64fc2e9857044fc92bc6f0f105ae405e89a1cb4deacee82decfcd86; ASAH2A43577377344=1729493252101937847%7C1729493252101937847%7C1729493252101937847%7C0%7Cbookmark; AUAH2A43577377344=1729493252101937847%7C11%7C1725254860419917753%7C1%7C1725254860814AUATMM%7C1; ARAH2A43577377344=httpswwwhmm21come-servicegeneralscheduleScheduleMaindobookmark; ak_bmsc=05993DA84DA99AA2E0F17E6849ECAAA1~000000000000000000000000000000~YAAQL3LBFxEjF3+SAQAAGLzUrRke+ITS+/th1ubn55T33MkYRji0aekYCF/StDjNpqOcNa0mk3nhRcFDKt/OXpX6+dylxdtdG0nvEHYgNYvBQt/ygZgCTBzTVEQ283Exx9BO9l15Otf//VHRwOKUYUpo3j1jh6YZ3c055esvUgTuX55AADoQ2IGGQPFI2qK3wDwcD1sC9/83wCrkVp0iiqi+XOlG5qjS4TCtRGMDREWa6GrZOsqJdh+Yq7RNSaZhp5UGIe7J+QoC1xeG/oqzVV4TIZXeFOOkgqUAthkgrPOuCMEFMtF3Hv2xe+alMZxEq6ob9tAkICS6D+OoPVAU/1ssh5owuRymbyyA8TNU0AZK++sF9BIcD/Km8jMmDONZmjukHZ7vTZF75HyQ57XwjGb/wUCbSfy5i8Lnsa3Ew/3o0vC7/F+Zq9Qaoup8BuneOX8FzXx3algTLf1+kw==; _abck=02440AB6E2B5A0EBC921AA69090CDDF8~0~YAAQL3LBF3ljF3+SAQAAPyzVrQykLOKe5e9JI10s84GwiNNL0Qo369yLIWHoLtBxBvekO/nKBgD/6brOgr7MnTVIog/yZ/XBKySK7oBnyCD/7ceQ9pqdCes3tsceTQIq0NRjFoEopSN4jrgBbKOeLMPEhx6ibgCMjj/WbxvFzbimyHGbvrNFR7bjDp9MxT3/sOcxtpL35jHdnXWHJjw4OiUL3TgATOevwx/VE98QdunUSW9jAGNtPr6/51UjOXdYlFm2ArLAnJ2TY1zOfUiV3PDz4OepLcEGgk7nXV6f5YZgVPkRKp7W/JOoh/wRTI48d4hgA9OpSO0V5Xz4+FgnK6IKfDLYjCF4PGreHedkMdvsjCDj6FB56/dmabq7FtBxVGHwZy3qJpdOz4K0wzb6LiYUn31fswHHLPurc1ZGLEAYxxYAVyfHnyIoud0xmLJz3cSHrXSpDZJ3JAv9K6Ej9c/OtHPxboNsJBpNvFovo1pQDKpxYNPI19sr0p05+oe6otLlc0lsWkI+AcChN0hYEw6jShVsIJtBsROUq6W5czS71BJRBb1tVzwRUlO6HzpdXCRJEK8m2ctsXkCNaagTu6M+En/FEagfbgjg3rYpRG1FR2O5GcQkuNMXT5plecBOADDtNAyumYgbwqDBU0DGClTaeyKtI+QYl7YbHa8Splfdqap4eF3RRz7uIBOE1Y5BJyyP7DzyZpldCcpk3aBUpcHfQJBqQQ57vC1Z2aDyZbSCt9/pE3yqQviY4A7PeFDkB89mKnUskf865Tn8N90ve1mygx8D+O8ZtUQD9hp3K82dWg==~-1~-1~-1; bm_sv=B7FEE8A8A29CF2AD3E2504097389F9D6~YAAQL3LBF3pjF3+SAQAAPyzVrRnfuLx79FsgUmub5wfsjLcIy0JZl7rdrkr3x+8R3qCVMj+gDYTXgzjyhTqOiWM9FWSnxenNSjiWGr7w6vhTCIEbpi9MFc7YMbAMYitGxJTxMr9ba73eTuwN7aNmI2zEktVQYHcvn7HxmFVSmyC5LieZMiVVEQKlaUSgO8vvjA4lB+7DXdybfX0Dp7PgBa/ghmepeKq+RqBJDjuJIC0nUe/M3HYLpT4Ltzk3DlI=~1; bm_sz=6E19E085F983959AC0A901C1760296C8~YAAQL3LBF3tjF3+SAQAAPyzVrRlAM71Qq/4Wn6Y4vZP8efMHKAHQNj0r4/plewkPaFYbQrr5+k0X3kHgEa+Hl2n8rfeWKZXkBSPNgc8Db4CXGFO2kT8jdENgB9GIw2a9nMwYdNIJr12ltkbxzamjIqzVYgdumBZ7eqZPEhJ3EKWLnsuJB4g+71i62keaBP/0ldCcVythgwNT+G44TqJfOzSx3OwZsXZOOaEktpd2Q+1fGiA/pH9oBRP5uHwhIGpvPh/SzadcXv5pgTBna2J0d6T9yfbcHzhSRmIwwB9TVqjDAKRs2rWvyFC/BaRUV4/DSPzafK51c29QVbe7EtcmyPVR5SMwDdAV0d/QdyBS9Xk7nZ7GWNnPcYvTk0pWZvQbtj6UDwTrUJ0ADRd8/QKW6eDwkTU0~4342322~4408133",
                #   "origin": "https://www.hmm21.com",
                #   "priority": "u=1, i",
                #   "referer": "https://www.hmm21.com/e-service/general/schedule/ScheduleMain.do",
                #   "sec-ch-ua": "\"Google Chrome\";v=\"129\", \"Not=A?Brand\";v=\"8\", \"Chromium\";v=\"129\"",
                #   "sec-ch-ua-mobile": "?0",
                #   "sec-ch-ua-platform": "\"Windows\"",
                #   "sec-fetch-dest": "empty",
                #   "sec-fetch-mode": "cors",
                #   "sec-fetch-site": "same-origin",
                #   "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.4539.0 Safari/537.36",
                #   "x-requested-with": "XMLHttpRequest"
                # }
                #
                # payload1 = {
                #     "srchViewType": "L",
                #     "srchGrmNo": "O241021086003328",
                #     "srchSelPriority": "A",
                #     "srchSelSortBy": "D",
                #     "isNew": "true"
                # }
                # response = requests.request("POST", targetUrl, json=payload1, headers=headers1)
                response = requests.request("POST", request_data['url'], json=payload, headers=headers_with_cookie)
                # response = requests.post(request_data['url'], json=request_data['request_payload'], headers=headers_with_cookie)
                print(f"Status Code: {response.status_code}")
                await asyncio.sleep(3)
                # response.raise_for_status()
                print('Response text:', response.text)
                print('Response content:', response.content)
                print('Response data:', response.json())

                with open('hmm_rawdata.json', 'w') as json_file:
                    json.dump(response.json(), json_file, indent=2)

            except requests.exceptions.RequestException as e:
                print(f"Error: {e}")


        except Exception as e:
            print(f"Navigation error: {e}")
            browser.quit()
            return

        await browser.quit()


if __name__ == "__main__":
    asyncio.run(hmm())