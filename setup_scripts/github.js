console.log("github.js setup script injected");


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
    //     github_error: true,
    //     message: "Sorry! Something went wrong. ",
    //     message_for_dev: window.location.href
    // });
}

async function handleReceivedMessage(request) {
    console.log(request)
    if (request.github_credentials) {
        document.querySelector("[name=login]").value = request.login;
        document.querySelector("[name=password]").value = request.password;
        document.querySelector("[value='Sign in']").click();
        setTimeout(() => {
            window.location.href = "https://github.com/settings/two_factor_authentication/setup/intro";
        }, 500);
    } else if (request.github_phone) {
        change(document.querySelector("[name=number]"), request.phone);
        document.querySelector("button[data-target$='buttonSendSms']").click();
        await timer(1000);
        if (document.querySelector("div[data-target$='smsError']") && document.querySelector("div[data-target$='smsError']").innerText.trim() != "") {
            chrome.runtime.sendMessage({
                github_get_phone: true,
                message: "Invalid Phone Number."
            });
        } else {
            chrome.runtime.sendMessage({
                github_get_code: true,
                type: "sms",
            });
        }
    } else if (request.github_code) {
        if (request.code.length != 6) {
            if (request.totp_secret) {
                chrome.runtime.sendMessage({
                    github_get_code: true,
                    type: "totp",
                    message: "Invalid code",
                    totp_seed: request.totp_seed
                        // TODO Fix issue #8 to get this to work
                });
            } else {
                // TODO clean this up to use the new backend api for codes
                chrome.runtime.sendMessage({
                    github_get_code: true,
                    message: "Invalid code",
                });
            }
        } else {
            // Entering code
            if (request.totp_secret) {
                change(document.querySelector("input[name='appOtp']"), request.code);
            } else {
                change(document.querySelector("input[name='smsOtp']"), request.code);
            }
            console.log(request.totp_secret);

            change(document.querySelector("input[data-target*='two-factor-setup-verification']"), request.code);
            await timer(1000);
            if (document.querySelectorAll("[data-target*=stepError]")[1] && document.querySelectorAll("[data-target*=stepError]")[1].innerText.trim() != "" && document.querySelectorAll("single-page-wizard-step")[1].getAttribute("data-single-page-wizard-step-current") === "true") {
                if (request.totp_secret) {
                    chrome.runtime.sendMessage({
                        github_get_code: true,
                        message: "Invalid code",
                        totp_secret: request.totp_secret
                    });
                } else {
                    chrome.runtime.sendMessage({
                        github_get_code: true,
                        message: "Invalid code",
                    });
                }
            } else {
                let list_codes = document.querySelectorAll(".two-factor-recovery-code");
                let backup_codes = []
                for(i = 0; i < 10; i++){
                    backup_codes.push(list_codes[i].innerText);
                    console.log(list_codes[i].innerText)
                }
                document.querySelector("[data-action$=onDownloadClick]").click();
                setTimeout(() => {
                    document.querySelectorAll("button[data-target*='nextButton']")[2].click();
                    setTimeout(() => {
                        if (getElementByXpath(document, "//button[contains(text(),'Done')]")) {
                            // getElementByXpath(document, "//button[contains(text(),'Done')]").click();
                            chrome.runtime.sendMessage({
                                github_finished: true,
                                backup_codes_array: backup_codes
                            });
                        } else { exitScriptWithError(); }
                    }, 1000);
                }, 100);
            }
        }
    } else if (request.github_password) {
        document.querySelector("[type=password]").value = request.password;
        document.querySelector("[type=submit]").click();
    } else if (request.github_sms) {
        document.querySelector("input[value=sms][type=radio]").click();
        getElementByXpath(document, "//button[contains(text(),'Continue')]").click();
        chrome.runtime.sendMessage({
            github_get_phone: true,
        });
    } else if (request.github_totp){
        document.querySelector("input[value=app][type=radio]").click();
        getElementByXpath(document, "//button[contains(text(),'Continue')]").click();
        console.log("In Start TOTP");
        if (await waitUntilElementLoad(document, "[data-target='two-factor-setup-verification.mashedSecret']", 2)) {
            await timer(500); // To wait for textContent to load in the div element
            console.log(document.querySelector("[data-target='two-factor-setup-verification.mashedSecret']").innerHTML);
            chrome.runtime.sendMessage({
                github_get_code: true,
                type: "totp",
                totp_seed: document.querySelector("[data-target='two-factor-setup-verification.mashedSecret']").textContent.replace(/\s+/g, '')
            });
        } else { exitScriptWithError(); }
    } else {
        exitScriptWithError();
    }
}

chrome.runtime.onMessage.addListener(
    function(request, _) {
        handleReceivedMessage(request).then();
    }
);


(async() => {
    try {
        if (window.location.href.includes("settings/two_factor_authentication/setup")) {
            if (document.querySelector("[type=password]")) {
                chrome.runtime.sendMessage({
                    github_get_password: true,
                });
            } else {
                chrome.runtime.sendMessage({
                    github_get_method: true,
                });
            }
        } else { // either github.com/login or redirection to github.com
            if (document.querySelector("[name=login]")) {
                chrome.runtime.sendMessage({
                    github_get_credentials: true,
                });
            } else {
                console.log("Already signed in");
                window.location.href = "https://github.com/settings/two_factor_authentication/setup/intro";
            }
        }
    } catch (e) {
        console.log(e);
        // Deal with the fact the chain failed
    }
})();