console.log("dropbox.js disable script injected");

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

async function waitUntilElementDoesNotExist(document, elemXPath, maxWait) {
    for (let i = 0; i < maxWait * 10; i++) {
        if (!document.querySelector(elemXPath) ) { return true; }
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

    if (request.dropbox_credentials) {
        change(document.querySelector("input[type='email']"), request.login);
        change(document.querySelector("input[type='password']"), request.password);
        getElementByXpath(document, "//button[./div = 'Sign in']").click();
        if (await waitUntilElementLoad(document, "[class='error-message']", 1)) {
            chrome.runtime.sendMessage({
                dropbox_get_credentials: true,
                message: "Invalid credential",
                type: "email"
            });
        }
        console.log("Waiting for 2fa phone form element")
        if (await waitUntilElementLoad(document, ".\\32 fa-phone-form", 3)) {
            if (document.querySelector(".two-factor-uses-authenticator")) {
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
        change(document.querySelector("input[type='password']"), request.password);
        if (getElementByXpath(document, "//*[contains(text(),'Next')]/..")) {
            getElementByXpath(document, "//*[contains(text(),'Next')]/..").click()
        } else { exitScriptWithError(); }
        let errorMsgXPath = "div[id*=error-message]";
        if(await waitUntilElementDoesNotExist(document, ".dig-Button--isLoading", 2)){
            if(document.querySelector(errorMsgXPath)) {
              if(document.querySelector(errorMsgXPath).textContent != ''){
                console.log("In Error");
                chrome.runtime.sendMessage({
                    dropbox_get_password: true,
                    message: document.querySelector(errorMsgXPath).textContent
                });
              }
            } else {
              console.log("In final ");
              await timer(2000);
              getElementByXpath(document, "//*[contains(text(),'Next')]/..").click();
              setTimeout(() => {
                  chrome.runtime.sendMessage({
                      dropbox_finished: true,
                  });
              }, 2000);
            }

        } else {
            console.log("isLoading button won't disapear");
        }


        // change(document.querySelector("#password"), request.password);
        // document.querySelector("html > body > div > div > div > div > div > div:nth-of-type(3) > button").click();
        // setTimeout(() => {
        //     let error = document.querySelector("#error-message1");
        //     if (error !== null && error.textContent !== null) {
        //         chrome.runtime.sendMessage({
        //             dropbox_get_password: true,
        //             message: error.textContent
        //         });
        //     } else {
        //         if(document.querySelector("html > body > div:nth-of-type(16) > div > div > div > div > div:nth-of-type(3) > button") != null){
        //             document.querySelector("html > body > div:nth-of-type(16) > div > div > div > div > div:nth-of-type(3) > button").click();
        //         } else {
        //             document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button").click();
        //         }
        //         setTimeout(() => {
        //             chrome.runtime.sendMessage({
        //                 dropbox_finished: true,
        //             });
        //         }, 2000);
        //     }
        // }, 2000);
    } else if (request.dropbox_code) {
        if (request.login_challenge) {
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
        }
    }
}

chrome.runtime.onMessage.addListener(
    function(request, _) {
        handleReceivedMessage(request).then();
    }

);


(async() => {
    try {
        if (window.location.href.includes("dropbox.com/account/security")) {
            // setTimeout(() => {

            await waitUntilPageLoad(document, 2);
            await waitUntilElementLoad(document, "label[aria-pressed=false]", 2)
            let labelTurnedOff = getElementByXpath(document, "//*[contains(text(),'Two-')]/../../div[2]").querySelector("label[aria-pressed=false]");
            let labelTurnedOn = getElementByXpath(document, "//*[contains(text(),'Two-')]/../../div[2]").querySelector("label[aria-pressed=true]");
            if (labelTurnedOn) {
                let turnOffButton = getElementByXpath(document, "//*[contains(text(),'Two-')]/../../div[2]/label/input");
                if (turnOffButton) {
                    turnOffButton.click()
                } else { exitScriptWithError(); }
                let passwordInputXPath = "input[type='password']";
                if (await waitUntilElementLoad(document, passwordInputXPath, 2)) {
                    chrome.runtime.sendMessage({
                        dropbox_get_password: true,
                    });
                };
            } else if (labelTurnedOff) {
                chrome.runtime.sendMessage({
                    dropbox_finished: true,
                    message: "2FA is already disabled"
                });
            } else {
                console.log("YoLO");
                exitScriptWithError();
            }

            // document.querySelector("html > body > div > div > div > div > div:first-of-type > div > div > div > div > div:nth-of-type(3) > div > div:nth-of-type(2) > label > input").click();
            // chrome.runtime.sendMessage({
            //     dropbox_get_password: true,
            // });
            // }, 1000);
        } else if (window.location.href.includes("login")) {
            await waitUntilPageLoad(document, 2);
            console.log("A");
            if (document.querySelector("[name=login_email]") && document.querySelector("[name=login_password]")) {
                console.log("B, sending message for credentials");
                chrome.runtime.sendMessage({
                    dropbox_get_credentials: true,
                    type: "email"
                });
            } else if (document.querySelector(".\\32 fa-phone-form")) {
                if (document.querySelector(".two-factor-uses-authenticator")) {
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
        } else {
            window.location.href = "https://www.dropbox.com/account/security";
        }
    } catch (e) {
        console.log(e);
        // Deal with the fact the chain failed
    }
})();
