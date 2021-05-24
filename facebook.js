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
            setTimeout(() => {
                if (document.querySelector("html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2) > span > input") != null) {
                    chrome.runtime.sendMessage({
                        facebook_get_phone_number: true,
                        message: "Invalid phone number",
                    });
                } else {
                    chrome.runtime.sendMessage({
                        facebook_get_code: true,
                    });
                }
            }, 5000); // This one takes longer to load- I think the server has to send the message before it returns
        } else if (request.facebook_password) {
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
        } else if (request.facebook_sms_code) {
            if (request.code.length != 6) {
                chrome.runtime.sendMessage({
                    facebook_get_code: true,
                    message: "Invalid code"
                });
            } else {
                for (let index = 0; index < 6; index++) {
                    change(document.querySelector(`html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div > div > div:nth-of-type(2) > div > div > form > input:nth-of-type(${index + 1})`), request.code[index]);
                }
                setTimeout(() => {
                    document.querySelector("html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(3) > span:nth-of-type(2) > div > div > button").click()
                    chrome.runtime.sendMessage({
                        facebook_finished: true
                    });
                }, 500);
            }
        } else if (request.facebook_totp_code) {
            document.querySelector("html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(3) > span:nth-of-type(2) > div > div:nth-of-type(2) > button").click();
            setTimeout(() => {
                if (request.code.length != 6) {
                    chrome.runtime.sendMessage({
                        facebook_get_code: true,
                        message: "Invalid code"
                    });
                } else {
                    for (let index = 0; index < 6; index++) {
                        change(document.querySelector(`html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div > div > div:nth-of-type(2) > div > div > form > input:nth-of-type(${index + 1})`), request.code[index]);
                    }
                    setTimeout(() => {
                        document.querySelector("html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(3) > span:nth-of-type(2) > div > div > button").click()
                        chrome.runtime.sendMessage({
                            facebook_finished: true
                        });
                    }, 500);
                }
            }, 2000);
        } else if (request.facebook_credentials) {
            document.querySelector("#email").value = request.email;
            document.querySelector("#pass").value = request.password;
            document.querySelector("html > body > div:first-of-type > div:nth-of-type(2) > div:first-of-type > div > div > div > div:nth-of-type(2) > div > div:first-of-type > form > div:nth-of-type(2) > button").click();
        } else if (request.facebook_start_totp) {
            document.querySelector("html > body > div:first-of-type > div:first-of-type > div:first-of-type > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:first-of-type > div > div:nth-of-type(2) > a").click();
            setTimeout(() => {
                chrome.runtime.sendMessage({
                    facebook_get_code: true,
                    totp_url: document.querySelector("html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div > div:nth-of-type(2) > div:first-of-type > img").src
                });
            }, 4000);
        } else if (request.facebook_start_sms) {
            document.querySelector("body > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > a").click();
            // Wait for dialog to load, then decide what to do
            setTimeout(() => {
                if (document.querySelector("#ajax_password") != null) {
                    // Page is prompting for password
                    chrome.runtime.sendMessage({
                        facebook_get_password: true
                    });
                } else if (document.querySelector("html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2) > span > input") != null) {
                    // Page is prompting for phone number
                    chrome.runtime.sendMessage({
                        facebook_get_phone_number: true
                    });
                } else if (document.querySelector("html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div > div:nth-of-type(2) > div > div:nth-of-type(2)") != null) {
                    document.querySelector("html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(2) > div > div > div:nth-of-type(2) > div > div:last-of-type").click();
                    document.querySelector("html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(3) > span:nth-of-type(2) > div > div:nth-of-type(2) > button").click();
                    setTimeout(() => {
                        if (document.querySelector("#ajax_password") != null) {
                            chrome.runtime.sendMessage({
                                facebook_get_password: true
                            });
                        } else {
                            chrome.runtime.sendMessage({
                                facebook_get_phone_number: true,
                            });
                        }
                    }, 2000);
                }
            }, 3000);
        }
    }
);

setTimeout(() => {
    if (window.location.href === "https://www.facebook.com/") {
        // Sign in, then redirect to the security page
        chrome.runtime.sendMessage({
            facebook_get_credentials: true
        });
    } else if (window.location.href === "https://www.facebook.com/?sk=welcome") {
        window.location.href = "https://www.facebook.com/security/2fac/setup/intro";
    } else if (window.location.href.includes("facebook.com/security/2fac/setup/intro")) {
        if (document.querySelector("html > body > div:nth-of-type(2) > h1")) {
            if (document.querySelector("html > body > div:nth-of-type(2) > h1").textContent === "Sorry, something went wrong.") {
                window.location.href = "https://www.facebook.com"; // Go to sign in page
            }
        } else if (window.location.href.includes("?cquick=")) {
            // Inside iframe
            chrome.runtime.sendMessage({
                facebook_get_type: true,
            });
        } else {
            if (document.querySelector("body > div > div > div > div > div:nth-child(6) > div > div > div > div > iframe") != null) {
                // logged in- open iframe
                window.location = document.querySelector("body > div > div > div > div > div:nth-child(6) > div > div > div > div > iframe").src;
                console.log("Logged in, opening iframe");
            } else {}
        }
    } else if (window.location.href.includes("facebook.com/login/reauth.php")) {
        if (document.querySelector("html > body > div:first-of-type > div:first-of-type > div:first-of-type > div > form > div > div:nth-of-type(2) > table > tbody > tr:first-of-type > td > input") != null) {
            chrome.runtime.sendMessage({
                facebook_get_password: true
            });
        } else {
            window.location.href = document.querySelector("html > body > div:first-of-type > div > div:first-of-type > div > div:nth-of-type(3) > div > div > div:first-of-type > div:first-of-type > iframe").src;
        }
    }
}, 1000);