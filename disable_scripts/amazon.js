console.log("amazon.js disable script injected");

chrome.runtime.onMessage.addListener(function(request, _) {
    if (request.amazon_code) {
        document.querySelector("#auth-mfa-otpcode").value = request.code;
        document.querySelector("#auth-signin-button").click();
    } else if (request.amazon_credentials) {}
});

if (window.location.href.includes("amazon.com/a/settings/approval")) {
    //TODO disable button is null sometimes when clicked
    document.querySelector("#disable-button").click();
    setTimeout(() => {
        document.querySelector("#remove-devices-checkbox-input").click();
        document.querySelector("#confirm-disable-dialog-modal-submit").click();
    }, 1000);
} else if (window.location.href.includes("signin")) {
    if (document.querySelector("#ap_switch_account_link") !== null) {
        document.querySelector("#ap_switch_account_link").click();
    } else if (
        document.querySelector(
            "html > body > div:first-of-type > div:first-of-type > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div:first-of-type > div > div > div:nth-of-type(2) > div:nth-of-type(2) > a > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div"
        ) !== null
    ) {
        document
            .querySelector(
                "html > body > div:first-of-type > div:first-of-type > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div:first-of-type > div > div > div:nth-of-type(2) > div:nth-of-type(2) > a > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div"
            )
            .click();
    } else {
        chrome.runtime.sendMessage({
            amazon_get_credentials: true,
        });
    }
} else if (window.location.href.includes("amazon.com/ap/mfa")) {
    chrome.runtime.sendMessage({
        amazon_get_code: true,
    });
}