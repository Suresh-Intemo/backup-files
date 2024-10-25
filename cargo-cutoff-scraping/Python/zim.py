from selenium_driverless import webdriver
from selenium_driverless.types.by import By
import asyncio
import json


async def zim():
    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(options=options)
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

            await browser.cdp_session.send("Network.enable")

            # Function to capture network requests
            async def capture_request(request):
                if "api" in request["request"]["url"]:
                    print("\n--- Intercepted Request ---")
                    print("URL:", request["request"]["url"])
                    if 'postData' in request["request"]:
                        print("Payload:", request["request"]["postData"])
                    print("Headers:", request["request"]["headers"])

            # Listen for network events
            browser.cdp_session.on("Network.requestWillBeSent", capture_request)

            port_from = "Nhava Sheva"
            pol = await browser.find_element(By.ID, 'p2p-origin', timeout=3)
            await pol.focus()
            await pol.send_keys(port_from)
            await browser.sleep(5)
            dropdown_pol = await browser.find_element(By.CSS_SELECTOR, '.rbt-menu', timeout=5)
            await dropdown_pol.click(move_to=True)
            await asyncio.sleep(5)

            port_to = "Colombo"
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
            
            await asyncio.sleep(3)


        except Exception as e:
            print(f"Navigation error: {e}")
            browser.quit()
            return

        browser.quit()

if __name__ == "__main__":
    asyncio.run(zim())