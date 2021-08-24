console.log("twitter.js setup script injected");

function change(field, value) {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: false, key: '', char: '' }));
}

function getElementByXpath(doc, xpath) {
    return doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function timer(ms) { return new Promise(res => setTimeout(res, ms)); }

async function waitUntilPageLoad(document, maxWait) {
    for (let i = 0; i < maxWait * 10; i++) {
        if (document.readyState !== 'loading') { return true; }
        console.log(i);
        await timer(100); // then the created Promise can be awaited
    }
    return false;
}

async function waitUntilElementLoad(document, elemXPath, maxWait) {
    for (let i = 0; i < maxWait * 10; i++) {
        if (document.querySelector(elemXPath)) { return true; }
        console.log(i);
        await timer(100); // then the created Promise can be awaited
    }
    return false;
}

function exitScriptWithError() {
    // When debugging comment out code of this function. This will stop closing of background pages.
    chrome.runtime.sendMessage({
        twitter_error: true,
        message: "Sorry! Something went wrong. ",
        message_for_dev: window.location.href
    });
}

async function handleReceivedMessage(request) {
    if (request.twitter_credentials) {
        change(document.querySelector("input[name='session[username_or_email]'"), request.username);
        change(document.querySelector("input[name='session[password]'"), request.password);
        document.querySelector("div[data-testid='LoginForm_Login_Button']").click();
    }
    if (request.twitter_phone_number) {
        document.querySelector("#phone_number").value = request.number;
        document.querySelector("body > div.PageContainer > div > form > input.EdgeButton.EdgeButton--primary").click();
    }
    if (request.twitter_code) {
        document.querySelector("#code").value = request.code;
        //click button after entering SMS or TOTP code
        if (document.querySelector("input[type='submit']")) {
            document.querySelector("input[type='submit']").click();
        }
        // if (document.querySelector("html > body > div:nth-of-type(2) > div > form > input:nth-of-type(5)") != null) {
        //     document.querySelector("html > body > div:nth-of-type(2) > div > form > input:nth-of-type(6)").click();
        //     if(await waitUntilElementLoad(document, "html > body > div:nth-of-type(2) > div > form > span", 2)){
        //         window.location.href = "https://twitter.com/account/access?feature=two_factor_auth_totp_enrollment&initiated_in_iframe=true";
        //     }
        // } else {
        //     document.querySelector("body > div.PageContainer > div > form > input.EdgeButton.EdgeButton--primary.Button").click();
        // }
    }
    if (request.twitter_password) {
        change(document.querySelector("#password"), request.password);
        document.querySelector("input[type='submit']").click()
    }
    if (request.twitter_sms) {
        document.querySelectorAll("input[type='checkbox']")[0].click();
        // Wait for checkbox click to fully process
        console.log("checking if thing exists")
        await waitUntilElementLoad(document, "input[type='submit']", 1).then(function() {
            console.log("waiting");
            timer(2).then(window.location.href = "https://twitter.com/account/access?feature=two_factor_auth_sms_enrollment&initiated_in_iframe=true");
        })

    }
    if (request.twitter_totp) {
        document.querySelectorAll("input[type='checkbox']")[1].click();
        // Wait for checkbox click to fully process
        await waitUntilElementLoad(document, "input[type='submit']", 1).then(function() {
            console.log("waiting");
            timer(2).then(window.location.href = "https://twitter.com/account/access?feature=two_factor_auth_totp_enrollment&initiated_in_iframe=true");
        })
    }
}

chrome.runtime.onMessage.addListener(
    function(request, _) {
        handleReceivedMessage(request).then()
    }
);

(async() => {
    if (window.location.href.includes("twitter.com/account/access?feature=two_factor_auth_sms_enrollment")) {
        if (document.querySelector("#code") !== null) {
            //TODO add message saying the number the message was sent to.
            chrome.runtime.sendMessage({
                twitter_get_code: true
            });
        } else if (document.querySelector("#password") != null) {
            chrome.runtime.sendMessage({
                twitter_get_password: true
            });
        } else if (document.querySelector("#phone_number") !== null) {
            chrome.runtime.sendMessage({
                twitter_logged_in: true
            });
        } else if (document.querySelector("input[type='submit']") != null) {
            console.log(" Not sure what this page is doing");
            document.querySelector("input[type='submit']").click()
        } else {
            location.reload();
        }
    } else if (window.location.href.includes("twitter.com/account/access?feature=two_factor_auth_totp_enrollment")) {
        if (document.querySelector("#password") != null) {
            chrome.runtime.sendMessage({
                twitter_get_password: true
            });
        } else if (document.querySelector("#qrcodetext") != null) {
            chrome.runtime.sendMessage({
                twitter_get_code: true,
                type: "totp",
                totp_seed: document.querySelector("#qrcodetext").value,
            });
            window.location.href = "https://twitter.com/account/access?feature=two_factor_auth_totp_enrollment&lang=en&initiated_in_iframe=true&totp_page=verify";
        } else if (document.querySelector("input[type='submit']")) {
            document.querySelector("input[type='submit']").click()
        }
    } else if (window.location.href.includes("twitter.com/i/bouncer/static?view=two_factor_sms_exit") || window.location.href.includes("twitter.com/i/bouncer/static?view=two_factor_totp_exit")) {
        chrome.runtime.sendMessage({
            twitter_finished: true,
            twitter_backup_code: document.querySelector(".TextGroup-blue-larger").textContent
        });
    } else if (window.location.href.includes("twitter.com/login")) {
        chrome.runtime.sendMessage({
            twitter_logged_in: false
        });
    } else if (window.location.href.includes("twitter.com/settings/account/login_verification") && !window.location.href.includes("enrollment")) {
        console.log(window.location.href);
        chrome.runtime.sendMessage({
            twitter_get_method: true
        });
    } else if (window.location.href.includes("twitter.com/home")) {
        window.location.href = "https://twitter.com/settings/account/login_verification/enrollment";
    }
})();