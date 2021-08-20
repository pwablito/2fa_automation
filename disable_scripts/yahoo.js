console.log("yahoo.js disable script injected");

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
        yahoo_error: true,
        message: "Sorry! Something went wrong. ",
        message_for_dev: window.location.href
    });
}

async function handleReceivedMessage(request) {
    if (request.yahoo_email) {
        if (await waitUntilElementLoad(document, "#login-username", 2)) {
            document.querySelector("#login-username").value = request.email;
            document.querySelector("#login-signin").click();
        }
    } else if (request.yahoo_password) {
        if (await waitUntilElementLoad(document, "#login-passwd", 2)) {
            document.querySelector("#login-passwd").value = request.password;
            document.querySelector("#login-signin").click();
        }
    } else if (request.yahoo_SMS_code) {
        if (await waitUntilElementLoad(document, "#verification-code-field", 2)) {
            document.querySelector("#verification-code-field").value = request.code;
            document.querySelector("#verify-code-button").click()
        }
    } else if (request.yahoo_TOTP_code) {
        if (await waitUntilElementLoad(document, "#verification-code-field", 2)) {
            document.querySelector("#verification-code-field").value = request.code;
            document.querySelector("#verify-code-button").click();
        }
    }
}

chrome.runtime.onMessage.addListener(
    function(request, _) {
        handleReceivedMessage(request).then()
    }
);

(async() => {
    try {
        if (window.location.href.includes("login.yahoo.com")) {
            if (window.location.href.includes("myaccount/security")) {
                if (window.location.href.includes("two-step-verification")) {
                    console.log("Inside twosv")
                    if (await waitUntilElementLoad(document, "#btnTsvTurnOff", 2)) {
                        console.log("Found off button. Trying to turn it off.");
                        document.querySelector("#btnTsvTurnOff").click();
                        chrome.runtime.sendMessage({
                            yahoo_finished: true,
                        });
                    } else {
                        chrome.runtime.sendMessage({
                            yahoo_error: true,
                            error: "2FA not enabled"
                        });
                    }
                } else {
                    console.log("in this loop");
                    chrome.runtime.sendMessage({
                        yahoo_get_email: true,
                    });
                }
            } else if (window.location.href.includes("manage_account")) {
                document.querySelector(".add-account").click();
            } else if (document.querySelector("#login-username") !== null) {
                chrome.runtime.sendMessage({
                    yahoo_get_email: true
                });
            } else if (window.location.href.includes("account/challenge/password")) {
                chrome.runtime.sendMessage({
                    yahoo_get_password: true,
                });
            } else if (window.location.href.includes("account/challenge/tsv-authenticator")) {
                chrome.runtime.sendMessage({
                    yahoo_get_TOTP_code: true,
                });

            } else if (window.location.href.includes("phone-verify")) {
                chrome.runtime.sendMessage({
                    yahoo_get_SMS_code: true,
                });
            } else if (window.location.href.includes("account/challenge/challenge-selector")) {
                document.querySelector("button[type='submit']").click()
            }
        }

    } catch (e) {
        console.log(e);
        exitScriptWithError();

    }
})();