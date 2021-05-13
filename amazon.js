console.log("amazon.js injected");

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

chrome.runtime.onMessage.addListener(
    async function(request, _) {
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
                document.querySelector("#mfa-cvf-embedded-content > div > div > div > div:nth-of-type(3) > div:first-of-type > div > div:nth-of-type(2) > div > div:nth-of-type(2) > input").value = request.phone_number;
                document.querySelector("#mfa-cvf-embedded-content > div > div > div > div:nth-of-type(3) > span > span > input").click();
                chrome.runtime.sendMessage({
                    amazon_get_code: true,
                });
            } else {
                document.querySelector("#ap_phone_number").value = request.phone_number;
                document.querySelector("#auth-continue").click();
                setTimeout(() => {
                    document.querySelector("#auth-verification-ok-announce").click();
                }, 1000);
            }
        } else if (request.amazon_sms_code) {
            if (window.location.href.includes("amazon.com/ap/pv")) {
                document.querySelector("#auth-pv-enter-code").value = request.code;
                document.querySelector("#auth-verify-button").click();
            } else if (window.location.href.includes("amazon.com/ap/mfa")) {
                document.querySelector("#auth-mfa-otpcode").value = request.code;
                document.querySelector("#auth-signin-button").click();
            } else {
                document.querySelector("#mfa-cvf-embedded-content > div > div > div > div:first-of-type > div:nth-of-type(5) > input").value = request.code;
                document.querySelector("#mfa-cvf-embedded-content > div > div > div > div:first-of-type > span > span > input").click();
            }
        }
    }
);

if (window.location.href.includes("amazon.com/ap/signin")) {
    if (document.querySelector("#ap_password") != null) {
        chrome.runtime.sendMessage({
            amazon_get_password: true
        });
    } else if (document.querySelector("#ap_email") != null) {
        chrome.runtime.sendMessage({
            amazon_get_email: true
        });
    }
} else if (window.location.href.includes("amazon.com/a/settings/approval/setup/register") || window.location.href.includes("amazon.com/ap/profile/mobilephone?openid.assoc_handle")) {
    chrome.runtime.sendMessage({
        amazon_get_phone_number: true
    });
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