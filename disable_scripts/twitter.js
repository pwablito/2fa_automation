console.log("twitter.js disable script injected");

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

chrome.runtime.onMessage.addListener(
    async function(request, _) {
        if (request.twitter_credentials) {
            change(getElementByXpath(document, "/html/body/div/div/div/div[2]/main/div/div/div[2]/form/div/div[1]/label/div/div[2]/div/input"), request.login);
            change(getElementByXpath(document, "/html/body/div/div/div/div[2]/main/div/div/div[2]/form/div/div[2]/label/div/div[2]/div/input"), request.password);
            getElementByXpath(document, "/html/body/div/div/div/div[2]/main/div/div/div[2]/form/div/div[3]/div").click();
        }
        if (request.twitter_phone_number) {
            // document.querySelector("#phone_number").value = request.phone;
            // document.querySelector("body > div.PageContainer > div > form > input.EdgeButton.EdgeButton--primary").click();
        }

        if (request.twitter_code) {
            document.querySelector("#challenge_response").value = request.code;
            if (document.querySelector("html > body > div:nth-of-type(2) > div > form > input:nth-of-type(9)") != null) {
                document.querySelector("html > body > div:nth-of-type(2) > div > form > input:nth-of-type(9)").click();
                // setTimeout(() => {
                //     if (document.querySelector("html > body > div:nth-of-type(2) > div > form > span") != null) {
                //         window.location.href = "https://twitter.com/account/access?feature=two_factor_auth_totp_enrollment&initiated_in_iframe=true";
                //     }
                // }, 1000)
            } else {
                // document.querySelector("body > div.PageContainer > div > form > input.EdgeButton.EdgeButton--primary.Button").click();
            }
        }
        if (request.twitter_password) {
            // document.querySelector("#password").value = request.password;
            // getElementByXpath(document, "/html/body/div[2]/div/form/input[6]").click();
        }
        if (request.twitter_sms) {
            // document.querySelector("html > body > div > div > div > div:nth-of-type(2) > main > div > div > div > section:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div > div > label > div > div:nth-of-type(2) > input").click();
            // // Wait for checkbox click to fully process
            // setTimeout(() => {
            //     window.location.href = "https://twitter.com/account/access?feature=two_factor_auth_sms_enrollment&initiated_in_iframe=true";
            // }, 2000);
        }
        if (request.twitter_totp) {
            // document.querySelector("html > body > div > div > div > div:nth-of-type(2) > main > div > div > div > section:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(3) > div > div > label > div > div:nth-of-type(2) > input").click();
            // // Wait for checkbox click to fully process
            // setTimeout(() => {
            //     window.location.href = "https://twitter.com/account/access?feature=two_factor_auth_totp_enrollment&initiated_in_iframe=true";
            // }, 2000);
        }
    }
);

(async() => {
    if (window.location.href.includes("twitter.com/account/access?feature=two_factor_auth_sms_enrollment")) {
        if (document.querySelector("#code") !== null) {
            // chrome.runtime.sendMessage({
            //     twitter_get_code: true
            // });
        } else if (document.querySelector("#password") != null) {
            // chrome.runtime.sendMessage({
            //     twitter_get_password: true
            // });
        } else if (document.querySelector("#phone_number") !== null) {
            // chrome.runtime.sendMessage({
            //     twitter_logged_in: true
            // });
        } else if (document.querySelector("body > div.PageContainer > div > div.ButtonCenter > form > input.EdgeButton.EdgeButton--primary.Button") != null) {
            // document.querySelector("body > div.PageContainer > div > div.ButtonCenter > form > input.EdgeButton.EdgeButton--primary.Button").click();
        } else {
            // location.reload();
        }
    } else if (window.location.href.includes("twitter.com/account/access?feature=two_factor_auth_totp_enrollment")) {
        // if (document.querySelector("#password") != null) {
        //     chrome.runtime.sendMessage({
        //         twitter_get_password: true
        //     });
        // } else if (document.querySelector("#qrcodetext") != null) {
        //     chrome.runtime.sendMessage({
        //         twitter_get_code: true,
        //         totp_otpauth_url: document.querySelector("#qrcodetext").value,
        //     });
        //     window.location.href = "https://twitter.com/account/access?feature=two_factor_auth_totp_enrollment&lang=en&initiated_in_iframe=true&totp_page=verify";
        // }
    } else if (window.location.href.includes("twitter.com/i/bouncer/static?view=two_factor_sms_exit&lang=en") || window.location.href.includes("twitter.com/i/bouncer/static?view=two_factor_totp_exit")) {
        // chrome.runtime.sendMessage({
        //     twitter_finished: true
        // });
    } else if (window.location.href.includes("twitter.com/login")) {
        chrome.runtime.sendMessage({
            twitter_get_credentials: true
        });
    } else if (window.location.href.includes("twitter.com/account/login_verification")) {
        console.log("Looking for code")
        if (document.querySelector("#challenge_response") != null) {
            chrome.runtime.sendMessage({
                twitter_get_code: true
            })
        }
    
    } else if (window.location.href.includes("twitter.com/settings/account/login_verification")) {
    
        if(await waitUntilElementLoad(document, "input[type='checkbox']", 2)){
            let checkboxes = document.querySelectorAll("input[type='checkbox']")
            if(checkboxes.length < 3){
                location.reload()
            } else {
                for(let i = 0; i < 3; i++){
                    if(checkboxes[i].checked){
                        checkboxes[i].click();
                        if(await waitUntilElementLoad(document, "div[role='dialog']", 2)){
                            document.querySelector("div[data-testid='confirmationSheetConfirm']").click();
                            if(await waitUntilElementLoad(document, "div[role='dialog']", 2)){
                                document.querySelector("div[data-testid='confirmationSheetConfirm']").click(); 
                            } 
                        }
                    } 
                }
                chrome.runtime.sendMessage({
                    twitter_finished: true
                });
            } 
        } 
    } else if (window.location.href.includes("twitter.com/home")) {}
    // window.location.href = "https://twitter.com/settings/account/login_verification/enrollment";
})();

