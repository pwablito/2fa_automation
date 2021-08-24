console.log("reddit.js setup script injected");


function change(field, value) {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: false, key: '', char: '' }));
}

function getElementByXpath(doc, xpath) {
    return doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function timer(ms) { return new Promise(res => setTimeout(res, ms)); }

// maxWait is in seconds
async function waitUntilPageLoad(document, maxWait) {
    for (let i = 0; i < maxWait * 10; i++) {
        if (document.readyState !== 'loading') { return true; }
        console.log(i);
        await timer(100); // then the created Promise can be awaited
    }
    return false;
}

async function waitUntilElementLoad(document, elemXPath, maxWait) {
    for (let i = 0; i < maxWait * 10; i++) {
        if (document.querySelector(elemXPath)) { return true; }
        console.log(i);
        await timer(100); // then the created Promise can be awaited
    }
    return false;
}

function exitScriptWithError() {
    // When debugging comment out code of this function. This will stop closing of background pages.
    chrome.runtime.sendMessage({
        reddit_error: true,
        message: "Sorry! Something went wrong. ",
        message_for_dev: window.location.href
    });
}

async function handleReceivedMessage(request) {
    if (request.reddit_credentials) {
        document.querySelector("[name=username]").value = request.login;
        document.querySelector("[type=password]").value = request.password;
        getElementByXpath(document, "//button[contains(text(),'Log In')]").click();
        setTimeout(() => {
            if (document.querySelector("[class$=errorMessage]").textContent !== "") {
                chrome.runtime.sendMessage({
                    reddit_get_credentials: true,
                    message: "Invalid credentials",
                    type: "username"
                });
            }
        }, 2000);
    } else if (request.reddit_password) {
        change(document.querySelector('[type=password]'), request.password);
        document.querySelector("[type=submit]").click();
        setTimeout(() => {
            if (document.querySelector("[class$=errorMessage][data-for=password]").textContent !== "") {
                document.querySelector("[class$=errorMessage][data-for=password]").textContent = "";
                chrome.runtime.sendMessage({
                    reddit_get_password: true,
                    message: "Incorrect password"
                });
            } else if (document.querySelector("#canvas-fallback-content").textContent != "") {
                chrome.runtime.sendMessage({
                    reddit_get_code: true,
                    type: "totp",
                    totp_seed: document.querySelector("#canvas-fallback-content").textContent,
                });
            } else if (document.querySelector("[class$=submitStatusMessage]").textContent !== "") {
                chrome.runtime.sendMessage({
                    reddit_error: true,
                    message: "2FA is already enabled.",
                    message_for_dev: window.location.href
                });
            } else { exitScriptWithError(); }
        }, 2000);
    } else if (request.reddit_code) {
        change(document.querySelector("#otp"), request.code);
        getElementByXpath(document, "//button[contains(text(),'Complete setup')]").click();
        setTimeout(() => {
            if (document.querySelector("[class$=errorMessage][data-for=otp]").textContent !== "") {
                document.querySelector("[class$=errorMessage][data-for=otp]").textContent = "";
                chrome.runtime.sendMessage({
                    reddit_get_code: true,
                    type: "totp",
                    totp_seed: document.querySelector("#canvas-fallback-content").textContent,
                    message: "Invalid code"
                })
            } else {
                chrome.runtime.sendMessage({
                    reddit_finished: true
                });
            }
        }, 2000);
    }
}


chrome.runtime.onMessage.addListener(
    function(request, _) {
        handleReceivedMessage(request).then();
    }
);

(async() => {
    try {
        if (window.location.href.includes("reddit.com/2fa/enable")) {
            await waitUntilPageLoad(document, 2);
            if (document.querySelector("[type=password]") != null) {
                console.log("Send password request");
                chrome.runtime.sendMessage({
                    reddit_get_password: true
                });
            } else { exitScriptWithError(); }
        } else if (window.location.href.includes("reddit.com/login")) {
            await waitUntilPageLoad(document, 2);
            if (document.querySelector("[type=password]")) {
                chrome.runtime.sendMessage({
                    reddit_get_credentials: true,
                    type: "username"
                });
            } else {
                window.location.href = "https://www.reddit.com/2fa/enable";
            }
        } else if (window.location.href === "https://www.reddit.com/") {
            window.location.href = "https://www.reddit.com/2fa/enable";
        } else { exitScriptWithError(); }
    } catch (e) {
        console.log(e);
        // Deal with the fact the chain failed
    }
})();