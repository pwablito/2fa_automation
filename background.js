let injection_statuses = {
    "github": false,
    "twitter": false,
    "google": false,
    "facebook": false,
    "amazon": false
}

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.status == "complete") {
        // Page loaded, now decide which content script to inject
        if (injection_statuses.github) {
            if (tab.url.includes("github.com")) {
                chrome.tabs.executeScript(tabId, { file: "github.js" });
            }
        }
        if (injection_statuses.twitter) {
            if (tab.url.includes("twitter.com")) {
                chrome.tabs.executeScript(tabId, { file: "twitter.js" });
            }
        }
        if (injection_statuses.google) {
            if (tab.url.includes("myaccount.google.com") || tab.url.includes("accounts.google.com")) {
                chrome.tabs.executeScript(tabId, { file: "google.js" });
            }
        }
        if (injection_statuses.facebook) {
            if (tab.url.includes("facebook.com")) {
                chrome.tabs.executeScript(tabId, { file: "facebook.js" });
            }
        }
        if (injection_statuses.amazon) {
            if (tab.url.includes("amazon.com")) {
                chrome.tabs.executeScript(tabId, { file: "amazon.js" });
            }
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

chrome.runtime.onMessage.addListener(
    function(request, _, _) {
        if (request.disable_injection) {
            injection_statuses[request.service] = false;
        } else if (request.enable_injection) {
            injection_statuses[request.service] = true;
        }
    }
);