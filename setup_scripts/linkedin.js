console.log("linkedin.js setup script injected");

chrome.runtime.onMessage.addListener(function(request, _) {
    if (request.linkedin_credentials) {
        document.querySelector("#username").value = request.username;
        document.querySelector("#password").value = request.password;
        document.querySelector("html > body > div > main > div:nth-of-type(2) > div:nth-of-type(1) > form").submit();
    } else if (request.linkedin_password) {
        document.querySelector("#verify-password").value = request.password;
        document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > div > div > div > section > div:nth-of-type(2) > span > form > div > button").click();
        setTimeout(() => {
            if (document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > div > div > div > form > ol > li:nth-of-type(3) > img") !== null) {
                chrome.runtime.sendMessage({
                    linkedin_get_code: true,
                    totp_url: document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > div > div > div > form > ol > li:nth-of-type(3) > img").src,
                });
            } else {
                chrome.runtime.sendMessage({
                    linkedin_get_code: true
                });
            }
        }, 2000);
    } else if (request.linkedin_start_totp) {
        document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > div > div > div > section > select").selectedIndex = 0;
        document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > div > div > div > section > div:nth-of-type(2) > button:nth-of-type(2)").click()
        setTimeout(() => {
            if (document.querySelector("#verify-password") !== null) {
                chrome.runtime.sendMessage({
                    linkedin_get_password: true,
                });
            } else {
                setTimeout(() => {
                    chrome.runtime.sendMessage({
                        linkedin_get_code: true,
                        totp_url: document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > div > div > div > form > ol > li:nth-of-type(3) > img").src,
                    });
                }, 2000);
            }
        }, 2000);
    } else if (request.linkedin_start_sms) {
        document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > div > div > div > section > select").selectedIndex = 1;
        document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > div > div > div > section > div:nth-of-type(2) > button:nth-of-type(2)").click()
        setTimeout(() => {
            if (document.querySelector("#verify-password") !== null) {
                chrome.runtime.sendMessage({
                    linkedin_get_password: true,
                });
            } else {
                document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > div > div > div > form > fieldset > ul > li > a").click();
            }
        }, 2000);
    } else if (request.linkedin_code) {
        console.log("Got code");
        document.querySelector("#enter-code").value = request.code;
        if (document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > div > div > div > form > div:nth-of-type(2) > button:nth-of-type(2)") !== null) {
            document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > div > div > div > form > div:nth-of-type(2) > button:nth-of-type(2)").click();
        } else {
            document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > div > div > div > form > div:nth-of-type(3) > button:nth-of-type(2)").click();
        }
        setTimeout(() => {
            if (document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > a > span:nth-of-type(2)").textContent === "On") {
                chrome.runtime.sendMessage({
                    linkedin_finished: true,
                });
            } else {
                chrome.runtime.sendMessage({
                    linkedin_error: true,
                    message: "Something went wrong",
                });
            }
        }, 2000);
    }
});
if (window.location.href.includes("linkedin.com/psettings/two-step-verification")) {
    setTimeout(() => {
        if (document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > a > span:nth-of-type(2)").textContent === "On") {
            chrome.runtime.sendMessage({
                linkedin_error: true,
                message: "Already setup",
            });
        } else {
            document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > div > div > p:nth-of-type(1) > button").click()
            chrome.runtime.sendMessage({
                linkedin_get_type: true,
            });
        }
    }, 2000);
} else if (window.location.href.includes("login-submit")) {
    document.querySelector("html > body > div > main > div > section > footer > form:nth-of-type(1) > button").click();
} else if (window.location.href.includes("login")) {
    chrome.runtime.sendMessage({
        linkedin_get_credentials: true,
    });
} else if (window.location.href.includes("psettings/phone/add")) {
    chrome.runtime.sendMessage({
        linkedin_get_phone: true,
    });
}