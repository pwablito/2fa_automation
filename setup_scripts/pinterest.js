console.log("pinterest.js setup script injected");

function change(field, value) {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: false, key: '', char: '' }));
}

chrome.runtime.onMessage.addListener(function(request, _) {
    if (request.pinterest_credentials) {
        change(document.querySelector("#email"), request.email);
        change(document.querySelector("#password"), request.password);
        document.querySelector("html > body > div:nth-of-type(2) > div:nth-of-type(1) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div > div > div > div > div > div:nth-of-type(4) > form").submit();
    } else if (request.pinterest_password) {
        change(document.querySelector("html > body > div:nth-of-type(4) > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div > span > div:nth-of-type(1) > input"), request.password);
        document.querySelector("html > body > div:nth-of-type(4) > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(3) > div > div > div:nth-of-type(2) > button").click();
    }
});

if (window.location.href.includes("pinterest.com/settings/security")) {
    if (document.querySelector("html > body > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div > span > a") !== null) {
        chrome.runtime.sendMessage({
            pinterest_error: true,
            message: "Please verify your email before setting up 2fa",
        });
    } else {
        document.querySelector("#mfa_preference").click();
        setTimeout(() => {
            if (document.querySelector("html > body > div:nth-of-type(4) > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(2) > div > span > div:nth-of-type(1) > input") === null) {
                chrome.runtime.sendMessage({
                    pinterest_error: true,
                    message: "Something went wrong"
                });
            } else {
                chrome.runtime.sendMessage({
                    pinterest_get_password: true,
                });
            }
        }, 1000);
    }
} else {
    setTimeout(() => {
        if (document.querySelector("html > body > div:nth-of-type(2) > div:nth-of-type(1) > div > div > div > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > button") !== null) {
            // On login page
            document.querySelector("html > body > div:nth-of-type(2) > div:nth-of-type(1) > div > div > div > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > button").click()
            setTimeout(() => {
                // Move off of saved account page so we enter full credentials every time
                if (document.querySelector("html > body > div:nth-of-type(2) > div:nth-of-type(1) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(8) > div > div > a") !== null) {
                    document.querySelector("html > body > div:nth-of-type(2) > div:nth-of-type(1) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(8) > div > div > a").click();
                }
                chrome.runtime.sendMessage({
                    pinterest_get_credentials: true,
                });
            }, 500);
        } else {
            // Navigate to security page
            window.location.href = "https://pinterest.com/settings/security";
        }
    }, 1000);
}