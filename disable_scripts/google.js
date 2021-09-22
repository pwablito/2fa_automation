console.log("google.js disable script injected");


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

function getSecondElementByXpath(doc, xpath) {
    let elms = doc.evaluate(xpath, doc);
    elms.iterateNext()
    return elms.iterateNext()
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
        facebook_error: true,
        message: "Sorry! Something went wrong. ",
        message_for_dev: window.location.href
    });
}

chrome.runtime.onMessage.addListener(
    function(request, _) {
        if (request.email) {
            document.querySelector("#identifierId").value = request.email;
            document.querySelector("#identifierNext > div > button").click();
            chrome.runtime.sendMessage({
                "google_get_password": true
            });
        } else if (request.google_code) {
            console.log("login challenge request");
            if (document.querySelector("#idvPin")) {
                document.querySelector("#idvPin").value = request.code;
                getElementByXpath(document, "//span[contains(text(),'Next')]/..").click();
            } else if (document.querySelector("#totpPin")) {
                document.querySelector("#totpPin").value = request.code,
                    getElementByXpath(document, "//span[contains(text(),'Next')]/..").click();
            }
            setTimeout(() => {
                if (document.querySelector("#idvPin") || document.querySelector("#totpPin")) {
                    chrome.runtime.sendMessage({
                        "google_get_code": true,
                        message: "Incorrect code."
                    });
                }
            }, 3000);
            // document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div > div > div > input").value = request.code;
            // document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div").click()
            // setTimeout(() => {
            //     if (document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div > div > div > input") != null) {
            //         chrome.runtime.sendMessage({
            //             google_get_code: true,
            //             type: "sms",
            //             message: "Incorrect code"
            //         })
            //     } else {
            //         document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(2)").click();
            //     }
            // }, 4000);
        } else if (request.google_password) {
            document.querySelector("#password > div > div > div > input").value = request.password;
            document.querySelector("#passwordNext > div > button").click();
            setTimeout(() => {
                if (document.querySelector("#password > div > div > div > input") != null) {
                    chrome.runtime.sendMessage({
                        google_get_password: true,
                        message: "Incorrect password"
                    })
                }
            }, 5000);
        }
    }
);


(async() => {
    try {
        if (window.location.href.includes("https://myaccount.google.com/")) {
            console.log("Signed in");
            await waitUntilPageLoad(document, 3);
            if (window.location.href.includes("https://myaccount.google.com/signinoptions/two-step-verification")) {
                // 2FA is already disabled
                if (getElementByXpath(document, "//*[contains(text(),'Turn on')]/../..")) {
                    let msg = {
                        google_error: true,
                        message: "2FA is already disabled on this account"
                    };
                    chrome.runtime.sendMessage(msg);
                } else if (getElementByXpath(document, "//*[contains(text(),'Turn off')]/../..")) {
                    getElementByXpath(document, "//*[contains(text(),'Turn off')]/../..").click();
                    turnOffButtXPath = "html > body > div:nth-of-type(11) > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(2)";
                    if (await waitUntilElementLoad(document, turnOffButtXPath, 2)) {
                        document.querySelector(turnOffButtXPath).click();
                    } else {
                        if(getSecondElementByXpath(document, "//*[contains(text(),'Turn off')]/../..")){
                            getSecondElementByXpath(document, "//*[contains(text(),'Turn off')]/../..").click()
                        }
                    }

                }
            } else if (window.location.href.includes("https://myaccount.google.com/security")) {
                chrome.runtime.sendMessage({
                    google_finished: true
                });
            } else {
                window.location.href = "https://myaccount.google.com/signinoptions/two-step-verification";
            }
        } else if (window.location.href.includes("google.com/signin/v2/challenge")) {
            if (await waitUntilElementLoad(document, "#idvPin", 2)) {
                chrome.runtime.sendMessage({
                    google_get_code: true,
                    type: 'sms',
                    login_challenge: true,
                });
            } else if (await waitUntilElementLoad(document, "#totpPin", 2)) {
                chrome.runtime.sendMessage({
                    google_get_code: true,
                    type: 'totp',
                    login_challenge: true,
                });
            } else if (await waitUntilElementLoad(document, "input[type='password']", 2)) {
                chrome.runtime.sendMessage({
                    google_get_password: true,
                });
            }
        } else if (window.location.href.includes("signinchooser")) {
            // In case all the accounts are logged out and google redirects to choose account. We redirect to select a new account always. 
            let UseAnotherAccountButtonXPath = "html > body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div:nth-of-type(2) > div > div:nth-of-type(1) > div > form > span > section > div > div > div > div:nth-of-type(1) > ul > li:nth-of-type(2) > div > div > div:nth-of-type(2)";
            if (await waitUntilElementLoad(document, UseAnotherAccountButtonXPath, 2)) {
                document.querySelector(UseAnotherAccountButtonXPath).click();
            }
        } else if (window.location.href.includes("/signin/") || window.location.href.includes("/identifier")) {
            if (document.querySelector("[type=email]") && document.querySelector("[type=email]").value == "") {
                chrome.runtime.sendMessage({
                    "google_get_email": true
                });
            } else if (document.querySelector("[type=password]")) {
                chrome.runtime.sendMessage({
                    "google_get_password": true
                });
            } else {
                chrome.runtime.sendMessage({
                    google_error: true,
                    message: "Something went wrong",
                    message_for_dev: window.location.href
                });
            }
        }
    } catch (e) {
        // Deal with the fact the chain failed
    }
})();




// if (window.location.href.includes("accounts.google.com/signin/v2/challenge/pwd")) {
//     chrome.runtime.sendMessage({
//         "google_get_password": true
//     });
// } else if (window.location.href.includes("/identifier")) {
//     chrome.runtime.sendMessage({
//         "google_username": true
//     });
// } else if (window.location.href.includes("myaccount.google.com/security")) {
//     console.log("In myaccount.google.com/security");
//     if (document.readyState !== 'loading') {
//         console.log('document is already ready, just execute code here');
//         document.querySelector("html > body > c-wiz > div > div:nth-of-type(2) > c-wiz > c-wiz > div > div:nth-of-type(3) > div > div > c-wiz > section > div:nth-of-type(3) > div > div > div:nth-of-type(3) > div:nth-of-type(2) > a").click();
//     } else {
//         document.addEventListener('DOMContentLoaded', function() {
//             console.log('document was not ready, place code here');
//             document.querySelector("html > body > c-wiz > div > div:nth-of-type(2) > c-wiz > c-wiz > div > div:nth-of-type(3) > div > div > c-wiz > section > div:nth-of-type(3) > div > div > div:nth-of-type(3) > div:nth-of-type(2) > a").click();

//         });
//     }
// } else if (window.location.href.includes("myaccount.google.com/signinoptions/two-step-verification?")) {
//     function onReady() {
//         if (document.querySelector("html > body > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:nth-of-type(1) > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > div > div")) {
//             document.querySelector("html > body > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:nth-of-type(1) > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > div > div").click();
//         }
//         checkElement("html > body > div:nth-of-type(11) > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(2)") //use whichever selector you want
//             .then((element) => {
//                 console.info(element);
//                 document.querySelector("html > body > div:nth-of-type(11) > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(2)").click()
//                     // chrome.runtime.sendMessage({
//                     //     "google_finished": true
//                     // });
//             });
//     }
//     if (document.readyState !== 'loading') {
//         onReady();
//     } else {
//         document.addEventListener('DOMContentLoaded', onReady);
//     }
// }