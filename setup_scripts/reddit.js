console.log("reddit.js setup script injected");

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
        if (request.reddit_credentials) {
            document.querySelector("#loginUsername").value = request.username;
            document.querySelector("#loginPassword").value = request.password;
            document.querySelector("html > body > div > main > div:first-of-type > div > div:nth-of-type(2) > form > fieldset:nth-of-type(5) > button").click();
            setTimeout(() => {
                if (document.querySelector("fieldset.AnimatedForm__field.m-required.login.hideable.m-invalid > div").textContent !== "") {
                    chrome.runtime.sendMessage({
                        reddit_get_credentials: true,
                        message: "Invalid credentials"
                    });
                }
            }, 2000);
        } else if (request.reddit_password) {
            change(document.querySelector('#password'), request.password);
            document.querySelector("html > body > div > div > div:nth-of-type(2) > main > form:first-of-type > fieldset:nth-of-type(2) > button").click();
            setTimeout(() => {
                if (document.querySelector("html > body > div > div > div:nth-of-type(2) > main > form:first-of-type > fieldset:first-of-type > div").textContent !== "") {
                    document.querySelector("html > body > div > div > div:nth-of-type(2) > main > form:first-of-type > fieldset:first-of-type > div").textContent = "";
                    chrome.runtime.sendMessage({
                        reddit_get_password: true,
                        message: "Incorrect password"
                    });
                } else {
                    chrome.runtime.sendMessage({
                        reddit_get_code: true,
                        totp_secret: document.querySelector("#canvas-fallback-content").textContent,
                    });
                }
            }, 2000);
        } else if (request.reddit_code) {
            change(document.querySelector("#otp"), request.code);
            document.querySelector("html > body > div > div > div:nth-of-type(2) > main > form:nth-of-type(2) > fieldset:nth-of-type(2) > button").click();
            setTimeout(() => {
                if (document.querySelector("html > body > div > div > div:nth-of-type(2) > main > form:nth-of-type(2) > fieldset:first-of-type > div").textContent !== "") {
                    document.querySelector("html > body > div > div > div:nth-of-type(2) > main > form:nth-of-type(2) > fieldset:first-of-type > div").textContent = "";
                    chrome.runtime.sendMessage({
                        reddit_get_code: true,
                        totp_secret: document.querySelector("#canvas-fallback-content").textContent,
                        message: "Invalid code"
                    })
                } else {
                    chrome.runtime.sendMessage({
                        reddit_finished: true
                    });
                }
            }, 2000);
        }
    }
);

if (window.location.href.includes("reddit.com/2fa/enable")) {
    if (document.querySelector("html > body > div > div > div:nth-of-type(2) > main > p > a") != null && document.querySelector("html > body > div > div > div:nth-of-type(2) > main > p > a").text === "log in") {
        document.querySelector("html > body > div > div > div:nth-of-type(2) > main > p > a").click();
    } else if (document.querySelector("#password") != null) {
        chrome.runtime.sendMessage({
            reddit_get_password: true
        });
    }
} else if (window.location.href.includes("reddit.com/login")) {
    chrome.runtime.sendMessage({
        reddit_get_credentials: true,
    });
}