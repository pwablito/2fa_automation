console.log("linkedin.js setup script injected");

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
    if (request.linkedin_credentials) {
        document.querySelector("#username").value = request.login;
        document.querySelector("#password").value = request.password;
        getElementByXpath(document, "//button[contains(@aria-label, 'Sign in')]").click()
        if (await waitUntilElementLoad(document, "#error-for-password", 2)) {
            chrome.runtime.sendMessage({
                linkedin_incorrect_password: true
            })
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
        } else {
            document.querySelector("#password").value = request.password;
            getElementByXpath(document, "//button[contains(@aria-label, 'Sign in')]").click()
            if (await waitUntilElementLoad(document, "#error-for-password", 2)) {
                chrome.runtime.sendMessage({
                    linkedin_incorrect_password: true
                })
            }
        }


        //auth app
        if (await waitUntilElementLoad(document, ".authenticator-QRImage", 2)) {
            chrome.runtime.sendMessage({
                linkedin_get_code: true,
                type: 'totp',
                totp_seed: document.querySelector(".authenticator-key").textContent,
            });
        }
        //sms
        if (await waitUntilElementLoad(document, "input[id='enter-code']", 2) && document.querySelector(".authenticator-QRImage") == null) {
            chrome.runtime.sendMessage({
                linkedin_get_code: true,
                type: 'sms'
            });
        }

    } else if (request.linkedin_totp) {
        console.log(request)
        if(request.change_method){
            document.querySelector("#change-two-step-method-button").click()
        }
        getElementByXpath(document, "//select[contains(@id, 'two-step-method')]").selectedIndex = 0;
        document.querySelector(".continue").click();

        if (await waitUntilElementLoad(document, "#verify-password", 2)) {
            chrome.runtime.sendMessage({
                linkedin_get_password: true,
            });
        }
        if (await waitUntilElementLoad(document, ".authenticator-QRImage", 2)) {
            chrome.runtime.sendMessage({
                linkedin_get_code: true,
                type: 'totp',
                totp_seed: document.querySelector(".authenticator-key").textContent,
            });
        }

    } else if (request.linkedin_sms) {
        console.log(request)
        if(request.change_method){
            document.querySelector("#change-two-step-method-button").click()
        }
        getElementByXpath(document, "//select[contains(@id, 'two-step-method')]").selectedIndex = 1;
        document.querySelector(".continue").click();

        if (await waitUntilElementLoad(document, "#verify-password", 2)) {
            chrome.runtime.sendMessage({
                linkedin_get_password: true,
            });
        }

    } else if (request.linkedin_code) {
        console.log("Got code");
        document.querySelector("#enter-code").value = request.code;



        if (await waitUntilElementLoad(document, ".verify", 2)) {
            document.querySelector(".verify").click()
            if (await waitUntilElementLoad(document, "p[id='checkpoint-error']", 2)) {
                chrome.runtime.sendMessage({
                    linkedin_get_code: true,
                    linkedin_incorrect_SMS_code: true
                })
            }
        }
        if (await waitUntilElementLoad(document, ".continue", 2)) {
            document.querySelector(".continue").click()
            if (await waitUntilElementLoad(document, "p[id='two-step-authenticator-error']", 2)) {
                chrome.runtime.sendMessage({
                    linkedin_get_code: true,
                    linkedin_incorrect_TOTP_code: true,
                    totp_seed: document.querySelector(".authenticator-key").textContent,
                })
            }
        }

        if (await waitUntilElementLoad(document, "span[data-state-key='i18n_two_factor_auth_state_choice']", 2)) {
            if (document.querySelector("span[data-state-key='i18n_two_factor_auth_state_choice']").textContent == "On") {
                chrome.runtime.sendMessage({
                    linkedin_finished: true,
                });
            }

        } else {
            exitScriptWithError();
            chrome.runtime.sendMessage({
                linkedin_error: true,
                message: "Something went wrong",
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
            await waitUntilPageLoad(document, 2);
            //await waitUntilElementLoad(document, )document.querySelector("button:nth-of-type(contains(@class, 'opt-in'))")
            if (await waitUntilElementLoad(document, ".opt-in", 2)) {
                console.log("In first await")
                document.querySelector(".opt-in").click()
                chrome.runtime.sendMessage({
                    linkedin_get_method: true,
                });
            } else if (await waitUntilElementLoad(document, ".opt-out", 2)) {
                if(document.querySelector(".two-step-via").textContent == "Via Authenticator app  "){
                    chrome.runtime.sendMessage({
                        linkedin_change_method: true,
                        method_enabled: "totp",
                    });
                } else {
                    chrome.runtime.sendMessage({
                        linkedin_change_method: true,
                        method_enabled: "sms",
                    });
                }
                
            }
        } else if (window.location.href.includes("login-submit")) {
            if (await waitUntilElementLoad(document, ".member-profile-block", 2)) {
                document.querySelector(".member-profile-block").click();
            }
        } else if (window.location.href.includes("linkedin.com/signup")) {
            if (await waitUntilElementLoad(document, ".main__sign-in-link", 2)) {
                document.querySelector(".main__sign-in-link").click()
            }
        } else if (window.location.href.includes("psettings/phone/add")) {
            chrome.runtime.sendMessage({
                linkedin_get_phone: true,
            });
        } else if (window.location.href.includes("login")) {
            if (await waitUntilElementLoad(document, ".member-profile-block", 2)) {
                document.querySelector(".member-profile-block").click();
            } else {
                chrome.runtime.sendMessage({
                    linkedin_get_credentials: true,
                    type: "email"
                });
            }

        }
    } catch (e) {
        console.log(e);
        exitScriptWithError();
    }
})();