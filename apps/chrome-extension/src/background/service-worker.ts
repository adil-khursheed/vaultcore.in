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

  if (message.type === "SET_CREDENTIAL_HOSTS") {
    const hosts = (message.payload?.hosts ?? {}) as Record<string, number>;

    void chrome.storage.session
      .set({ [BADGE_HOSTS_KEY]: hosts })
      .then(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          void updateBadgeForTab(tabs[0]);
          sendResponse({ success: true });
        });
      });

    return true;
  }
});

const BADGE_HOSTS_KEY = "vaultcore_badge_hosts";

async function readBadgeHosts(): Promise<Record<string, number>> {
  const result = await chrome.storage.session.get(BADGE_HOSTS_KEY);
  return (result[BADGE_HOSTS_KEY] as Record<string, number>) ?? {};
}

/**
 * Show how many saved logins match the current tab. The popup sends a
 * hostname → count map after decrypting items; the service worker never sees
 * decrypted credentials.
 */
async function updateBadgeForTab(tab?: chrome.tabs.Tab) {
  if (!tab?.id || !tab.url) {
    await chrome.action.setBadgeText({ text: "" });
    return;
  }

  let hostname: string;
  try {
    const url = new URL(tab.url);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      await chrome.action.setBadgeText({ tabId: tab.id, text: "" });
      return;
    }
    hostname = url.hostname.replace(/^www\./, "");
  } catch {
    await chrome.action.setBadgeText({ tabId: tab.id, text: "" });
    return;
  }

  const hosts = await readBadgeHosts();
  const count = hosts[hostname] ?? 0;

  await chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
  await chrome.action.setBadgeText({
    tabId: tab.id,
    text: count > 0 ? String(count) : "",
  });
}

// Update badge when the active tab changes
chrome.tabs.onActivated.addListener(({ tabId }) => {
  chrome.tabs.get(tabId, (tab) => {
    void updateBadgeForTab(tab);
  });
});

// Update badge when the URL changes
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    void updateBadgeForTab(tab);
  }
});
