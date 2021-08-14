console.log("linkedin.js disable script injected");


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
    // chrome.runtime.sendMessage({
    //     linkedin_error: true,
    //     message: "Sorry! Something went wrong. ",
    //     message_for_dev : window.location.href
    // });
}


async function handleReceivedMessage(request) {
    if (request.linkedin_credentials) {
        document.querySelector("#username").value = request.login;
        document.querySelector("#password").value = request.password;
        getElementByXpath(document, "//button[contains(@aria-label, 'Sign in')]").click()
        if (await waitUntilElementLoad(document, "#error-for-password", 2)) {
            chrome.runtime.sendMessage({
                linkedin_password: true,
                message: "Incorrect password, try again"
            })
        }
    } else if (request.linkedin_code) {
        document.querySelector(".input_verification_pin").value = request.code;
        document.querySelector("button[id='two-step-submit-button']").click();
        if (await waitUntilElementLoad(document, "#phone-pin-error", 2)) {
            console.log("Incorrect pin")
            chrome.runtime.sendMessage({
                linkedin_get_code: true,
                message: "Incorrect code, try again"
            });
        } else if (await waitUntilElementLoad(document, "span[role='alert'", 2)) {
            if (document.querySelector("span[role='alert'").textContent == "The verification code you entered isn't valid. Please check the code and try again.") {
                chrome.runtime.sendMessage({
                    linkedin_get_code: true,
                    message: "Incorrect code, try again"
                });
            }
        }

    } else if (request.linkedin_password) {
        if (document.querySelector("#verify-password")) {
            document.querySelector("#verify-password").value = request.password;
            getElementByXpath(document, "//button[contains(@class, 'submit')]").click();

            if (await waitUntilElementLoad(document, "p[id='incorrect-password-error']", 2)) {
                chrome.runtime.sendMessage({
                    linkedin_incorrect_password: true
                })
            }
        } else if (document.querySelector("#password")) {
            document.querySelector("#password").value = request.password;
            getElementByXpath(document, "//button[contains(@aria-label, 'Sign in')]").click()
        }

        if (await waitUntilElementLoad(document, "p[id='incorrect-password-error']", 2)) {
            chrome.runtime.sendMessage({
                linkedin_incorrect_password: true
            })
        } else if (await waitUntilElementLoad(document, ".opt-out", 2)) {
            chrome.runtime.sendMessage({
                linkedin_error: true,
                message: "Something went wrong"
            });
        } else {
            chrome.runtime.sendMessage({
                linkedin_finished: true,
            });
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
        if (window.location.href.includes("linkedin.com/psettings/two-step-verification")) {
            if (await waitUntilElementLoad(document, ".opt-out", 2)) {
                document.querySelector(".opt-out").click();
                if (await waitUntilElementLoad(document, "#verify-password", 2)) {
                    chrome.runtime.sendMessage({
                        linkedin_get_password: true,
                    });
                }
            } else if (await waitUntilElementLoad(document, ".opt-in", 2)) {
                console.log("This is where the error is")
                chrome.runtime.sendMessage({
                    linkedin_error: true,
                    message: "Already disabled",
                });
            }
        } else if (window.location.href.includes("linkedin.com/signup")) {
            if (await waitUntilElementLoad(document, ".main__sign-in-link", 2)) {
                document.querySelector(".main__sign-in-link").click()
            }
        } else if (window.location.href.includes("login")) {
            if (await waitUntilElementLoad(document, ".member-profile-block", 2)) {
                document.querySelector(".member-profile-block").click();
            } else {
                chrome.runtime.sendMessage({
                    linkedin_get_credentials: true,
                });
            }
            //I don't know what this next block does
        } else if (window.location.href.includes("login-submit")) {
            document.querySelector("html > body > div > main > div > section > footer > form:nth-of-type(1) > button").click();
        } else if (window.location.href.includes("psettings/phone/add")) {
            chrome.runtime.sendMessage({
                linkedin_get_phone: true,
            });
        } else if (window.location.href.includes("checkpoint/challenge")) {
            chrome.runtime.sendMessage({
                linkedin_get_code: true,
            });
        }

    } catch (e) {
        console.log(e)
        exitScriptWithError();
    }
})();