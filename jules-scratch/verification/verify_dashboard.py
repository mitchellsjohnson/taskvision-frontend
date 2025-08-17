from playwright.sync_api import sync_playwright, Page, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Navigate to the dashboard
    page.goto("http://localhost:4040/dashboard")

    # Wait for the main dashboard heading to be visible
    # This ensures the page is loaded before we take a screenshot
    dashboard_heading = page.get_by_role("heading", name="Most Important Tasks")
    expect(dashboard_heading).to_be_visible(timeout=30000) # 30 second timeout

    # Take a screenshot
    page.screenshot(path="jules-scratch/verification/dashboard-light.png")

    # Find the dark mode toggle and click it
    # I will assume the toggle is a button with a specific aria-label or role.
    # I'll need to inspect DarkModeToggle.tsx to be sure, but for now I'll guess.
    # Let's assume it has a label "Toggle dark mode"

    # Reading the DarkModeToggle.tsx file now to find the right selector.
    # The file listing shows src/components/DarkModeToggle.tsx

    # Okay, let's assume I've read it and it's a button.
    # I will add this logic in the next step after verifying this initial script.

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
