console.log("amazon.js setup script injected");

function getElementByXpath(doc, xpath) {
    return doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function change(field, value) {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: false, key: '', char: '' }));
}
function timer(ms) { return new Promise(res => setTimeout(res, ms)); }

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
    chrome.runtime.sendMessage({
        linkedin_error: true,
        message: "Sorry! Something went wrong. ",
        message_for_dev : window.location.href
    });
}

async function handleReceivedMessage(request){
    if (request.amazon_password) {
        if (window.location.href.includes("amazon.com/ap/cnep")) {
            document.querySelector("#ap_password").value = request.password;
            document.querySelector("#auth-cnep-change-email-submit").click();
            chrome.runtime.sendMessage({
                amazon_finished: true
            });
        } else {
            document.querySelector("#ap_password").value = request.password
            document.querySelector("#signInSubmit").click();
        }
    } else if (request.amazon_email) {
        document.querySelector("#ap_email").value = request.email;
        document.querySelector("input#continue").click()
    } else if (request.amazon_phone_number) {
        if (document.querySelector("#mfa-cvf-embedded-content") != null) {
            document.querySelector("input[name='cvf_phone_num']").value = request.phone_number;
            document.querySelector("input[name='cvf_action']").click();
            if(await waitUntilElementLoad(document, "input[name='code']", 2)){
                chrome.runtime.sendMessage({
                    amazon_get_code: true,
                });
            } else if(await waitUntilElementLoad(document, ".cvf-widget-alert-message", 2)){
                chrome.runtime.sendMessage({
                    amazon_get_phone_number: true,
                    amazon_invalid_phone_number: true
                });
            }
           
        } else {
            document.querySelector("#ap_phone_number").value = request.phone_number;
            document.querySelector("#auth-continue").click();
            if(await waitUntilElementLoad(document, "#auth-verification-ok-announce", 2)){
                document.querySelector("#auth-verification-ok-announce").click();
            }
        }
    } else if (request.amazon_sms_code) {
        if (window.location.href.includes("amazon.com/ap/pv")) {
            document.querySelector("#auth-pv-enter-code").value = request.code;
            document.querySelector("#auth-verify-button").click();
        } else if (window.location.href.includes("amazon.com/ap/mfa")) {
            document.querySelector("#auth-mfa-otpcode").value = request.code;
            document.querySelector("#auth-signin-button").click();
        } else {
            console.log("entered sms code");
            document.querySelector("input[name='code']").value = request.code;
            document.querySelector("input[name='cvf_action']").click();
            if(await waitUntilElementLoad(document, ".cvf-alert-section", 2)){
                console.log("Sending message")
                chrome.runtime.sendMessage({
                    amazon_get_code: true,
                    amazon_incorrect_sms_code: true
                });
            }
        }
    } else if (request.amazon_totp_code) {
        document.querySelector("#ch-auth-app-code-input").value = request.code;
        document.querySelector("#ch-auth-app-submit").click();
        if(await waitUntilElementLoad(document, "#ch-auth-app-form-error", 2)){
            console.log("incorrect code");
            chrome.runtime.sendMessage({
                amazon_get_code: true,
                amazon_incorrect_totp_code: true,
                totp_url: document.querySelector("div.a-accordion-active img").src
            }); 
        }
    } else if (request.amazon_start_sms) {
        chrome.runtime.sendMessage({
            amazon_get_phone_number: true,
        });
    } else if (request.amazon_start_totp) {
        let elem =  document.querySelector("#sia-otp-accordion-totp-header");
        elem.querySelector(".a-accordion-radio").click();
        if(await waitUntilElementLoad(document, "div.a-accordion-active img", 2)){
            chrome.runtime.sendMessage({
                amazon_get_code: true,
                totp_url: document.querySelector("div.a-accordion-active img").src
            }); 
        }
        
    }
}

chrome.runtime.onMessage.addListener(
    function(request, _) {
        handleReceivedMessage(request).then()
    }
);

(async () => {
    if (window.location.href.includes("amazon.com/ap/signin")) {
        if (document.querySelector("#ap_password") != null) {
            if(document.querySelector(".a-alert-heading").textContent == "There was a problem"){
                chrome.runtime.sendMessage({
                    amazon_get_password: true,
                    amazon_password_incorrect: true
                });
            } else {
                chrome.runtime.sendMessage({
                    amazon_get_password: true
                });
            }
            
        } else if (document.querySelector("#ap_email") != null) {
            chrome.runtime.sendMessage({
                amazon_get_email: true
            });
        }
    } else if (window.location.href.includes("amazon.com/a/settings/approval/setup/register") || window.location.href.includes("amazon.com/ap/profile/mobilephone?openid.assoc_handle")) {
        if(await waitUntilElementLoad(document, "#sia-select-otp-device-accordion", 2)) {
            chrome.runtime.sendMessage({
                amazon_get_type: true
            });
        } else {
            console.log("2FA already enabled?")
            exitScriptWithError();
        }
            
    } else if (window.location.href.includes("amazon.com/a/settings/approval/setup/howto")) {
        chrome.runtime.sendMessage({
            amazon_finished: true
        });
        document.querySelector("#enable-mfa-form-submit").click();
    } else if (window.location.href.includes("amazon.com/ap/cvf/approval")) {
        chrome.runtime.sendMessage({
            amazon_approve_login: true
        });
    } else if (window.location.href.includes("amazon.com/a/settings/approval")) {
        if (document.querySelector("#ch-settings-otp-change-preferred")) {
            document.querySelector("#ch-settings-otp-change-preferred").click();
        } else {
            document.querySelector("#sia-settings-enable-mfa").click();
        }
    } else if (window.location.href.includes("amazon.com/ap/pv")) {
        chrome.runtime.sendMessage({
            amazon_get_code: true
        });
    } else if (window.location.href.includes("amazon.com/ap/mfa")) {
        chrome.runtime.sendMessage({
            amazon_get_code: true,
            message: "To switch phones, please enter the code sent to your old phone number"
        });
    } else if (window.location.href.includes("amazon.com/ap/cnep")) {
        chrome.runtime.sendMessage({
            amazon_get_password: true
        });
    } else {
        window.location.href = "https://www.amazon.com/a/settings/approval/setup/register";
    }
})();

