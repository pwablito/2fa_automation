console.log("zoom.js injected");

function change(field, value) {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: false, key: '', char: '' }));
}

function is_showing(element) {
    return window.getComputedStyle(element)['display'] !== 'none';
}

chrome.runtime.onMessage.addListener(
    function(request, _) {
        if (request.zoom_email) {

        } else if (request.zoom_password) {
            if (is_showing(document.querySelector("html > body > div:first-of-type > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(3) > div > div > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(4) > div > div:nth-of-type(3) > div > div > div:nth-of-type(2)"))) {
                document.querySelector("html > body > div:first-of-type > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(3) > div > div > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(4) > div > div:nth-of-type(3) > div > div > div:nth-of-type(2) > div > div > div > input").value = request.password;
                document.querySelector("html > body > div:first-of-type > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(3) > div > div > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(4) > div > div:nth-of-type(3) > div > div > div:nth-of-type(2) > div > footer > span > button:first-of-type").click();
                setTimeout(() => {
                    chrome.runtime.sendMessage({
                        zoom_get_type: true,
                    });
                }, 1000);
            } else if (is_showing(document.querySelector("html > body > div:first-of-type > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(3) > div > div > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(4) > div > div:nth-of-type(3) > div > div > div:nth-of-type(5)"))) {
                document.querySelector("html > body > div:first-of-type > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(3) > div > div > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(4) > div > div:nth-of-type(3) > div > div > div:nth-of-type(5) > div > div > div > input").value = request.password;
                document.querySelector("html > body > div:first-of-type > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(3) > div > div > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(4) > div > div:nth-of-type(3) > div > div > div:nth-of-type(5) > div > footer > span > button:first-of-type").click();

            }
        } else if (request.zoom_phone_number) {
            document.querySelector("html > body > div:first-of-type > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(3) > div > div > div:nth-of-type(2) > div > div > div:nth-of-type(2) > input").value = request.phone_number;

        } else if (request.zoom_code) {

        } else if (request.zoom_start_sms) {
            document.querySelector("html > body > div:first-of-type > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(3) > div > div > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(4) > div > div:nth-of-type(3) > div > div > div:first-of-type > div:nth-of-type(3) > div:nth-of-type(3) > button").click();

        } else if (request.zoom_start_totp) {

        }
    }
);

if (window.location.href.includes("signin")) {

} else if (window.location.href.includes("profile")) {
    document.querySelector("html > body > div:first-of-type > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(3) > div > div > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(4) > div > div:nth-of-type(3) > div > div > div:first-of-type > button").click();
    setTimeout(() => {
        if (document.querySelector("html > body > div:first-of-type > div:nth-of-type(3) > div:nth-of-type(3) > div:nth-of-type(3) > div > div > div:nth-of-type(2) > div:nth-of-type(2) > section:nth-of-type(4) > div > div:nth-of-type(3) > div > div > div:nth-of-type(2) > div > div > div > input") !== null) {
            chrome.runtime.sendMessage({
                zoom_get_password: true,
            });
        }
    }, 1000);
} else if (window.location.href.includes("mfa/index")) {
    document.querySelector("html > body > div:nth-of-type(4) > div > div:first-of-type > div > dl > dd:nth-of-type(226)").click();
    chrome.runtime.sendMessage({
        zoom_get_phone_number: true,
    })
}