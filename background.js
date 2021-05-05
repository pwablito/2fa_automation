chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.status == "complete") {
        // Page loaded, now decide which content script to inject
        if (tab.url.includes("github.com")) {
            chrome.tabs.executeScript(tabId, { file: "github.js" });
        }
        if (tab.url.includes("twitter.com")) {
            chrome.tabs.executeScript(tabId, { file: "twitter.js" });
        }
        if (tab.url.includes("myaccount.google.com") || tab.url.includes("accounts.google.com")) {
            chrome.tabs.executeScript(tabId, { file: "google.js" });
        }
        if (tab.url.includes("facebook.com")) {
            chrome.tabs.executeScript(tabId, { file: "facebook.js" });
        }
    }
});

chrome.browserAction.onClicked.addListener(function(_) {
    chrome.windows.create({
        url: chrome.runtime.getURL("popup.html"),
        type: "popup",
        height: 500,
        width: 375
    });
});