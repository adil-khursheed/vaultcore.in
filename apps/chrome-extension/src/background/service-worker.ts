/// <reference types="chrome" />

// Background service worker for VaultCore Chrome Extension
// Handles communication between popup and content scripts

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("[VaultCore] Extension installed");
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "AUTOFILL") {
    // Forward autofill request to the active tab's content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            type: "AUTOFILL",
            payload: message.payload,
          },
          (response) => {
            sendResponse(response || { success: true });
          }
        );
      } else {
        sendResponse({ success: false, reason: "No active tab found" });
      }
    });
    return true; // Keep message channel open for async response
  }

  if (message.type === "GET_CURRENT_URL") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ url: tabs[0]?.url || "" });
    });
    return true;
  }
});

// Update badge when tab changes
chrome.tabs.onActivated.addListener(() => {
  // Badge could show count of matching credentials
  // This would require fetching credentials and matching URLs
  // For now, we clear the badge on tab change
  chrome.action.setBadgeText({ text: "" });
});

// Update badge when URL changes
chrome.tabs.onUpdated.addListener((_tabId, changeInfo) => {
  if (changeInfo.url) {
    chrome.action.setBadgeText({ text: "" });
  }
});
