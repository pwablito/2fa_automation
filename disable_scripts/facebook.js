console.log("facebook.js disable script injected");

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
    // chrome.runtime.sendMessage({
    //     facebook_error: true,
    //     message: "Sorry! Something went wrong. ",
    //     message_for_dev: window.location.href
    // });
}

async function handleReceivedMessage(request) {
    // if (request.facebook_password) {
    //     if (document.querySelector("html > body > div:first-of-type > div:first-of-type > div:first-of-type > div > form > div > div:nth-of-type(2) > table > tbody > tr:first-of-type > td > input") != null) {
    //         document.querySelector("html > body > div:first-of-type > div:first-of-type > div:first-of-type > div > form > div > div:nth-of-type(2) > table > tbody > tr:first-of-type > td > input").value = request.password;
    //         document.querySelector("html > body > div:first-of-type > div:first-of-type > div:first-of-type > div > form > div > div:nth-of-type(3) > div > div:first-of-type > label > input").click();
    //     }
    //     change(document.querySelector("#ajax_password"), request.password);
    //     let item = document.querySelector("html > body > div:nth-of-type(5) > div:nth-of-type(2) > div > div > div > div:nth-of-type(3) > table > tbody > tr > td:nth-of-type(2) > button");
    //     item = document.querySelector("html > body > div:nth-of-type(7) > div:nth-of-type(2) > div > div > div > div:nth-of-type(3) > table > tbody > tr > td:nth-of-type(2) > button");
    //     item.click();
    //     setTimeout(() => {
    //         if (document.querySelector("#ajax_password") != null) {
    //             chrome.runtime.sendMessage({
    //                 facebook_get_password: true,
    //                 message: "Incorrect password",
    //             });
    //         } else {
    //             chrome.runtime.sendMessage({
    //                 facebook_get_phone: true,
    //             });
    //         }
    //     }, 2000);
    // } else 
    if (request.facebook_password) {
        change(document.querySelector("[type=password]"), request.password);
        // let item = document.querySelector("html > body > div:nth-of-type(5) > div:nth-of-type(2) > div > div > div > div:nth-of-type(3) > table > tbody > tr > td:nth-of-type(2) > button");
        // item = document.querySelector("html > body > div:nth-of-type(7) > div:nth-of-type(2) > div > div > div > div:nth-of-type(3) > table > tbody > tr > td:nth-of-type(2) > button");
        // getElementByXpath(document, "//*[contains(text(),'Continue')]/../..").click();
        document.querySelector("input[value=Continue]").click();
        if (await waitUntilElementLoad(document, "[placeholder='Mobile phone number']", 2)) {
            chrome.runtime.sendMessage({
                facebook_get_phone: true,
            });
        } else if (document.querySelector("[type=password]")) {
            chrome.runtime.sendMessage({
                facebook_get_password: true,
                message: "Invalid Password",
            });
        } else { exitScriptWithError(); }
    }else if (request.facebook_credentials) {
        document.querySelector("#email").value = request.login;
        document.querySelector("[type=password]").value = request.password;
        getElementByXpath(document, "//button[contains(text(),'Submit')]").click();
    }
}

chrome.runtime.onMessage.addListener(
    function(request, _) {
        handleReceivedMessage(request).then()
    }
);


(async() => {
    try {
        if (window.location.href.includes("security/2fac/settings")) {
            await waitUntilPageLoad(document, 2);
            if (window.location.href.includes("?cquick=")) {
                // Inside iframe
                document.querySelector("[ajaxify$='turn_off/']").click();
                setTimeout(() => {
                    if (document.querySelector("button[rel=post]")) {
                        document.querySelector("button[rel=post]").click()
                        chrome.runtime.sendMessage({
                            facebook_finished: true
                        });
                    }

                }, 2000);
            } else {
                let iFrameXPath = "iframe[src*='https://www.facebook.com/security/2fac/settings']";
                if (await waitUntilElementLoad(document, iFrameXPath, 2)) {
                    window.location = document.querySelector(iFrameXPath).src;
                } else { exitScriptWithError(); }
            }

        } else if (window.location.href.includes("facebook.com/login/reauth.php")) {
            // console.log("reauth asking");
            // if (document.querySelector("html > body > div:first-of-type > div:first-of-type > div:first-of-type > div > form > div > div:nth-of-type(2) > table > tbody > tr:first-of-type > td > input") != null) {
            //     chrome.runtime.sendMessage({
            //         facebook_get_password: true
            //     });
            // } else {
            //     window.location.href = document.querySelector("html > body > div:first-of-type > div > div:first-of-type > div > div:nth-of-type(3) > div > div > div:first-of-type > div:first-of-type > iframe").src;
            // }
            console.log("In reauth");
            await waitUntilPageLoad(document, 2);
            if (document.querySelector("iframe[src*='https://www.facebook.com/login/reauth.php']")) {
                    console.log(document.querySelector("iframe[src*='https://www.facebook.com/login/reauth.php']").src);
                    window.location = document.querySelector("iframe[src*='https://www.facebook.com/login/reauth.php']").src;
            } else if (await waitUntilElementLoad(document, "[type=password]", 2)) {
                console.log("In reauth 2");
                chrome.runtime.sendMessage({
                    facebook_get_password: true
                });
            } else {exitScriptWithError();}
        }
    } catch (e) {
        console.log(e);
        // Deal with the fact the chain failed
    }
})();