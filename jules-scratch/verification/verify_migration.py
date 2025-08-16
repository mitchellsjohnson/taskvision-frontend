from playwright.sync_api import sync_playwright, Page, expect
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Listen for all console events and print them
    page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.type}: {msg.text}"))

    try:
        # Navigate to the app.
        print("Navigating to http://localhost:8000...")
        page.goto("http://localhost:8000", timeout=30000)

        # Click the 'Dashboard' button on the home page, using an exact match
        print("Clicking 'Dashboard' button...")
        dashboard_button = page.get_by_role("link", name="Dashboard", exact=True)
        dashboard_button.click()

        # Wait for the main dashboard heading to be visible
        dashboard_heading = page.get_by_role("heading", name="Most Important Tasks")
        expect(dashboard_heading).to_be_visible(timeout=30000)
        print("Dashboard loaded successfully.")

        # Click the "+ Add MIT" button
        add_mit_button = page.get_by_role("button", name="Add MIT")
        add_mit_button.click()
        print("Clicked 'Add MIT' button.")

        # Wait for the dialog to appear
        dialog_title = page.get_by_role("heading", name="Add New MIT")
        expect(dialog_title).to_be_visible(timeout=10000)
        print("Dialog opened.")

        # Take a screenshot in light mode
        page.screenshot(path="jules-scratch/verification/verification-light-mode.png")
        print("Took light mode screenshot.")

        # Click the dark mode toggle button
        dark_mode_button = page.get_by_label("Switch to Dark Mode")
        dark_mode_button.click()
        print("Clicked dark mode button.")

        # Give the theme a moment to apply
        time.sleep(1)

        # Take a screenshot in dark mode
        page.screenshot(path="jules-scratch/verification/verification-dark-mode.png")
        print("Took dark mode screenshot.")

    except Exception as e:
        print(f"An error occurred during verification: {e}")
        page.screenshot(path="jules-scratch/verification/error.png")
    finally:
        print("Closing browser.")
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
