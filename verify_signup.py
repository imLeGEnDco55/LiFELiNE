from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            print("Navigating to localhost:5173...")
            page.goto("http://localhost:5173")

            # Wait for the splash screen to disappear if there is one
            # The AuthPage should be visible. Look for "LiFELiNE"
            page.wait_for_selector("text=LiFELiNE", timeout=10000)

            print("Page loaded. Switching to Sign Up mode...")
            # Click "Regístrate" button
            # It's inside a button with text "Regístrate"
            page.get_by_role("button", name="Regístrate").click()

            print("Filling form with weak password...")
            # Fill email
            page.get_by_placeholder("Email").fill("test@example.com")

            # Fill name
            page.get_by_placeholder("Tu nombre").fill("Test User")

            # Fill weak password
            page.get_by_placeholder("Contraseña").fill("weak")

            print("Submitting form...")
            # Click "Crear Cuenta"
            page.get_by_role("button", name="Crear Cuenta").click()

            # Wait for toast
            # Toasts usually appear in a list or div. We can look for the text.
            print("Waiting for error toast...")
            error_message = "La contraseña debe tener al menos 8 caracteres."
            page.wait_for_selector(f"text={error_message}", timeout=5000)

            print("Error toast found!")

            # Take screenshot
            page.screenshot(path="verification_signup_weak_password.png")
            print("Screenshot saved to verification_signup_weak_password.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification_error.png")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
