console.log("yahoo.js setup script injected");

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
        if (request.yahoo_email) {
            document.querySelector("#login-username").value = request.email;
            document.querySelector("#login-signin").click();
        } else if (request.yahoo_password) {
            document.querySelector("#login-passwd") = request.password;
            document.querySelector("#login-signin").click();
        } else if (request.yahoo_phone_number) {
            change(document.querySelector("#txtPhoneNumber"), request.number);
            setTimeout(() => {
                if (document.querySelector("#txtTsvVerifyCode") === null) {
                    chrome.runtime.sendMessage({
                        yahoo_error: true,
                        message: "Hit maximum attempts per day with this number"
                    });
                } else {
                    document.querySelector("#btnTsvSendCode").click();
                    chrome.runtime.sendMessage({
                        yahoo_get_code: true,
                    });
                }
            }, 2000);
        } else if (request.yahoo_code) {
            document.querySelector("#txtTsvVerifyCode").value = request.code;
            document.querySelector("#btnTsvVerifyCode").click();
        }
    }
);
if (window.location.href.includes("login.yahoo.com")) {
    if (document.querySelector("#login-username") !== null) {
        chrome.runtime.sendMessage({
            yahoo_get_email: true
        });
    } else if (window.location.href.includes("account/challenge/password")) {
        chrome.runtime.sendMessage({
            yahoo_get_password: true,
        })
    } else if (window.location.href.includes("myaccount/security")) {
        if (window.location.href.includes("two-step-verification")) {
            setTimeout(() => {
                document.querySelector("#btnTsvIntro").click();
                setTimeout(() => {
                    document.querySelector("#tsvPhone").click();
                    setTimeout(() => {
                        document.querySelector("#lnkBtnShowSendCodeForm").click();
                        chrome.runtime.sendMessage({
                            yahoo_get_phone_number: true,
                        });
                    }, 1000);
                }, 1000);
            }, 1000);
        } else {
            chrome.runtime.sendMessage({
                yahoo_finished: true,
            });
        }
    } else if (window.location.href.includes("phone-verify")) {
        chrome.runtime.sendMessage({
            yahoo_error: true,
            message: "2FA already enabled"
        });
    } else {
        chrome.runtime.sendMessage({
            yahoo_get_email: true,
        });
    }
}