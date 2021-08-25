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
        dropbox_error: true,
        message: "Sorry! Something went wrong. ",
        message_for_dev: window.location.href
    });
}

async function handleReceivedMessage(request) {
    console.log(request);
    if (request.dropbox_credentials) {
        change(document.querySelector("input[type='email']"), request.login);
        change(document.querySelector("input[type='password']"), request.password);
        getElementByXpath(document, "//button[./div = 'Sign in']").click();
        console.log("Waiting for error element")
        if (await waitUntilElementLoad(document, "[class='error-message']", 1)) {
            chrome.runtime.sendMessage({
                dropbox_get_credentials: true,
                message: "Invalid credentials",
                type: "email"
            });
        }
        console.log("Waiting for 2fa phone form element")
        if(await waitUntilElementLoad(document, ".\\32 fa-phone-form", 3)){
            if(document.querySelector(".two-factor-uses-authenticator")){
                chrome.runtime.sendMessage({
                    dropbox_get_code: true,
                    type: 'totp',
                    login_challenge: true,
                })
            } else {
                chrome.runtime.sendMessage({
                    dropbox_get_code: true,
                    type: 'sms',
                    login_challenge: true,
                })
            }
        }

    } else if (request.dropbox_password) {
        console.log(request);
        change(document.querySelector("input[type='password']"), request.password);
        if (getElementByXpath(document, "//*[contains(text(),'Next')]/..")) {
            getElementByXpath(document, "//*[contains(text(),'Next')]/..").click()
        } else { exitScriptWithError(); }
        let errorMsgXPath = "div[id*=error-message]";
        let SMSChoice = "[id=sms-choice]"
        
        if (request.next_step == "change_method") {
            let msg = {
                dropbox_change_method: true
            }
            if (getElementByXpath(document, "//*[contains(text(),'Preferred')]/../../div[2]").innerText.toLowerCase().includes("sms")) {
                msg["method_enabled"] = "sms";
            } else {
                msg["method_enabled"] = "totp";
            }
            chrome.runtime.sendMessage(msg);
        } else if (await waitUntilElementLoad(document, SMSChoice, 1)) {
            chrome.runtime.sendMessage({
                dropbox_get_method: true,
            });
        } else if (await waitUntilElementLoad(document, errorMsgXPath, 2) && document.querySelector(errorMsgXPath).innerText != "") {
            chrome.runtime.sendMessage({
                dropbox_get_password: true,
                message: document.querySelector(errorMsgXPath).textContent
            });
        } else { exitScriptWithError(); }
    } else if (request.dropbox_phone) {
        let twofawindow = document.querySelector("#twofactor-enter-phone")
        if (twofawindow.querySelector("input[type='text']")) {
            change(twofawindow.querySelector("input[type='text']"), request.phone)
        } else { exitScriptWithError(); }
        if (getElementByXpath(document, "//*[contains(text(),'Next')]/..")) {
            getElementByXpath(document, "//*[contains(text(),'Next')]/..").click()
        } else { exitScriptWithError(); }
        let errorMsgXPath = "div[id*=error-message]";
        let phoneCodeXPath = "[id=phone-code]"
        if (await waitUntilElementLoad(document, phoneCodeXPath, 2)) {
            chrome.runtime.sendMessage({
                dropbox_get_code: true,
                type: "sms"
            });
        } else if (await waitUntilElementLoad(document, errorMsgXPath, 2) && document.querySelector(errorMsgXPath).innerText != "") {
            chrome.runtime.sendMessage({
                dropbox_get_phone: true,
                message: document.querySelector(errorMsgXPath).textContent
            });
        } else { exitScriptWithError(); }
    } else if (request.dropbox_code) {

        if(request.login_challenge){
            console.log(request.code);
            change(document.querySelector("input[name='code']"), request.code);
            document.querySelector(".login-button").click();
            setTimeout(() => {
                if (getElementByXpath(document, "//*[contains(text(),'Invalid')]")) {
                    chrome.runtime.sendMessage({
                        dropbox_get_code: true,
                        type: request.type,
                        login_challenge: true,
                        message: getElementByXpath(document, "//*[contains(text(),'Invalid')]").innerHTML,
                    });
                }
            }, 2000);
        } else {
            change(document.querySelector("#phone-code"), request.code);
            if (getElementByXpath(document, "//*[contains(text(),'Next')]/..")) {
                getElementByXpath(document, "//*[contains(text(),'Next')]/..").click();
            } else { exitScriptWithError(); }
    
            // let errorMsgXPath = "div[id*=error-message]";
            let backupDescriptionXPath = "[id=backup-phone-number-description]"
            if (await waitUntilElementLoad(document, backupDescriptionXPath, 2)) {
                if (getElementByXpath(document, "//*[contains(text(),'Next')]/..")) {
                    getElementByXpath(document, "//*[contains(text(),'Next')]/..").click();
                } else { exitScriptWithError(); }
               
                if (await waitUntilElementLoad(document, "#backup-code-list-container", 2)) {
                    var codes = document.querySelectorAll("[class='twofactor-backup-list__code']");
                    var codes_array = [];
                    for (i = 0; i < codes.length; ++i) {
                        codes_array.push(codes[i].innerText);
                        console.log(codes[i].innerText);
                    }
                    chrome.runtime.sendMessage({
                            dropbox_get_backup_code_download: true,
                            backup_codes_array: codes_array
                    });
                    getElementByXpath(document, "//*[contains(text(),'Next')]/..").click();
                } else if (await waitUntilElementLoad(document,"#notify-msg",1) && document.querySelector("#notify-msg").innerText.includes("updated")) {
                    chrome.runtime.sendMessage({
                        dropbox_finished: true,
                    });
                } else { exitScriptWithError(); }
                if (await waitUntilElementLoad(document, "[id='twofactor-done'] > div:nth-of-type(2) > div > p", 2)) {
                    getElementByXpath(document, "//*[contains(text(),'Next')]/..").click();
                }
                chrome.runtime.sendMessage({
                    dropbox_finished: true,
                });
            } else if (getElementByXpath(document, "//*[contains(text(),'Invalid')]")) {
                chrome.runtime.sendMessage({
                    dropbox_get_code: true,
                    type: "totp",
                    message: getElementByXpath(document, "//*[contains(text(),'Invalid')]").innerHTML,
                    totp_seed: request.totp_seed // in case of totp, we need to recieve the QR code value from the extnesion to send it back for next retry/
                });
            } else { exitScriptWithError(); }
        }   
    } else if (request.dropbox_sms) {
        document.querySelector("#use-sms").click();
        if (getElementByXpath(document, "//*[contains(text(),'Next')]/..")) {
            getElementByXpath(document, "//*[contains(text(),'Next')]/..").click();
        }
        chrome.runtime.sendMessage({
            dropbox_get_phone: true,
        });
    } else if (request.dropbox_totp) {
        document.querySelector("#use-app").click();
        if (getElementByXpath(document, "//*[contains(text(),'Next')]/..")) {
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
            type: "totp",
            totp_seed: document.querySelector(QRcodeSecretXPath).textContent.replace(/\s+/g, '')
        });
        if (getElementByXpath(document, "//*[contains(text(),'Next')]/..")) {
            getElementByXpath(document, "//*[contains(text(),'Next')]/..").click();
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
        if (window.location.href.includes("dropbox.com/account/security")) {
            await waitUntilPageLoad(document, 2);
            await waitUntilElementLoad(document, "label[aria-pressed=false]", 2)
            let labelTurnedOff = getElementByXpath(document, "//*[contains(text(),'Two-')]/../../div[2]").querySelector("label[aria-pressed=false]");
            let labelTurnedOn = getElementByXpath(document, "//*[contains(text(),'Two-')]/../../div[2]").querySelector("label[aria-pressed=true]");
            if (labelTurnedOff) {
                let turnOnButton = getElementByXpath(document, "//*[contains(text(),'Two-')]/../../div[2]/label/input");
                let GetStartedButtonXPath = "div[id='twofactor-start'] > div:nth-of-type(3) > button:nth-of-type(2)";
                if (turnOnButton) {
                    turnOnButton.click()
                } else { exitScriptWithError(); }
                if (await waitUntilElementLoad(document, GetStartedButtonXPath, 2)) {
                    document.querySelector(GetStartedButtonXPath).click();
                } else { exitScriptWithError(); }
                let passwordInputXPath = "input[type='password']";
                if (await waitUntilElementLoad(document, passwordInputXPath, 2)) {
                    chrome.runtime.sendMessage({
                        dropbox_get_password: true,
                    });
                } else { exitScriptWithError(); }
            } else if (labelTurnedOn) { 
                let editButtonXPath = "[aria-label='Edit preferred 2FA method']";
                if (await waitUntilElementLoad(document, editButtonXPath, 2)) {
                    document.querySelector(editButtonXPath).click();
                    let passwordInputXPath = "input[type='password']";
                    if (await waitUntilElementLoad(document, passwordInputXPath, 2)) {
                        chrome.runtime.sendMessage({
                            dropbox_get_password: true,
                            next_step: "change_method"
                        });
                    } else { exitScriptWithError(); }
                } else { exitScriptWithError(); }
            } else {
                exitScriptWithError();
            }
        } else if (window.location.href.includes("login")) {
            await waitUntilPageLoad(document, 2);
            console.log("A");
            if (document.querySelector("[name=login_email]") && document.querySelector("[name=login_password]")) {
                console.log("B, sending message for credentials");
                chrome.runtime.sendMessage({
                    dropbox_get_credentials: true,
                    type: "email"
                });
            } else if(document.querySelector(".\\32 fa-phone-form")){
                if(document.querySelector(".two-factor-uses-authenticator")){
                    chrome.runtime.sendMessage({
                        dropbox_get_code: true,
                        type: 'totp',
                        login_challenge: true,
                    })
                } else {
                    chrome.runtime.sendMessage({
                        dropbox_get_code: true,
                        type: 'sms',
                        login_challenge: true,
                    })
                }
                
            } else {
                exitScriptWithError();
            }
        } else if (window.location.href.includes("dropbox.com/h")) {
            window.location.href = "https://www.dropbox.com/account/security";
        }
    } catch (e) {
        console.log(e);
        // Deal with the fact the chain failed
    }
})();