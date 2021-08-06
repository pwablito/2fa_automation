console.log("dropbox.js disable script injected");

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
        if (request.dropbox_credentials) {
            change(document.querySelector("html > body > div:nth-of-type(12) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > div > form > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > input"), request.username);
            change(document.querySelector("html > body > div:nth-of-type(12) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > div > form > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > input"), request.password);
            document.querySelector("html > body > div:nth-of-type(12) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > div > form > div:nth-of-type(2) > button").click();
            setTimeout(() => {
                if (document.querySelector("html > body > div:nth-of-type(12) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > form > div:nth-of-type(2) > div > div:nth-of-type(2) > input") !== null) {
                    chrome.runtime.sendMessage({
                        dropbox_get_code: true,
                    });
                } else if (document.querySelector(".error-message") && document.querySelector(".error-message").textContent !== "") {
                    chrome.runtime.sendMessage({
                        dropbox_get_credentials: true,
                        message: document.querySelector(".error-message").textContent,
                    });
                } else {
                    chrome.runtime.sendMessage({
                        dropbox_error: true,
                        message: "2FA already disabled",
                    });
                }
            }, 8000);
        } else if (request.dropbox_password) {
            change(document.querySelector("#password"), request.password);
            document.querySelector("html > body > div > div > div > div > div > div:nth-of-type(3) > button").click();
            setTimeout(() => {
                let error = document.querySelector("#error-message1");
                if (error !== null && error.textContent !== null) {
                    chrome.runtime.sendMessage({
                        dropbox_get_password: true,
                        message: error.textContent
                    });
                } else {
                    if(document.querySelector("html > body > div:nth-of-type(16) > div > div > div > div > div:nth-of-type(3) > button") != null){
                        document.querySelector("html > body > div:nth-of-type(16) > div > div > div > div > div:nth-of-type(3) > button").click();
                    } else {
                        document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button").click();
                    }
                    setTimeout(() => {
                        chrome.runtime.sendMessage({
                            dropbox_finished: true,
                        });
                    }, 2000);
                }
            }, 2000);
        } else if (request.dropbox_code) {
            change(document.querySelector("html > body > div:nth-of-type(12) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > form > div:nth-of-type(2) > div > div:nth-of-type(2) > input"), request.code);
            document.querySelector("html > body > div:nth-of-type(12) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > form > button").click();
        }
    }
);
if (window.location.href.includes("dropbox.com/account/security")) {
    setTimeout(() => {
        document.querySelector("html > body > div > div > div > div > div:first-of-type > div > div > div > div > div:nth-of-type(3) > div > div:nth-of-type(2) > label > input").click();
        chrome.runtime.sendMessage({
            dropbox_get_password: true,
        });
    }, 1000);
} else if (window.location.href.includes("login")) {
    chrome.runtime.sendMessage({
        dropbox_get_credentials: true,
    });
}