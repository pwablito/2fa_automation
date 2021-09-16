console.log("google.js setup script injected");

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
        facebook_error: true,
        message: "Sorry! Something went wrong. ",
        message_for_dev: window.location.href
    });
}


async function handleReceivedMessage(request) {
    console.log(request);
    console.log(Date.now())
    if (request.google_email) {
        document.querySelector("[type=email]").value = request.email;
        document.querySelector("#identifierNext > div > button").click();
        if (await waitUntilElementLoad(document, "[name=password]", 2)) {
            console.log("Found the password");
            chrome.runtime.sendMessage({
                google_get_password: true
            });
        } else {
            chrome.runtime.sendMessage({
                google_get_email: true,
                message: "That username didn’t work. Please try again."
            })

        }

    } else if (request.google_password) {
        document.querySelector("[type=password]").value = request.password;
        document.querySelector("#passwordNext > div > button").click();
        setTimeout(() => {
            if (document.querySelector("#password > div > div > div > input") != null) {
                chrome.runtime.sendMessage({
                    google_get_password: true,
                    message: "That password didn’t work. Please try again."
                })
            }
        }, 5000);
    } else if (request.google_phone) {
        document.querySelector("[type=tel]").value = request.phone;
        let phoneNumberError = document.querySelector("[aria-atomic=true]");
        getElementByXpath(document, "//*[contains(text(),'Next')]/../..").click();
        let textCodeInputXPath = "[aria-label='Enter the code']";
        // let textCodeInput = document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > div > div > div > input");
        await timer(1000);
        console.log("1"), phoneNumberError.innerHTML;
        if (phoneNumberError.innerHTML != "") {
            chrome.runtime.sendMessage({
                google_get_phone: true,
                message: phoneNumberError.innerHTML
            });
            console.log("2");
        } else if (await waitUntilElementLoad(document, textCodeInputXPath, 1)) {
            chrome.runtime.sendMessage({
                google_get_code: true,
                type: "sms",
            });
            console.log("3");
        }
    } else if (request.google_code) {

        if (request.totp_seed) {
            console.log("yolo in code");
            document.querySelector("[aria-atomic=true][aria-live=assertive]").innerText = "";
            document.querySelector("[aria-label='Enter code']").value = request.code;
            document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(4)").click();

            await timer(1000);
            // let codeErrorXPath = "html > body > div:nth-of-type(12) > div > div:nth-of-type(2) > span > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div:nth-of-type(2) > div:nth-of-type(2)";
            let codeError = document.querySelector("[aria-atomic=true][aria-live=assertive]");
            if (await waitUntilElementLoad(document, "[aria-atomic=true][aria-live=assertive]", 2) && codeError.innerHTML != "") {
                chrome.runtime.sendMessage({
                    google_get_code: true,
                    type: "totp",
                    totp_seed: request.totp_seed,
                    message: codeError.innerHTML
                });
            } else {
                console.log("Above element wasn't found")
                if (document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(5) > span > span") !== null &&
                    document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(5) > span > span").textContent === "Done") {
                    console.log("Found next element now checking for something else")
                    buttonXPath = "html > body > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:nth-of-type(1) > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > div > div";
                    if (document.querySelector(buttonXPath) && document.querySelector(buttonXPath).innerText == "TURN OFF") {
                        await timer(1000)
                        if (document.querySelector("div[role='radio']") != null || document.querySelector("div[wizard-step-uid='Security Center: StrongAuth: Authenticator:installApp']") != null || document.querySelector("div[wizard-step-uid='Security Center: StrongAuth: Authenticator:verifyCode']") != null) {
                            return;
                        } else {
                            chrome.runtime.sendMessage({
                                google_get_already_enabled_2fa: true,
                            });
                        }
                    }
                    chrome.runtime.sendMessage({
                        google_finished_check: true,
                        method: 'totp'
                        });
                } else {
                    console.log("that didn't work, sending error message")
                    chrome.runtime.sendMessage({
                        google_error: true,
                        message: "Something went wrong",
                    })
                }
            }
        } else if (request.login_challenge) {
            console.log("login challenge request");
            if (document.querySelector("#idvPin")) {
                document.querySelector("#idvPin").value = request.code;
                getElementByXpath(document, "//span[contains(text(),'Next')]/..").click();
            } else if (document.querySelector("#totpPin")) {
                document.querySelector("#totpPin").value = request.code,
                    getElementByXpath(document, "//span[contains(text(),'Next')]/..").click();
            }


        } else {
            let codeInput = document.querySelector("[aria-label='Enter the code']");
            codeInput.value = request.code;
            getElementByXpath(document, "//*[contains(text(),'Next')]/../..").click();
            // document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div").click()
            let codeErrorXPath = "[aria-atomic=true]";
            let codeError = document.querySelector(codeErrorXPath);
            console.log("A");
            setTimeout(() => {
                if (codeError.innerHTML != "") {
                    chrome.runtime.sendMessage({
                        google_get_code: true,
                        message: codeError.innerHTML
                    });
                    console.log("B");
                } else {
                    console.log("C");
                    chrome.runtime.sendMessage({
                        google_finished_check: true,
                        method: 'sms'
                    });
                    getElementByXpath(document, "//span[contains(text(),'Turn on')]/../..").click();
                   
                }
            }, 2000);
            // if (await waitUntilElementLoad(document, codeErrorXPath, 2) && codeError.innerHTML != "") {
            //     chrome.runtime.sendMessage({
            //         google_get_code: true,
            //         message: codeError.innerHTML
            //     });
            //     console.log("B");
            // } else {
                // console.log("C");
                // getElementByXpath(document, "//span[contains(text(),'Turn on')]/../..").click();
                // await timer(200);
                // chrome.runtime.sendMessage({
                //     google_finished_check: true,
                //     method: 'sms'
                // });
            // }
        }
    } else if (request.google_sms) {
        // phone number fill page
        chrome.runtime.sendMessage({
            "google_get_phone": true
        });
    } else if (request.google_totp) {
        console.log("in TOTP");
        getElementByXpath(document, "//*[contains(text(),'Authenticator app')]/..//div[@role='button']").click();
        let popUpElemNextButtonXPath = "html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(3)";
        if (await waitUntilElementLoad(document, popUpElemNextButtonXPath, 2)) {
            for (let i = 0; i < 20; i++) {
                if (document.querySelector(popUpElemNextButtonXPath).click()) {
                    await timer(100); // 100 ms delay. Waiting for the button to be clickable
                    break;
                }
            }
        }
        // let qrCodeXPath = "html > body > div > div > div:nth-of-type(2) > span > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > img";
        for (let i = 0; i < 20; i++) {
            if (getElementByXpath(document, "//*[contains(text(),'t scan it')]/../..")) {
                getElementByXpath(document, "//*[contains(text(),'t scan it')]/../..").click()
                break;
            }
            await timer(100); // 100 ms delay. Waiting for the button to be clickable

        }
        for (let i = 0; i < 20; i++) {
            if (getElementByXpath(document, "//*[contains(text(),'spaces don')]/div")) {
                break;
            }
            await timer(100); // 100 ms delay. Waiting for the button to be clickable
        }
        document.querySelector(popUpElemNextButtonXPath).click();
        chrome.runtime.sendMessage({
            google_get_code: true,
            type: "totp",
            totp_seed: getElementByXpath(document, "//*[contains(text(),'spaces don')]/div").innerText
        });

        if (await waitUntilElementLoad(document, "html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(3)", 2)) {
            for (let i = 0; i < 20; i++) {
                if (document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(3)").click()) {
                    break;
                }
                await timer(100); // 100 ms delay. Waiting for the button to be clickable
            }
        }
    // } else if (request.start_backup) {
    //     window.location.href = "https://myaccount.google.com/signinoptions/two-step-verification";
    } else if (request.already_enabled_2fa) {
        console.log(request);
        if (request.backup_code_download == "false") {
           //Check which methods are enabled
            console.log("2FA already exists");

            let msg = {
                "google_finished_check": true,
                "method": "sms",
                "sms_already_setup": true,
                "message": "2FA is already enabled",
            };
            if (getElementByXpath(document, "//*[contains(text(),'Authenticator app')]/..//div[@role='button'][@aria-label='Delete']")) {
                msg["method"] = 'totp';
                // msg['sms_already_setup']= false;
            }
            chrome.runtime.sendMessage(msg);
              
        } else {
            await waitUntilPageLoad(document, 3);
            if (getElementByXpath(document, "//*[contains(text(),'Backup codes')]/..//div[@role='button']")) {
                getElementByXpath(document, "//*[contains(text(),'Backup codes')]/..//div[@role='button']").click();
            }
      
            if (await waitUntilElementLoad(document, "table", 3)) {
                var codes = getElementByXpath(document, "//*[contains(text(),'Keep these backup codes')]/..//table").querySelectorAll("span[jsname]");
                var codes_array = [];
                for (i = 0; i < codes.length; ++i) {
                    codes_array.push(codes[i].innerText);
                    console.log(codes[i].innerText);
                }
                chrome.runtime.sendMessage({
                        google_finished: true,
                        backup_codes_array: codes_array
                });
            }
           
        }
    }
}

var isRunning;
function onlyRunOnce(){
    if(!isRunning){
        isRunning = true;
        chrome.runtime.onMessage.addListener(
            function(request, _) {
                handleReceivedMessage(request).then();
            }
        );

        (async() => {
            if(isRunning){
                
            }
            try {
                if (window.location.href.includes("https://myaccount.google.com/")) {
                    console.log("Signed in");
                    await waitUntilPageLoad(document, 3);
                    if (window.location.href.includes("myaccount.google.com/signinoptions/two-step-verification")) {
                        // 2FA is already enabled
                        console.log("1");
                        await timer(2000);
                        buttonXPath = "html > body > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:nth-of-type(1) > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > div > div";
                        if (document.querySelector(buttonXPath) && document.querySelector(buttonXPath).innerText == "TURN OFF") {
                            if (document.querySelector("div[role='radio']") != null || document.querySelector("div[wizard-step-uid='Security Center: StrongAuth: Authenticator:installApp']") != null || document.querySelector("div[wizard-step-uid='Security Center: StrongAuth: Authenticator:verifyCode']") != null) {
                                return;
                            } else {
                                chrome.runtime.sendMessage({
                                    google_get_already_enabled_2fa: true,
                                });
                               
                            }
                        } else if (document.querySelector(buttonXPath) && document.querySelector(buttonXPath).innerText == "TURN ON") {
                            console.log("2");
                            document.querySelector(buttonXPath).click();
                            let msg = {
                                "google_get_method": true,
                                "sms_already_setup": true,
                                "message": "2FA turned on. Phone number for SMS 2FA already exists."
                            };
                            chrome.runtime.sendMessage(msg);
                        }
                        // Get started page
                        else if (getElementByXpath(document, "//*[contains(text(),'Get started')]/../..")) {
                            console.log("3");
                            getElementByXpath(document, "//*[contains(text(),'Get started')]/../..").click();
                        }
                        console.log("4");
                        if (await waitUntilElementLoad(document, "[type=tel]", 2)) {
                            chrome.runtime.sendMessage({ "google_get_method": true });
                        }
                    } else {
                        window.location.href = "https://myaccount.google.com/signinoptions/two-step-verification/enroll-welcome";
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
                    await waitUntilPageLoad(document, 3);
                    // In case all the accounts are logged out and google redirects to choose account. We redirect to select a new account always. 
                    // let UseAnotherAccountButtonXPath = "html > body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div:nth-of-type(2) > div > div:nth-of-type(1) > div > form > span > section > div > div > div > div:nth-of-type(1) > ul > li:nth-of-type(2) > div > div > div:nth-of-type(2)";
                    if (getElementByXpath(document, "//*[contains(text(),'Use another account')]/../..")) {
                        getElementByXpath(document, "//*[contains(text(),'Use another account')]/../..").click();
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
    }
}

onlyRunOnce();

// chrome.runtime.onMessage.addListener(
//     function(request, _) {
//         handleReceivedMessage(request).then();
//     }
// );

