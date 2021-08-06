console.log("dropbox.js setup script injected");

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
            console.log("REQUESSTTTT", request);
            // document.querySelector("html > body > div:nth-of-type(12) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > div > form > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > input").value = request.username;
            // document.querySelector("html > body > div:nth-of-type(12) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > div > form > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2) > input").value = request.password;
            change(document.querySelector(`input[type="email"]`), request.username);
            change(document.querySelector(`input[type="password"]`), request.password);
            document.querySelector("html > body > div:nth-of-type(12) > div:nth-of-type(1) > div:nth-of-type(2) > div > div > div > div:nth-of-type(1) > div:nth-of-type(2) > div > div > form > div:nth-of-type(2) > button").click();
        } else if (request.dropbox_password) {
            change(document.querySelector(`input[type="password"]`), request.password);
            if(document.querySelector("html > body > div:nth-of-type(16) > div > div > div > div > div:nth-of-type(3) > button")){
                document.querySelector("html > body > div:nth-of-type(16) > div > div > div > div > div:nth-of-type(3) > button").click()
            }
            else if (document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button")) {
                document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button").click();
            }
            setTimeout(() => {
                let error = document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(2) > div > div > div:nth-of-type(1)");
                if (error !== null && error.textContent !== null) {
                    chrome.runtime.sendMessage({
                        dropbox_get_password: true,
                        message: error.textContent
                    });
                } else {
                    chrome.runtime.sendMessage({
                        dropbox_get_type: true,
                    });
                }
            }, 2000);
        } else if (request.dropbox_phone_number) {
            let twofawindow = document.querySelector("#twofactor-enter-phone")
            if(twofawindow.querySelector("input[type='text']")){
                change(twofawindow.querySelector("input[type='text']"),request.number )
            }
            else {
                change(document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(2) > div > div > div:nth-of-type(3) > div:nth-of-type(2) > span > input"), request.number);
            }           
            if(document.querySelector("button.dig-Button--primary")){
                document.querySelector("button.dig-Button--primary").click();
            } else {
                document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)").click();
            }
            chrome.runtime.sendMessage({
                dropbox_get_code: true,
            });
        } else if (request.dropbox_code) {
            change(document.querySelector("#phone-code"), request.code);
            if(document.querySelector("button.dig-Button--primary")){
                document.querySelector("button.dig-Button--primary").click();
            } else if(document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)")) {
                document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)").click();
            }
            setTimeout(() => {
                if(document.querySelector("button.dig-Button--primary")){
                    document.querySelector("button.dig-Button--primary").click();
                } else {
                    document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)").click();
                }
                setTimeout(() => {
                    if(document.querySelector("button.dig-Button--primary")){
                        document.querySelector("button.dig-Button--primary").click();
                    } else {
                        document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)").click();
                    }
                    setTimeout(() => {
                        if(document.querySelector("button.dig-Button--primary")){
                            document.querySelector("button.dig-Button--primary").click();
                        } else {
                            document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button").click();
                        }
                        setTimeout(() => {
                            chrome.runtime.sendMessage({
                                dropbox_finished: true,
                            });
                        }, 2000);
                    }, 2000);
                }, 2000);
            }, 2000);

        } else if (request.dropbox_start_sms) {
            document.querySelector("#use-sms").click();
            if(document.querySelector("button.dig-Button--primary")){
                document.querySelector("button.dig-Button--primary").click();
            } else {
                document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button").click();
            }
            chrome.runtime.sendMessage({
                dropbox_get_phone_number: true,
            });
        } else if (request.dropbox_start_totp) {
            document.querySelector("#use-app").click();
            if(document.querySelector("html > body > div:nth-of-type(16) > div > div > div > div > div:nth-of-type(3) > button")){
                document.querySelector("html > body > div:nth-of-type(16) > div > div > div > div > div:nth-of-type(3) > button").click()
            } else if(document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button")) {
                document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button").click();
            }
            setTimeout(() => {
                if(document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(2) > div > ul > li:nth-of-type(2) > button")){
                    document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(2) > div > ul > li:nth-of-type(2) > button").click();
                } else if(document.querySelector("html > body > div:nth-of-type(16) > div > div > div > div > div:nth-of-type(2) > div > ul > li:nth-of-type(2) > button")) {
                    document.querySelector("html > body > div:nth-of-type(16) > div > div > div > div > div:nth-of-type(2) > div > ul > li:nth-of-type(2) > button").click();
                }
                
                chrome.runtime.sendMessage({
                    dropbox_get_code: true,
                    totp_secret: document.querySelector("#secret-div").textContent.replace(/\s+/g, '')
                });
                if(document.querySelector("button.dig-Button--primary")){
                    document.querySelector("button.dig-Button--primary").click();
                }
                else if(document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)")){
                    document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)").click();
                } else if(document.querySelector("html > body > div:nth-of-type(16) > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)")){
                    document.querySelector("html > body > div:nth-of-type(16) > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)").click();
                }
            }, 2000);
        }
    }
);


if (window.location.href.includes("dropbox.com/account/security")) {
    setTimeout(() => {
        if(document.querySelector("html > body > div:nth-of-type(4) > div > div > div > div:nth-of-type(1) > div > div > div > div > div:nth-of-type(3) > div > div:nth-of-type(2) > label > input") != null){
            document.querySelector("html > body > div:nth-of-type(4) > div > div > div > div:nth-of-type(1) > div > div > div > div > div:nth-of-type(3) > div > div:nth-of-type(2) > label > input").click();
        } else if(document.querySelector("html > body > div:nth-of-type(4) > div > div > div > div:nth-of-type(1) > div > div > div > div > div:nth-of-type(4) > div > div:nth-of-type(2) > label > input") != null){
            document.querySelector("html > body > div:nth-of-type(4) > div > div > div > div:nth-of-type(1) > div > div > div > div > div:nth-of-type(4) > div > div:nth-of-type(2) > label > input").click();
        }
        setTimeout(() => {
            if (document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)")) {
                document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)").click()
            }
            if (document.querySelector("html > body > div:nth-of-type(16) > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)")) {
                document.querySelector("html > body > div:nth-of-type(16) > div > div > div > div > div:nth-of-type(3) > button:nth-of-type(2)").click()
            }
            if (document.querySelector(`input[type="password"]`) !== null) {
                chrome.runtime.sendMessage({
                    dropbox_get_password: true,
                });
            }
        }, 1000);
    }, 1000);
} else if (window.location.href.includes("login")) {
    chrome.runtime.sendMessage({
        dropbox_get_credentials: true,
    });
}