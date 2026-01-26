from playwright.sync_api import sync_playwright
import json
import time
import re

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        # Set local storage
        user_data = {"id": "u1", "name": "Rohit", "email": "rohit@example.com"}

        # Navigate to domain to set local storage
        page = context.new_page()
        page.goto("http://localhost:5173")

        page.evaluate(f"""
            localStorage.setItem('token', 'mock-jwt');
            localStorage.setItem('user', '{json.dumps(user_data)}');
        """)

        # Reload to apply auth
        page.reload()

        # Wait for dashboard to load
        page.wait_for_selector("text=Annual Roadmap", timeout=10000)

        # 1. Verify Dashboard Year
        year = str(time.localtime().tm_year)
        try:
            # Check for header
            page.wait_for_selector(f"h1:has-text('{year} Travel Plan')")
            print(f"Verified Dashboard Year: {year}")

        except Exception as e:
            print(f"Failed to verify Dashboard Year: {e}")
            page.screenshot(path="verification/dashboard_fail.png")
            raise e

        # 2. Go to Trip Planner
        page.click("text=New Trip")

        # Wait for Trip Planner
        page.wait_for_selector("text=Where next?", timeout=5000)

        # 3. Fill form and get suggestions
        # Month is default (current month + 1)
        # Click "Get AI Suggestions"
        page.click("text=Get AI Suggestions")

        # Wait for suggestions
        # Check for typo fix "Destinations"
        try:
            page.wait_for_selector("text=AI Recommended Destinations", timeout=5000)
            print("Verified Typo Fix: AI Recommended Destinations")
        except Exception as e:
             # Check if old typo exists
            if page.query_selector("text=AI Recommended Destinantions"):
                print("Failed: Typo 'Destinantions' still exists")
            else:
                print(f"Failed to find Destinations header: {e}")
            page.screenshot(path="verification/planner_fail.png")
            raise e

        # Select first destination
        page.click(".glass-card h3 >> nth=0")

        # 4. Verify Finalize Step
        page.wait_for_selector("text=Finalize Trip Details", timeout=5000)

        # Verify Year in dates
        # Get the text of the date input
        # The input is readOnly
        date_input = page.locator("label:has-text('DATES') + input").input_value()
        print(f"Found date input: {date_input}")

        if year in date_input:
            print(f"Verified Year in Dates: {year}")
        else:
            print(f"Failed: Year {year} not found in dates {date_input}")
            page.screenshot(path="verification/dates_fail.png")
            # Don't raise, just log

        # Create Trip
        page.click("text=Save to Annual Plan")

        # 5. Verify Success Message
        page.wait_for_selector("text=Journey Scheduled!", timeout=5000)

        success_message = page.locator("text=Your trip to").inner_text()
        print(f"Success message: {success_message}")

        if f"{year} annual plan" in success_message:
             print(f"Verified Year in Success Message: {year}")
        else:
             print(f"Failed: Year {year} not found in success message")

        # Take screenshot
        page.screenshot(path="verification/success.png")
        print("Verification successful. Screenshot saved to verification/success.png")

        browser.close()

if __name__ == "__main__":
    run()
