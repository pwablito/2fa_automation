console.log("dropbox.js injected");

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
            document.querySelector('html > body > div > div:first-of-type > div:nth-of-type(2) > div > div > div:first-of-type > div:nth-of-type(2) > div > div > div > form > div:first-of-type > div:first-of-type > div:nth-of-type(2) > input').value = request.username;
            document.querySelector('html > body > div > div:first-of-type > div:nth-of-type(2) > div > div > div:first-of-type > div:nth-of-type(2) > div > div > div > form > div:first-of-type > div:nth-of-type(2) > div:nth-of-type(2) > input').value = request.password;
            document.querySelector("html > body > div > div:first-of-type > div:nth-of-type(2) > div > div > div:first-of-type > div:nth-of-type(2) > div > div > div > form > div:nth-of-type(2) > button").click();
        } else if (request.dropbox_password) {
            document.querySelector("#password").value = request.password;
            document.querySelector("html > body > div > div > div > div > div > div:nth-of-type(3) > button").click();
            chrome.runtime.sendMessage({
                dropbox_get_type: true,
            });
        } else if (request.dropbox_phone_number) {
            document.querySelector("html > body > div > div > div > div > div > div:nth-of-type(2) > div > div > div:nth-of-type(3) > div:nth-of-type(2) > span > input").value = request.number;
        } else if (request.dropbox_code) {
            document.querySelector("#phone-code").value = request.code;
            document.querySelector("html > body > div > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)").click();
            setTimeout(() => {
                document.querySelector("html > body > div > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)").click();
                setTimeout()
            }, 2000);

        } else if (request.dropbox_start_sms) {
            document.querySelector("#use-sms").click();
            document.querySelector("html > body > div > div > div > div > div > div:nth-of-type(3) > button").click();
            setTimeout(() => {
                document.querySelector("html > body > div > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)").click();
                setTimeout(() => {
                    document.querySelector("html > body > div > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)").click();
                    setTimeout(() => {}, 2000);
                }, 2000);
            }, 2000);
        } else if (request.dropbox_start_totp) {
            document.querySelector("#use-app").click();
            document.querySelector("html > body > div > div > div > div > div > div:nth-of-type(3) > button").click();
            setTimeout(() => {
                document.querySelector("html > body > div > div > div > div > div > div:nth-of-type(2) > div > ul > li:nth-of-type(2) > button").click();
                chrome.runtime.sendMessage({
                    dropbox_get_code: true,
                    totp_secret: document.querySelector("#secret-div").textContent.replace(/\s+/g, '')
                });
                document.querySelector("html > body > div > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)").click();
            }, 2000);
        }
    }
);
if (window.location.href.includes("dropbox.com/account/security")) {
    document.querySelector("html > body > div:nth-of-type(4) > div > div > div > div:first-of-type > div > div > div > div > div:nth-of-type(3) > div > div:nth-of-type(2) > label > input").click();
    document.querySelector("html > body > div > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2) > span").click();
    if (document.querySelector("#password") !== null) {
        chrome.runtime.sendMessage({
            dropbox_get_password: true,
        });
    }
} else if (window.location.href.includes("login")) {
    chrome.runtime.sendMessage({
        dropbox_get_credentials: true,
    });
}