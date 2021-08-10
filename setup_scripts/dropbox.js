console.log("dropbox.js setup script injected");

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

async function handleReceivedMessage(request) {
    if (request.dropbox_credentials) {
        change(document.querySelector("input[type='email']"), request.username);
        change(document.querySelector("input[type='password']"), request.password);
        getElementByXpath(document, "//div[contains(text(),'Sign in')]").click();
    } else if (request.dropbox_password) {
        change(document.querySelector("input[type='password']"), request.password);
        if(getElementByXpath(document, "//*[contains(text(),'Next')]/..")){
            getElementByXpath(document, "//*[contains(text(),'Next')]/..").click()
        }
        let errorMsgXPath = "div[id*=error-message]";
        let SMSChoice = "[id=sms-choice]"
        if(await waitUntilElementLoad(document, SMSChoice, 2)) {
            chrome.runtime.sendMessage({
                dropbox_get_type: true,
            });
        } else if (await waitUntilElementLoad(document, errorMsgXPath, 2) && document.querySelector(errorMsgXPath) != "") {
            chrome.runtime.sendMessage({
                dropbox_get_password: true,
                message: document.querySelector(errorMsgXPath).textContent
            });
        }
    } else if (request.dropbox_phone_number) {
        let twofawindow = document.querySelector("#twofactor-enter-phone")
        if(twofawindow.querySelector("input[type='text']")){
            change(twofawindow.querySelector("input[type='text']"),request.number )
        }         
        if(getElementByXpath(document, "//*[contains(text(),'Next')]/..")){
            getElementByXpath(document, "//*[contains(text(),'Next')]/..").click()
        }
        let errorMsgXPath = "div[id*=error-message]";
        let phoneCodeXPath = "[id=phone-code]"
        if(await waitUntilElementLoad(document, phoneCodeXPath, 2)) {
            chrome.runtime.sendMessage({
                dropbox_get_code: true,
            });
        } else if (await waitUntilElementLoad(document, errorMsgXPath, 2) && document.querySelector(errorMsgXPath) != "") {
            chrome.runtime.sendMessage({
                dropbox_get_phone_number: true,
                message: document.querySelector(errorMsgXPath).textContent
            });
        }
    } else if (request.dropbox_code) {
        change(document.querySelector("#phone-code"), request.code);
        if(getElementByXpath(document, "//*[contains(text(),'Next')]/..")){
            getElementByXpath(document, "//*[contains(text(),'Next')]/..").click();
        }

        let errorMsgXPath = "div[id*=error-message]";
        let backupDescriptionXPath = "[id=backup-phone-number-description]"
        if(await waitUntilElementLoad(document,  backupDescriptionXPath, 2)) {
            if(getElementByXpath(document, "//*[contains(text(),'Next')]/..")){
                getElementByXpath(document, "//*[contains(text(),'Next')]/..").click();
            }
            if (await waitUntilElementLoad(document, "backup-code-list-container", 2)) {
                getElementByXpath(document, "//*[contains(text(),'Next')]/..").click();
            }
            await waitUntilElementLoad(document, "[id='twofactor-done'] > div:nth-of-type(2) > div > p");
            getElementByXpath(document, "//*[contains(text(),'Next')]/..").click();
            chrome.runtime.sendMessage({
                dropbox_finished: true,
            });
        } else if (await waitUntilElementLoad(document, errorMsgXPath, 2) && document.querySelector(errorMsgXPath) != "") {
            chrome.runtime.sendMessage({
                dropbox_get_code: true,
                message: document.querySelector(errorMsgXPath).textContent
            });
        }
    } else if (request.dropbox_start_sms) {
        document.querySelector("#use-sms").click();
        if(getElementByXpath(document, "//*[contains(text(),'Next')]/..")){
            getElementByXpath(document, "//*[contains(text(),'Next')]/..").click();
        } 
        chrome.runtime.sendMessage({
            dropbox_get_phone_number: true,
        });
    } else if (request.dropbox_start_totp) {
        document.querySelector("#use-app").click();
        if(getElementByXpath(document, "//*[contains(text(),'Next')]/..")){
            getElementByXpath(document, "//*[contains(text(),'Next')]/..").click();
        } 

        let = QRcodePageXPath = "[id='twofactor-offline-setup']";
        let enterManuallyButtonXPath = "[id='twofactor-offline-setup'] > div:nth-of-type(2) > div > ul > li:nth-of-type(2) > button";
        await waitUntilElementLoad(document, enterManuallyButtonXPath, 2);
        document.querySelector(enterManuallyButtonXPath).click()
        let QRcodeSecretXPath = "#secret-div";
        await waitUntilElementLoad(document, QRcodeSecretXPath, 2);
        chrome.runtime.sendMessage({
            dropbox_get_code: true,
            totp_secret: document.querySelector(QRcodeSecretXPath).textContent.replace(/\s+/g, '')
        });
        if(getElementByXpath(document, "//*[contains(text(),'Next')]/..")){
            getElementByXpath(document, "//*[contains(text(),'Next')]/..").click();
        } 
    }
}

chrome.runtime.onMessage.addListener(
    function(request, _) {
        handleReceivedMessage(request).then()
    }
);

(async () => {
    try {
        if (window.location.href.includes("dropbox.com/account/security")) {
            await waitUntilPageLoad(document, 2);
            let turnOnButton = getElementByXpath(document, "//*[contains(text(),'Two-')]/../../div[2]/label/input");
            let GetStartedButtonXPath = "div[id='twofactor-start'] > div:nth-of-type(3) > button:nth-of-type(2)";
            if (turnOnButton) {
                turnOnButton.click()
            }
            if (await waitUntilElementLoad(document, GetStartedButtonXPath, 2)) {
                document.querySelector(GetStartedButtonXPath). click();
            }
            let passwordInputXPath = "input[type='password']";
            if (await waitUntilElementLoad(document, passwordInputXPath, 2)) {
                chrome.runtime.sendMessage({
                    dropbox_get_password: true,
                });
            }
        } else if (window.location.href.includes("login")) {
            await waitUntilPageLoad(document, 2);
            if (document.querySelector("[name=login_email]") && document.querySelector("[name=login_password]")) {
                chrome.runtime.sendMessage({
                    dropbox_get_credentials: true,
                });
            } else { 
                chrome.runtime.sendMessage({
                    dropbox_error: true,
                    message: "Something went wrong",
                    message_for_dev : window.location.href
                });
            }
        } else if (window.location.href.includes("dropbox.com/h")) {
            window.location.href = "https://www.dropbox.com/account/security";
        }
    } catch (e) {
        // Deal with the fact the chain failed
    }
})();