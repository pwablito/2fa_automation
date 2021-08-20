let setup_injection_statuses = {
    "github": false,
    "twitter": false,
    "google": false,
    "facebook": false,
    "amazon": false,
    "reddit": false,
    "yahoo": false,
    "dropbox": false,
    "linkedin": false,
    //"pinterest": false,
}
let disable_injection_statuses = {
    "github": false,
    "twitter": false,
    "google": false,
    "facebook": false,
    "amazon": false,
    "reddit": false,
    "yahoo": false,
    "dropbox": false,
    "linkedin": false,
    //"pinterest": false,
}

let isStartingTabIncognito = false
let currentExtensionOpenedTabID = -10

chrome.tabs.onUpdated.addListener(function(tabId, info, tab) {
    if (info.status == "complete") {
        // Page loaded, now decide which content script to inject
        if (setup_injection_statuses.github) {
            if (tab.url.includes("github.com")) {
                chrome.tabs.executeScript(tabId, { file: "setup_scripts/github.js" });
            }
        }
        if (setup_injection_statuses.twitter) {
            if (tab.url.includes("twitter.com")) {
                chrome.tabs.executeScript(tabId, { file: "setup_scripts/twitter.js" });
            }
        }
        if (setup_injection_statuses.google) {
            if (tab.url.includes("myaccount.google.com") || tab.url.includes("accounts.google.com")) {
                chrome.tabs.executeScript(tabId, { file: "setup_scripts/google.js" });
            }
        }
        if (setup_injection_statuses.facebook) {
            if (tab.url.includes("facebook.com")) {
                chrome.tabs.executeScript(tabId, { file: "setup_scripts/facebook.js" });
            }
        }
        if (setup_injection_statuses.amazon) {
            if (tab.url.includes("amazon.com")) {
                chrome.tabs.executeScript(tabId, { file: "setup_scripts/amazon.js" });
            }
        }
        if (setup_injection_statuses.reddit) {
            console.log(tabId)
            if (tab.url.includes("reddit.com")) {
                chrome.tabs.executeScript(tabId, { file: "setup_scripts/reddit.js" });
            }
        }
        if (setup_injection_statuses.yahoo) {
            if (tab.url.includes("yahoo.com")) {
                chrome.tabs.executeScript(tabId, { file: "setup_scripts/yahoo.js" });
            }
        }
        if (setup_injection_statuses.dropbox) {
            if (tab.url.includes("dropbox.com")) {
                chrome.tabs.executeScript(tabId, { file: "setup_scripts/dropbox.js" })
            }
        }
        if (setup_injection_statuses.linkedin) {
            if (tab.url.includes("linkedin.com")) {
                chrome.tabs.executeScript(tabId, { file: "setup_scripts/linkedin.js" })
            }
        }
        // if (setup_injection_statuses.pinterest) {
        //     if (tab.url.includes("pinterest.com")) {
        //         chrome.tabs.executeScript(tabId, { file: "setup_scripts/pinterest.js" })
        //     }
        // }
        if (disable_injection_statuses.github) {
            if (tab.url.includes("github.com")) {
                chrome.tabs.executeScript(tabId, { file: "disable_scripts/github.js" });
            }
        }
        if (disable_injection_statuses.twitter) {
            if (tab.url.includes("twitter.com")) {
                chrome.tabs.executeScript(tabId, { file: "disable_scripts/twitter.js" });
            }
        }
        if (disable_injection_statuses.google) {
            if (tab.url.includes("myaccount.google.com") || tab.url.includes("accounts.google.com")) {
                chrome.tabs.executeScript(tabId, { file: "disable_scripts/google.js" });
            }
        }
        if (disable_injection_statuses.facebook) {
            if (tab.url.includes("facebook.com")) {
                chrome.tabs.executeScript(tabId, { file: "disable_scripts/facebook.js" });
            }
        }
        if (disable_injection_statuses.amazon) {
            if (tab.url.includes("amazon.com")) {
                chrome.tabs.executeScript(tabId, { file: "disable_scripts/amazon.js" });
            }
        }
        if (disable_injection_statuses.reddit) {
            if (tab.url.includes("reddit.com")) {
                chrome.tabs.executeScript(tabId, { file: "disable_scripts/reddit.js" });
            }
        }
        if (disable_injection_statuses.yahoo) {
            if (tab.url.includes("yahoo.com")) {
                chrome.tabs.executeScript(tabId, { file: "disable_scripts/yahoo.js" });
            }
        }
        if (disable_injection_statuses.dropbox) {
            if (tab.url.includes("dropbox.com")) {
                chrome.tabs.executeScript(tabId, { file: "disable_scripts/dropbox.js" })
            }
        }
        if (disable_injection_statuses.linkedin) {
            if (tab.url.includes("linkedin.com")) {
                chrome.tabs.executeScript(tabId, { file: "disable_scripts/linkedin.js" })
            }
        }
        // if (disable_injection_statuses.pinterest) {
        //     if (tab.url.includes("pinterest.com")) {
        //         chrome.tabs.executeScript(tabId, { file: "disable_scripts/pinterest.js" })
        //     }
        // }
    }
});

chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.windows.create({
        url: chrome.runtime.getURL("popup.html"),
        type: "popup",
        height: 550,
        width: 400,
    });
    if (tab.incognito) {
        isStartingTabIncognito = true;
    }
});

chrome.runtime.onMessage.addListener(
    function(request, _, _) {
        if (request.disable_injection) {
            if (request.type === "disable") {
                disable_injection_statuses[request.service] = false;
            } else if (request.type === "setup") {
                setup_injection_statuses[request.service] = false;
            } else {
                console.log("Error, invalid type")
            }
        } else if (request.enable_injection) {
            if (request.type === "disable") {
                disable_injection_statuses[request.service] = true;
            } else if (request.type === "setup") {
                setup_injection_statuses[request.service] = true;
            } else {
                console.log("Error, invalid type")
            }
        } else if (request.open_background_window) {
            console.log("Yolo", isStartingTabIncognito);
            if (isStartingTabIncognito) {
                chrome.windows.create({
                    url: request.url, //"https://www.reddit.com/2fa/enable",
                    focused: false,
                    incognito: true,
                    state: "minimized"
                }, (window) => {
                    chrome.windows.update(window.id, { state: 'minimized' });
                    currentExtensionOpenedTabID = window.tabs[0].id;
                });
            } else {
                chrome.windows.create({
                    url: request.url, //"https://www.reddit.com/2fa/enable",
                    focused: false,
                    state: "minimized"
                }, (window) => {
                    chrome.windows.update(window.id, { state: 'minimized' });
                    currentExtensionOpenedTabID = window.tabs[0].id;
                });
            }

        }
    }
);