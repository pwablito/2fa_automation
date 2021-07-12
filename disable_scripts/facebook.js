console.log("facebook.js disable script injected");

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
        if (request.facebook_password) {
            if (document.querySelector("html > body > div:first-of-type > div:first-of-type > div:first-of-type > div > form > div > div:nth-of-type(2) > table > tbody > tr:first-of-type > td > input") != null) {
                document.querySelector("html > body > div:first-of-type > div:first-of-type > div:first-of-type > div > form > div > div:nth-of-type(2) > table > tbody > tr:first-of-type > td > input").value = request.password;
                document.querySelector("html > body > div:first-of-type > div:first-of-type > div:first-of-type > div > form > div > div:nth-of-type(3) > div > div:first-of-type > label > input").click();
            }
            change(document.querySelector("#ajax_password"), request.password);
            let item = document.querySelector("html > body > div:nth-of-type(5) > div:nth-of-type(2) > div > div > div > div:nth-of-type(3) > table > tbody > tr > td:nth-of-type(2) > button");
            item = document.querySelector("html > body > div:nth-of-type(7) > div:nth-of-type(2) > div > div > div > div:nth-of-type(3) > table > tbody > tr > td:nth-of-type(2) > button");
            item.click();
            setTimeout(() => {
                if (document.querySelector("#ajax_password") != null) {
                    chrome.runtime.sendMessage({
                        facebook_get_password: true,
                        message: "Incorrect password",
                    });
                } else {
                    chrome.runtime.sendMessage({
                        facebook_get_phone_number: true,
                    });
                }
            }, 2000);
        } else if (request.facebook_credentials) {
            document.querySelector("#email").value = request.email;
            document.querySelector("#pass").value = request.password;
            document.querySelector("html > body > div:first-of-type > div:nth-of-type(2) > div:first-of-type > div > div > div > div:nth-of-type(2) > div > div:first-of-type > form > div:nth-of-type(2) > button").click();
        }
    }
);


setTimeout(() => {
    if (window.location.href.includes("security/2fac/setup/intro")) {
        if (document.querySelector("html > body > div:nth-of-type(1) > div > div:nth-of-type(1) > div > div:nth-of-type(3) > div > div > div:nth-of-type(1) > div:nth-of-type(1) > iframe") !== null) {
            window.location.href = document.querySelector("html > body > div:nth-of-type(1) > div > div:nth-of-type(1) > div > div:nth-of-type(3) > div > div > div:nth-of-type(1) > div:nth-of-type(1) > iframe").src;
        }
    }
}, 1000);