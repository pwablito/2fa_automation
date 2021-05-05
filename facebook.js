console.log("facebook.js injected");

function change(field, value) {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: false, key: '', char: '' }));
}

chrome.runtime.onMessage.addListener(
    function(request, _) {
        if (request.facebook_phone_number) {
            change(document.querySelector("html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2) > span > input"), request.number);
            document.querySelector("html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(3) > span:nth-of-type(2) > div > div:nth-of-type(2) > button").click();
        }
    }
);

setTimeout(() => {
    if (window.location.href.includes("facebook.com/security/2fac/setup/intro")) {
        if (window.location.href.includes("?cquick=")) {
            // Inside iframe
            document.querySelector("body > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > a").click();
            // Wait for dialog to load, then decide what to do
            setTimeout(() => {
                console.log("Checking for password or phone field");
                if (document.querySelector("html > body > div:nth-of-type(7) > div:nth-of-type(2) > div > div > div > div:nth-of-type(2) > div:nth-of-type(4) > span > input") != null) {
                    // Page is prompting for password
                    chrome.runtime.sendMessage({
                        facebook_get_password: true
                    });
                    console.log("Needed a password");
                } else if (document.querySelector("html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2) > span > input") != null) {
                    // Page is prompting for phone number
                    chrome.runtime.sendMessage({
                        facebook_get_phone_number: true
                    });
                    console.log("Needed a phone number");
                } else {
                    console.log("Couldn't identify either...");
                }
            }, 3000);
        } else {
            if (document.querySelector("body > div > div > div > div > div:nth-child(6) > div > div > div > div > iframe") != null) {
                // logged in- open iframe
                window.location = document.querySelector("body > div > div > div > div > div:nth-child(6) > div > div > div > div > iframe").src;
                console.log("Logged in, opening iframe");
            } else {

            }
        }
    }
}, 1000);