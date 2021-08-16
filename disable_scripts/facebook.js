console.log("facebook.js disable script injected");

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
                        facebook_get_phone: true,
                    });
                }
            }, 2000);
        } else if (request.facebook_credentials) {
            document.querySelector("#email").value = request.login;
            document.querySelector("#pass").value = request.password;
            document.querySelector("html > body > div:first-of-type > div:nth-of-type(2) > div:first-of-type > div > div > div > div:nth-of-type(2) > div > div:first-of-type > form > div:nth-of-type(2) > button").click();
        }
    }
);


setTimeout(() => {
    if (window.location.href.includes("security/2fac/settings")) {
        if (window.location.href.includes("?cquick=")) {
            // Inside iframe
            document.querySelector("html > body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div > a").click();
            setTimeout(() => {
                if (document.querySelector("html > body > div:nth-of-type(7) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(3) > span:nth-of-type(2) > div > div:nth-of-type(2) > button > div > div") != null) {
                    document.querySelector("html > body > div:nth-of-type(7) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(3) > span:nth-of-type(2) > div > div:nth-of-type(2) > button > div > div").click()
                    chrome.runtime.sendMessage({
                        facebook_finished: true
                    });
                } else if (document.querySelector("html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(3) > span:nth-of-type(2) > div > div:nth-of-type(2) > button > div > div") != null) {
                    document.querySelector("html > body > div:nth-of-type(6) > div:nth-of-type(2) > div > div > div > div > div > div > div:nth-of-type(3) > span:nth-of-type(2) > div > div:nth-of-type(2) > button > div > div").click();
                    chrome.runtime.sendMessage({
                        facebook_finished: true
                    });
                }

            }, 2000);

        } else {
            if (document.querySelector("body > div > div > div > div > div:nth-child(6) > div > div > div > div > iframe") != null) {
                // logged in- open iframe
                window.location = document.querySelector("body > div > div > div > div > div:nth-child(6) > div > div > div > div > iframe").src;
                console.log("Logged in, opening iframe");
            } else {}
        }



    } else if (window.location.href.includes("facebook.com/login/reauth.php")) {
        console.log("reauth asking");
        if (document.querySelector("html > body > div:first-of-type > div:first-of-type > div:first-of-type > div > form > div > div:nth-of-type(2) > table > tbody > tr:first-of-type > td > input") != null) {
            chrome.runtime.sendMessage({
                facebook_get_password: true
            });
        } else {
            window.location.href = document.querySelector("html > body > div:first-of-type > div > div:first-of-type > div > div:nth-of-type(3) > div > div > div:first-of-type > div:first-of-type > iframe").src;
        }
    }
}, 3000);