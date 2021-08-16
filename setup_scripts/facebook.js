console.log("facebook.js setup script injected");

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
async function waitUntilPageLoad(document,maxWait) {
    for (let i = 0; i < maxWait*10; i++) {
        if( document.readyState !== 'loading' ) { return true;}
        console.log(i);
        await timer(100); // then the created Promise can be awaited
    }
    return false;
}

async function waitUntilElementLoad(document, elemXPath,  maxWait) {
    for (let i = 0; i < maxWait*10; i++) {
        if(document.querySelector(elemXPath)) { return true;}
        console.log(i);
        await timer(100); // then the created Promise can be awaited
    }
    return false;
}

function exitScriptWithError() {
    // When debugging comment out code of this function. This will stop closing of background pages.
    // chrome.runtime.sendMessage({
    //     facebook_error: true,
    //     message: "Sorry! Something went wrong. ",
    //     message_for_dev : window.location.href
    // });
}


async function handleReceievedMessage(request) {
    if (request.facebook_phone_number) {
        change(document.querySelector("[placeholder='Mobile phone number']"), request.number);
        await timer(100);
        getElementByXpath(document, "//*[contains(text(),'Continue')]/../..").click();
        setTimeout(() => {
            if (document.querySelector("[placeholder='Mobile phone number']")) {
                chrome.runtime.sendMessage({
                    facebook_get_phone_number: true,
                    message: "Invalid phone number",
                });
            } else {
                chrome.runtime.sendMessage({
                    facebook_get_code: true,
                });
            }
        }, 1000);
    } else if (request.facebook_password) {
        change(document.querySelector("[type=password]"), request.password);
        // let item = document.querySelector("html > body > div:nth-of-type(5) > div:nth-of-type(2) > div > div > div > div:nth-of-type(3) > table > tbody > tr > td:nth-of-type(2) > button");
        // item = document.querySelector("html > body > div:nth-of-type(7) > div:nth-of-type(2) > div > div > div > div:nth-of-type(3) > table > tbody > tr > td:nth-of-type(2) > button");
        getElementByXpath(document, "//button[contains(text(),'Submit')]").click();
        if (await waitUntilElementLoad(document, "[placeholder='Mobile phone number']", 2)) {
            chrome.runtime.sendMessage({
                facebook_get_phone_number: true,
            });
        } else if (await waitUntilElementLoad(document, "[src*= 'https://www.facebook.com/qr/show/code']", 2)) {
            chrome.runtime.sendMessage({
                facebook_get_code: true,
                totp_url: document.querySelector("[src*= 'https://www.facebook.com/qr/show/code']").src
            });
            getElementByXpath(document, "//*[contains(text(),'Continue')]/../..").click();
        } else if (document.querySelector("[type=password]")) {
            chrome.runtime.sendMessage({
                facebook_get_password: true,
                message: "Incorrect password",
            });
        } else {exitScriptWithError();}
    } else if (request.facebook_sms_code) {
        if (request.code.length != 6) {
            chrome.runtime.sendMessage({
                facebook_get_code: true,
                message: "Invalid code"
            });
        } else {
            for (let index = 0; index < 6; index++) {
                // change(document.querySelector(`html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div > div > div:nth-of-type(2) > div > div > form > input:nth-of-type(${index + 1})`), request.code[index]);
                change(document.querySelector("[data-key='"+ index +"']"), request.code[index]);
            }
            getElementByXpath(document, "//*[contains(text(),'Continue')]/../..").click();
            await timer(500);
            if (document.querySelector("[data-key='0']")) {
                chrome.runtime.sendMessage({
                    facebook_get_code: true,
                    message: "Invalid code"
                });
            } else {
                // getElementByXpath(document, "//*[contains(text(),'Done')]/../..").click();
                chrome.runtime.sendMessage({
                    facebook_finished: true
                });
            }
        }
    } else if (request.facebook_totp_code) {
        if (request.code.length != 6) {
            chrome.runtime.sendMessage({
                facebook_get_code: true,
                totp_url: request.totp_url,
                message: "Invalid code"
            });
        } else {
            for (let index = 0; index < 6; index++) {
                change(document.querySelector("[data-key='"+ index +"']"), request.code[index]);
            }
            getElementByXpath(document, "//*[contains(text(),'Continue')]/../..").click();
            await timer(500);
            if (document.querySelector("[data-key='0']")) {
                chrome.runtime.sendMessage({
                    facebook_get_code: true,
                    totp_url: request.totp_url,
                    message: "Invalid code"
                });
            } else {
                chrome.runtime.sendMessage({
                    facebook_finished: true
                });
            }
        }
    } else if (request.facebook_credentials) {
        document.querySelector("#email").value = request.email;
        document.querySelector("#pass").value = request.password;
        document.querySelector("[name=login]").click();
    } else if (request.facebook_start_totp) {
        getElementByXpath(document, "//*[contains(text(),'Use Authentication App')]").click();
        if (await waitUntilElementLoad(document, "[src*= 'https://www.facebook.com/qr/show/code']", 2)) {
            chrome.runtime.sendMessage({
                facebook_get_code: true,
                totp_url: document.querySelector("[src*= 'https://www.facebook.com/qr/show/code']").src
            });
            getElementByXpath(document, "//*[contains(text(),'Continue')]/../..").click();
        } else if ( document.querySelector("[type=password]")) {
            chrome.runtime.sendMessage({
                facebook_get_password: true
            });
        }
    } else if (request.facebook_start_sms) {
        getElementByXpath(document, "//*[contains(text(),'Use Text Message')]").click();
        if (await waitUntilElementLoad(document, "[placeholder='Mobile phone number']", 1)) {
            chrome.runtime.sendMessage({
                facebook_get_phone_number: true
            });
        } else if ( document.querySelector("[type=password]")) {
            chrome.runtime.sendMessage({
                facebook_get_password: true
            });
        } else if (document.querySelector("[value='new_phone']")) {
            document.querySelector("[value='new_phone']").click();
            getElementByXpath(document, "//*[contains(text(),'Continue')]/../..").click();
            if (await waitUntilElementLoad(document, "[placeholder='Mobile phone number']", 1)) {
                chrome.runtime.sendMessage({
                    facebook_get_phone_number: true
                });
            } else if ( document.querySelector("[type=password]")) {
                chrome.runtime.sendMessage({
                    facebook_get_password: true
                });
            } else {exitScriptWithError();}

        } else {exitScriptWithError();}
    }
}


chrome.runtime.onMessage.addListener(
    function(request, _) {
        handleReceievedMessage(request).then();
    }
);


(async () => {
    try {
        if (window.location.href.includes("facebook.com/security/2fac/settings")) {
            // chrome.runtime.sendMessage({
            //     facebook_finished: true,
            //     message: "2FA is already enabled."
            // });
        } else if (window.location.href.includes("facebook.com/security/2fac/setup/intro")) {
            await waitUntilPageLoad(document, 2);
            if (window.location.href.includes("?cquick=")) {
                // Inside iframe
                chrome.runtime.sendMessage({
                    facebook_get_type: true,
                });
            } else {
                let iFrameXPath = "iframe[src*=https]";
                if(await waitUntilElementLoad(document, iFrameXPath, 2)) {
                    window.location = document.querySelector(iFrameXPath).src;
                } else {exitScriptWithError();}
            }
        } else if (window.location.href.includes("facebook.com/login/reauth.php")) {
            console.log("In reauth");
            await waitUntilPageLoad(document, 2);
            if (document.querySelector("iframe[src*=https]")) {
                    window.location = document.querySelector("iframe[src*=https]").src;
            } else if (await waitUntilElementLoad(document, "[type=password]", 2)) {
                console.log("In reauth 2");
                chrome.runtime.sendMessage({
                    facebook_get_password: true
                });
            } else {exitScriptWithError();}
        } else if (window.location.href === "https://www.facebook.com/" || window.location.href === "https://www.facebook.com/?sk=welcome") {
            await waitUntilElementLoad(document, 2);
            if (document.querySelector("#email")) {
                // Sign in, then redirect to the security page
                chrome.runtime.sendMessage({
                    facebook_get_credentials: true
                });
            } else {
                window.location.href = "https://www.facebook.com/security/2fac/setup/intro";
            }
        } else {exitScriptWithError();}
    } catch (e) {
        console.log(e);
        // Deal with the fact the chain failed
    }
})();