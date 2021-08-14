console.log("amazon.js disable script injected");

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
        linkedin_error: true,
        message: "Sorry! Something went wrong. ",
        message_for_dev: window.location.href
    });
}

async function handleReceivedMessage(request) {
    if (request.amazon_code) {
        document.querySelector("#auth-mfa-otpcode").value = request.code;
        document.querySelector("#auth-signin-button").click();
    } else if (request.amazon_email) {
        document.querySelector("#ap_email").value = request.email;
        document.querySelector("#continue > span > input").click();
    } else if (request.amazon_password) {
        document.querySelector("#ap_password").value = request.password;
        document.querySelector("#signInSubmit").click();
    }
}

chrome.runtime.onMessage.addListener(
    function(request, _) {
        handleReceivedMessage(request).then();
    }
);

(async() => {
    try {
        if (window.location.href.includes("amazon.com/a/settings/approval")) {
            if (await waitUntilElementLoad(document, "#ch-delete-auth-app-link", 2)) {
                document.querySelector("#ch-delete-auth-app-link").click();
                if (await waitUntilElementLoad(document, "#chimera-remove-auth-app-popover", 2)) {
                    document.querySelector("#confirm-removeAuthApp-submit").click();
                }
            } else if (await waitUntilElementLoad(document, ".ch-settings-remove-phone", 2)) {
                document.querySelector(".ch-settings-remove-phone").click();
                if (await waitUntilElementLoad(document, "#chimera-remove-phone-popover", 2)) {
                    document.querySelector("#confirm-remove-dialog-backup-0-submit").click();
                }

            } else if (await waitUntilElementLoad(document, "#alert-box", 2)) {
                chrome.runtime.sendMessage({
                    amazon_finished: true,
                })

            } else if (await waitUntilElementLoad(document, "#disable-button", 2)) {
                document.querySelector("#disable-button").click()
                if (await waitUntilElementLoad(document, "#remove-devices-checkbox-input", 2)) {
                    document.querySelector("#remove-devices-checkbox-input").click();
                    document.querySelector("#confirm-disable-dialog-modal-submit").click();
                    chrome.runtime.sendMessage({
                        amazon_finished: true,
                    })
                }

            } else {
                chrome.runtime.sendMessage({
                    amazon_disable_error: true,
                    message: "2FA is already disabled for this account"
                })
            }

        } else if (window.location.href.includes("amazon.com/ap/signin")) {
            if (document.querySelector(".cvf-account-switcher")) {
                console.log("Signing out");
                document.querySelector("a[data-name='sign_out_request']").click();
            } else if (document.querySelector("#ap_switch_account_link") !== null) {
                document.querySelector("#ap_switch_account_link").click();
            } else if (document.querySelector("html > body > div:first-of-type > div:first-of-type > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div:first-of-type > div > div > div:nth-of-type(2) > div:nth-of-type(2) > a > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div") !== null) {
                document.querySelector("html > body > div:first-of-type > div:first-of-type > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div:first-of-type > div > div > div:nth-of-type(2) > div:nth-of-type(2) > a > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div").click();
            } else if (document.querySelector("#ap_password") !== null) {
                chrome.runtime.sendMessage({
                    amazon_get_password: true,
                });
            } else if (document.querySelector("#ap_email") !== null) {
                chrome.runtime.sendMessage({
                    amazon_get_email: true,
                });
            }
        } else if (window.location.href.includes("amazon.com/ap/mfa")) {
            chrome.runtime.sendMessage({
                amazon_get_code: true,
                type: "sms"
            });
        } else if (window.location.href.includes("amazon.com/ap/cvf")) {
            console.log("Needs approval");
            chrome.runtime.sendMessage({
                amazon_approve_login: true
            });
        }

    } catch (e) {
        console.log(e);
    }
})();