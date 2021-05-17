console.log("twitter.js injected");

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
    async function(request, _) {
        if (request.twitter_credentials) {
            change(getElementByXpath(document, "/html/body/div/div/div/div[2]/main/div/div/div[2]/form/div/div[1]/label/div/div[2]/div/input"), request.username);
            change(getElementByXpath(document, "/html/body/div/div/div/div[2]/main/div/div/div[2]/form/div/div[2]/label/div/div[2]/div/input"), request.password);
            getElementByXpath(document, "/html/body/div/div/div/div[2]/main/div/div/div[2]/form/div/div[3]/div").click();
        }
        if (request.twitter_phone_number) {
            document.querySelector("#phone_number").value = request.number;
            document.querySelector("body > div.PageContainer > div > form > input.EdgeButton.EdgeButton--primary").click();
        }
        if (request.twitter_code) {
            document.querySelector("#code").value = request.code;
            document.querySelector("body > div.PageContainer > div > form > input.EdgeButton.EdgeButton--primary.Button").click();
        }
        if (request.twitter_password) {
            document.querySelector("#password").value = request.password;
            getElementByXpath(document, "/html/body/div[2]/div/form/input[6]").click();
        }
    }
);

// Check if signed in, this starts the automation

if (window.location.href.includes("twitter.com/account/access?feature=two_factor_auth_sms_enrollment")) {
    if (document.querySelector("#code") !== null) {
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
    } else if (document.querySelector("body > div.PageContainer > div > div.ButtonCenter > form > input.EdgeButton.EdgeButton--primary.Button") != null) {
        document.querySelector("body > div.PageContainer > div > div.ButtonCenter > form > input.EdgeButton.EdgeButton--primary.Button").click();
    } else {
        location.reload();
    }
} else if (window.location.href.includes("twitter.com/i/bouncer/static?view=two_factor_sms_exit&lang=en")) {
    chrome.runtime.sendMessage({
        twitter_finished: true
    });
} else if (window.location.href.includes("twitter.com/login")) {
    chrome.runtime.sendMessage({
        twitter_logged_in: false
    });
} else if (window.location.href.includes("twitter.com/settings/account/login_verification")) {
    // Click the checkbox to allow the iframe to load
    setTimeout(async() => {
        document.querySelector("html > body > div > div > div > div:nth-of-type(2) > main > div > div > div > section:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div > div > label > div > div:nth-of-type(2) > input").click();
        // Wait for checkbox click to fully process
        setInterval(() => {
            window.location.href = "https://twitter.com/account/access?feature=two_factor_auth_sms_enrollment&initiated_in_iframe=true";
        }, 2000);
    }, 2000);
} else if (window.location.href.includes("twitter.com/home")) {
    window.location.href = "https://twitter.com/settings/account/login_verification/enrollment";
}