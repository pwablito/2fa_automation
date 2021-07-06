console.log("amazon.js disable script injected");

chrome.runtime.onMessage.addListener(function(request, _) {
    if (request.amazon_code) {
        document.querySelector("#auth-mfa-otpcode").value = request.code;
        document.querySelector("#auth-signin-button").click();
    } else if (request.amazon_email) {
        document.querySelector("#ap_email").value = request.email;
        document.querySelector("#continue > span > input").click();
    } else if (request.amazon_password) {
        document.querySelector("#ap_password").value = request.password;
        document.querySelector("#signInSubmit").click();
    }
});

if (window.location.href.includes("amazon.com/a/settings/approval")) {
    if (document.querySelector("#disable-button") === null) {
        chrome.runtime.sendMessage({
            amazon_error: true,
            message: "2FA already disabled",
        });
    } else {
        document.querySelector("#disable-button").click();
        setTimeout(() => {
            document.querySelector("#remove-devices-checkbox-input").click();
            document.querySelector("#confirm-disable-dialog-modal-submit").click();
        }, 1000);
    }
} else if (window.location.href.includes("amazon.com/ap/signin")) {
    if (document.querySelector("html > body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div:nth-of-type(1) > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div > div > a") !== null) {
        console.log("Signing out");
        document.querySelector("html > body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div:nth-of-type(1) > div > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div > div > a").click();
    } else if (document.querySelector("#ap_switch_account_link") !== null) {
        document.querySelector("#ap_switch_account_link").click();
    } else if (document.querySelector("html > body > div:first-of-type > div:first-of-type > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div:first-of-type > div > div > div:nth-of-type(2) > div:nth-of-type(2) > a > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div") !== null) {
        document.querySelector("html > body > div:first-of-type > div:first-of-type > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div:first-of-type > div > div > div:nth-of-type(2) > div:nth-of-type(2) > a > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div").click();
    } else if (document.querySelector("#ap_password") !== null) {
        chrome.runtime.sendMessage({
            amazon_get_password: true,
        });
    } else if (document.querySelector("#ap_email") !== null) {
        chrome.runtime.sendMessage({
            amazon_get_email: true,
        });
    }
} else if (window.location.href.includes("amazon.com/ap/mfa")) {
    chrome.runtime.sendMessage({
        amazon_get_code: true,
    });
} else if (window.location.href.includes("amazon.com/ap/cvf")) {
    console.log("Needs approval");
    chrome.runtime.sendMessage({
        amazon_approve_login: true
    });
}