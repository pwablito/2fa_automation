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
    //     dropbox_error: true,
    //     message: "Sorry! Something went wrong. ",
    //     message_for_dev : window.location.href
    // });
}

async function handleReceivedMessage(request) {
        
    if (request.dropbox_credentials) {
        change(document.querySelector("input[type='email']"), request.username);
        change(document.querySelector("input[type='password']"), request.password);
        getElementByXpath(document, "//button[./div = 'Sign in']").click();
        if (await waitUntilElementLoad(document, "[class='error-message']", 1)) {
            chrome.runtime.sendMessage({
                dropbox_get_credentials: true,
                message: "Invalid credential"
            });
        }

        // change(document.querySelector("html > body > div:nth-of-type(12) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > div > form > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > input"), request.username);
        // change(document.querySelector("html > body > div:nth-of-type(12) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > div > form > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > input"), request.password);
        // document.querySelector("html > body > div:nth-of-type(12) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > div > form > div:nth-of-type(2) > button").click();
        // setTimeout(() => {
        //     if (document.querySelector("html > body > div:nth-of-type(12) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > form > div:nth-of-type(2) > div > div:nth-of-type(2) > input") !== null) {
        //         chrome.runtime.sendMessage({
        //             dropbox_get_code: true,
        //         });
        //     } else if (document.querySelector(".error-message") && document.querySelector(".error-message").textContent !== "") {
        //         chrome.runtime.sendMessage({
        //             dropbox_get_credentials: true,
        //             message: document.querySelector(".error-message").textContent,
        //         });
        //     } else {
        //         chrome.runtime.sendMessage({
        //             dropbox_error: true,
        //             message: "2FA already disabled",
        //         });
        //     }
        // }, 8000);
    } else if (request.dropbox_password) {
        change(document.querySelector("input[type='password']"), request.password);
        if(getElementByXpath(document, "//*[contains(text(),'Next')]/..")){
            getElementByXpath(document, "//*[contains(text(),'Next')]/..").click()
        } else {exitScriptWithError();}
        let errorMsgXPath = "div[id*=error-message]";
        if (await waitUntilElementLoad(document, errorMsgXPath, 2) && document.querySelector(errorMsgXPath).innerText != "") {
            console.log("In Error");
            chrome.runtime.sendMessage({
                dropbox_get_password: true,
                message: document.querySelector(errorMsgXPath).textContent
            });
        } else {
            console.log("In final ");
            await timer(2000);
            getElementByXpath(document, "//*[contains(text(),'Next')]/..").click();
                chrome.runtime.sendMessage({
                    dropbox_finished: true,
                });
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
        change(document.querySelector("html > body > div:nth-of-type(12) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > form > div:nth-of-type(2) > div > div:nth-of-type(2) > input"), request.code);
        document.querySelector("html > body > div:nth-of-type(12) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > form > button").click();
    }
}

chrome.runtime.onMessage.addListener(
    function(request, _) {
        handleReceivedMessage(request).then();
    }

);


(async () => {
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
                } else {exitScriptWithError();}
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
            chrome.runtime.sendMessage({
                dropbox_get_credentials: true,
            });
        }
} catch (e) {
    console.log(e);
    // Deal with the fact the chain failed
}
})();