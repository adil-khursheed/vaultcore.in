/// <reference types="chrome" />

// Content script for VaultCore Chrome Extension
// Handles auto-filling login forms on web pages

interface AutofillPayload {
  username: string;
  password: string;
}

/**
 * Find the password input field on the page
 */
function findPasswordField(): HTMLInputElement | null {
  // Look for visible password fields
  const passwordFields = document.querySelectorAll<HTMLInputElement>(
    'input[type="password"]'
  );

  for (const field of passwordFields) {
    if (isVisible(field)) {
      return field;
    }
  }

  return null;
}

/**
 * Find the username/email input field near a password field
 */
function findUsernameField(
  passwordField: HTMLInputElement
): HTMLInputElement | null {
  // Strategy 1: Look for input fields in the same form
  const form = passwordField.closest("form");
  if (form) {
    const inputs = form.querySelectorAll<HTMLInputElement>(
      'input[type="text"], input[type="email"], input[name*="user"], input[name*="email"], input[name*="login"], input[id*="user"], input[id*="email"], input[id*="login"], input[autocomplete="username"], input[autocomplete="email"]'
    );

    for (const input of inputs) {
      if (isVisible(input) && input !== passwordField) {
        return input;
      }
    }
  }

  // Strategy 2: Look for the closest preceding visible text/email input
  const allInputs = document.querySelectorAll<HTMLInputElement>(
    'input[type="text"], input[type="email"]'
  );

  let closestInput: HTMLInputElement | null = null;
  let closestDistance = Infinity;

  for (const input of allInputs) {
    if (!isVisible(input)) continue;

    const inputRect = input.getBoundingClientRect();
    const passwordRect = passwordField.getBoundingClientRect();

    // Calculate distance between the two fields
    const distance = Math.sqrt(
      Math.pow(inputRect.top - passwordRect.top, 2) +
        Math.pow(inputRect.left - passwordRect.left, 2)
    );

    // Prefer fields that appear before (above) the password field
    if (
      distance < closestDistance &&
      inputRect.top <= passwordRect.top + 50
    ) {
      closestDistance = distance;
      closestInput = input;
    }
  }

  return closestInput;
}

/**
 * Check if an element is visible on the page
 */
function isVisible(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element);
  return (
    style.display !== "none" &&
    style.visibility !== "hidden" &&
    style.opacity !== "0" &&
    element.offsetParent !== null
  );
}

/**
 * Set the value of an input field and dispatch appropriate events
 * so that frameworks (React, Angular, Vue) detect the change
 */
function setInputValue(input: HTMLInputElement, value: string): void {
  // Focus the input
  input.focus();

  // Use native value setter to bypass React's synthetic event system
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(input, value);
  } else {
    input.value = value;
  }

  // Dispatch events in the order that a real user interaction would
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.dispatchEvent(
    new KeyboardEvent("keydown", { bubbles: true, key: "a" })
  );
  input.dispatchEvent(
    new KeyboardEvent("keyup", { bubbles: true, key: "a" })
  );
}

/**
 * Perform the auto-fill operation
 */
function autofill(payload: AutofillPayload): { success: boolean; reason?: string } {
  const passwordField = findPasswordField();

  if (!passwordField) {
    return { success: false, reason: "No password field found on this page" };
  }

  // Fill password
  if (payload.password) {
    setInputValue(passwordField, payload.password);
  }

  // Fill username
  if (payload.username) {
    const usernameField = findUsernameField(passwordField);
    if (usernameField) {
      setInputValue(usernameField, payload.username);
    }
  }

  return { success: true };
}

// Listen for messages from the popup or background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "AUTOFILL") {
    const result = autofill(message.payload as AutofillPayload);
    sendResponse(result);
  }
  return true;
});
