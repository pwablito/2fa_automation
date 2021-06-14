console.log("google.js setup script injected");

function getElementByXpath(doc, xpath) {
    return doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

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
        if (request.google_username) {
            document.querySelector("#identifierId").value = request.username;
            document.querySelector("#identifierNext > div > button").click();
            chrome.runtime.sendMessage({
                "google_get_password": true
            });
        } else if (request.google_phone_number) {
            document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > div > div > div > input").value = request.number;
            document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div").click();

            setTimeout(() => {
                if (document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > div > div > div > input") == null) {
                    chrome.runtime.sendMessage({
                        "google_get_code": true
                    })
                } else {
                    chrome.runtime.sendMessage({
                        google_get_phone_number: true,
                        message: "Try again with a different phone number"
                    })
                }
            }, 3000);
        } else if (request.google_code) {
            document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div > div > div > input").value = request.code;
            document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div").click()
            setTimeout(() => {
                if (document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div > div > div > input") != null) {
                    chrome.runtime.sendMessage({
                        google_get_code: true,
                        message: "Incorrect code"
                    })
                } else {
                    document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(2)").click();
                }
            }, 4000);
        } else if (request.google_password) {
            document.querySelector("#password > div > div > div > input").value = request.password;
            document.querySelector("#passwordNext > div > button").click();
            setTimeout(() => {
                if (document.querySelector("#password > div > div > div > input") != null) {
                    chrome.runtime.sendMessage({
                        google_get_password: true,
                        message: "Incorrect password"
                    })
                }
            }, 5000);
        } else if (request.google_start_backup) {
            document.querySelector("html > body > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:first-of-type > div > div:nth-of-type(3) > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(3) > div").click();
            setTimeout(() => {
                document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(3)").click();
                setTimeout(() => {
                    chrome.runtime.sendMessage({
                        google_get_totp_code: true,
                        totp_url: document.querySelector("html > body > div > div > div:nth-of-type(2) > span > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > img").src
                    });
                    document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(3)").click();
                }, 1500);
            }, 1500);
        } else if (request.google_totp_code) {
            document.querySelector("html > body > div > div > div:nth-of-type(2) > span > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div:first-of-type > div > div:first-of-type > input").value = request.code;
            document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(4)").click();
            setTimeout(() => {
                if (document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(5) > span > span") !== null &&
                    document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(5) > span > span").textContent === "Done") {
                    chrome.runtime.sendMessage({
                        google_finished: true,
                    });
                } else {
                    chrome.runtime.sendMessage({
                        google_error: true,
                        message: "Something went wrong",
                    })
                }
            }, 2000);
        }
    }
);

if (window.location.href.includes("myaccount.google.com/signinoptions/two-step-verification/enroll-welcome")) {
    if (document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div > div:nth-child(3) > div > div:nth-child(2) > div > div") != null) {
        document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div > div:nth-child(3) > div > div:nth-child(2) > div > div").click();
    } else {
        document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div").click()
    }
} else if (window.location.href.includes("accounts.google.com/signin/v2/challenge/pwd")) {
    chrome.runtime.sendMessage({
        "google_get_password": true
    });
} else if (window.location.href.includes("myaccount.google.com/signinoptions/two-step-verification/enroll")) {
    if (document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > div > div > div > input") != null) {
        chrome.runtime.sendMessage({
            "google_get_phone_number": true
        });
    }
} else if (window.location.href.includes("myaccount.google.com/signinoptions/two-step-verification?")) {
    chrome.runtime.sendMessage({
        "google_backup": true
    });
} else if (window.location.href.includes("myaccount.google.com/intro/security")) {
    document.querySelector("c-wiz > div > div:nth-child(2) > c-wiz > c-wiz > div > div:nth-child(3) > div > div > c-wiz > section > div > div > div > div > div > div > div > div:nth-child(4) > div > a").click();
} else if (window.location.href.includes("/identifier")) {
    chrome.runtime.sendMessage({
        "google_username": true
    });
} else if (window.location.href.includes("myaccount.google.com/security")) {
    window.location.href = "https://myaccount.google.com/signinoptions/two-step-verification/enroll-welcome";
} else if (window.location.href.includes("accounts.google.com/ServiceLogin/signinchooser")) {
    document.querySelector("#view_container > div > div > div:nth-child(2) > div > div > div > form > span > section > div > div > div > div > ul > li:nth-child(2) > div").click();
    setTimeout(() => {
        chrome.runtime.sendMessage({
            "google_get_username": true
        });
    }, 5000);
}