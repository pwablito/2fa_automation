console.log("yahoo.js setup script injected");

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
        yahoo_error: true,
        message: "Sorry! Something went wrong. ",
        message_for_dev: window.location.href
    });
}

async function handleReceivedMessage(request) {
    console.log(request)
    if (request.yahoo_email) {
        document.querySelector("#login-username").value = request.email;
        document.querySelector("#login-signin").click();
    } else if (request.yahoo_password) {
        document.querySelector("#login-passwd").value = request.password;
        document.querySelector("#login-signin").click();
    } else if (request.yahoo_phone) {
        change(document.querySelector("#txtPhoneNumber"), request.phone);
        if (await waitUntilElementLoad(document, "#btnTsvSendCode", 2)) {
            document.querySelector("#btnTsvSendCode").click()
            if (await waitUntilElementLoad(document, ".error-title", 2)) {
                console.log("Found an error");
                if (document.querySelector(".error-title").textContent == "Daily limit exceeded, please try again later") {
                    chrome.runtime.sendMessage({
                        yahoo_error: true,
                        message: "Hit maximum attempts per day with this number"
                    });
                } else {
                    console.log("see the element saying phone number is invalid, sending message")
                    chrome.runtime.sendMessage({
                        yahoo_error: true,
                        yahoo_incorrect_phone_number: "invalid phone number",
                    });
                }
            } else {
                chrome.runtime.sendMessage({
                    yahoo_get_code: true,
                    type: 'sms'
                });
            }
        }
    } else if (request.yahoo_code) {
        console.log(request);
        if (request.login_challenge) {
            document.querySelector("#verification-code-field").value = request.code;
            document.querySelector("#verify-code-button").click();
            return;
        }
        if (request.yahoo_incorrect_totp) {
            if (await waitUntilElementLoad(document, "#btnTsvAuthenticatorVerifyCode", 2)) {
                let elem = document.querySelector(".code-input-container");
                console.log(request.code);
                for (let i = 0; i < 6; i++) {
                    console.log(request.code[i]);
                    let selectorstring = "input[index='" + i + "']";
                    change(elem.querySelector(selectorstring), request.code[i]);
                    // elem.querySelector(selectorstring).value=request.code[i];
                }
                document.querySelector("#btnTsvAuthenticatorVerifyCode").click()
                if (await waitUntilElementLoad(document, ".error-title", 2)) {
                    if (document.querySelector(".error-title").textContent == "Incorrect verification code") {
                        chrome.runtime.sendMessage({
                            yahoo_error: true,
                            yahoo_error_code: "incorrectTOTPCode",
                            type: "totp",
                            totp_url: request.totp_url
                        });
                    }
                }
            }
            //TOTP page; Gets gr code sends it
        } else if (await waitUntilElementLoad(document, "#btnAuthenticatorSetup", 2)) {
            document.querySelector("#btnAuthenticatorSetup").click();
            if (await waitUntilElementLoad(document, "#btnTsvAuthenticatorVerifyCode", 2)) {
                let elem = document.querySelector(".code-input-container");
                console.log(request.code);
                for (let i = 0; i < 6; i++) {
                    console.log(request.code[i]);
                    let selectorstring = "input[index='" + i + "']";
                    change(elem.querySelector(selectorstring), request.code[i]);
                    // elem.querySelector(selectorstring).value=request.code[i];
                }
                document.querySelector("#btnTsvAuthenticatorVerifyCode").click()
                if (await waitUntilElementLoad(document, ".error-title", 2)) {
                    if (document.querySelector(".error-title").textContent == "Incorrect verification code") {
                        console.log("incorrect code, sending message");
                        console.log(request.totp_url);
                        chrome.runtime.sendMessage({
                            yahoo_error: true,
                            yahoo_error_code: "incorrectTOTPCode",
                            type: "totp",
                            totp_url: request.totp_url
                        });
                    }
                } else {
                    chrome.runtime.sendMessage({
                        yahoo_finished: true,
                    });
                }
            }
            //SMS page
        } else {
            if (await waitUntilElementLoad(document, ".code-input-container", 2)) {
                let elem = document.querySelector(".code-input-container");

                for (let i = 0; i < 5; i++) {
                    let selectorstring = "input[index='" + i + "']";
                    change(elem.querySelector(selectorstring), request.code[i]);

                }
                document.querySelector("#btnTsvVerifyCode").click();
                if (await waitUntilElementLoad(document, ".error-title", 2)) {
                    if (document.querySelector(".error-title").textContent == "Something went wrong, Try again") {
                        chrome.runtime.sendMessage({
                            yahoo_error: true,
                            yahoo_error_code: "incorrectCode",
                        });
                    }
                } else {
                    chrome.runtime.sendMessage({
                        yahoo_finished: true,
                    });
                }
            }
        }
    } else if (request.yahoo_sms) {
        if (request.change_method) {
            document.querySelector("#btnTsvTurnOff").click();
            if (await waitUntilElementLoad(document, "a[href^='/myaccount/security/two-step-verification']", 2)) {
                document.querySelector("a[href^='/myaccount/security/two-step-verification']").click();
                if (await waitUntilElementLoad(document, "#btnTsvIntro", 2)) {
                    document.querySelector("#btnTsvIntro").click()
                }
            }

        }
        if (await waitUntilElementLoad(document, "#tsvPhone", 2)) {
            document.querySelector("#tsvPhone").click();
        }

        if (await waitUntilElementLoad(document, "#lnkBtnShowSendCodeForm", 2)) {
            document.querySelector("#lnkBtnShowSendCodeForm").click();
            chrome.runtime.sendMessage({
                yahoo_get_phone: true,
            });
        }
    } else if (request.yahoo_totp) {
        console.log("Told to start totp");
        if (request.change_method) {
            document.querySelector("#btnTsvTurnOff").click();
            if (await waitUntilElementLoad(document, "a[href^='/myaccount/security/two-step-verification']", 2)) {
                document.querySelector("a[href^='/myaccount/security/two-step-verification']").click();
                if (await waitUntilElementLoad(document, "#btnTsvIntro", 2)) {
                    document.querySelector("#btnTsvIntro").click()
                }
            }
        }
        document.querySelector("#tsvTOTP").click();
        if (await waitUntilElementLoad(document, "#btnAuthenticatorIntro", 2)) {
            document.querySelector("#btnAuthenticatorIntro").click();
            if (await waitUntilElementLoad(document, ".tsv-authenticator-setup-qr", 2)) {
                document.querySelector("#lnkBtnGoToSetUpAlt").click();
                if (await waitUntilElementLoad(document, ".tcv-code-txt", 2)) {
                    chrome.runtime.sendMessage({
                        yahoo_get_code: true,
                        type: "totp",
                        totp_seed: document.querySelector(".tcv-code-txt").textContent
                    });
                }

            }

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
        if (window.location.href.includes("login.yahoo.com")) {
            if (document.querySelector("#login-username") !== null) {
                chrome.runtime.sendMessage({
                    yahoo_get_email: true
                });
            } else if (window.location.href.includes("account/challenge/password")) {
                chrome.runtime.sendMessage({
                    yahoo_get_password: true,
                })
            } else if (window.location.href.includes("myaccount/security")) {
                if (window.location.href.includes("two-step-verification")) {
                    if (await waitUntilElementLoad(document, "#btnTsvIntro", 2)) {
                        document.querySelector("#btnTsvIntro").click();
                        if (await waitUntilElementLoad(document, "#tsvPhone", 2)) {
                            chrome.runtime.sendMessage({
                                yahoo_get_method: true,
                            });
                        }
                    } else if (document.querySelector("#btnTsvTurnOff")) {
                        if (document.querySelector(".tsv-authenticator")) {
                            if (document.querySelector(".tsv-authenticator").textContent == "Authenticator App  ON  ") {
                                chrome.runtime.sendMessage({
                                    yahoo_change_method: true,
                                    method_enabled: 'totp'
                                });
                            }
                        } else {
                            chrome.runtime.sendMessage({
                                yahoo_change_method: true,
                                method_enabled: 'sms'
                            });
                        }
                    }
                } else {
                    window.location = "https://login.yahoo.com/myaccount/security/two-step-verification";
                }
            } else if (window.location.href.includes("phone-verify")) {
                chrome.runtime.sendMessage({
                    yahoo_get_code: true,
                    type: 'sms',
                    login_challenge: true
                });
            } else if (window.location.href.includes("account/challenge/tsv-authenticator")) {
                chrome.runtime.sendMessage({
                    yahoo_get_code: true,
                    type: 'totp',
                    login_challenge: true
                });
            } else if (window.location.href.includes("recaptcha")) {
                chrome.runtime.sendMessage({
                    yahoo_complete_captcha: true,
                });
            } else if (window.location.href.includes("account/challenge/challenge-selector")) {
                document.querySelector("button[type='submit']").click()
            } else {
                chrome.runtime.sendMessage({
                    yahoo_get_email: true,
                });
            }
        }

    } catch (e) {
        console.log(e)
        exitScriptWithError();
    }
})();