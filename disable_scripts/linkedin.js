console.log("linkedin.js disable script injected");

chrome.runtime.onMessage.addListener(function(request, _) {
    if (request.linkedin_credentials) {
        document.querySelector("#username").value = request.username;
        document.querySelector("#password").value = request.password;
        document.querySelector("html > body > div > main > div:nth-of-type(2) > div:nth-of-type(1) > form").submit();
    } else if (request.linkedin_password) {
        document.querySelector("#verify-password").value = request.password;
        document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > div > div > p:nth-of-type(1) > span:nth-of-type(2) > form > div > button").click();
        setTimeout(() => {
            if (document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > a > span:nth-of-type(2)").textContent === "On") {
                chrome.runtime.sendMessage({
                    linkedin_error: true,
                    message: "Something went wrong"
                });
            } else {
                chrome.runtime.sendMessage({
                    linkedin_finished: true,
                });
            }
        }, 2000);
    }
});
if (window.location.href.includes("linkedin.com/psettings/two-step-verification")) {
    setTimeout(() => {
        if (document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > a > span:nth-of-type(2)").textContent === "On") {
            document.querySelector("html > body > div > main > div:nth-of-type(2) > div > div > ul > li:nth-of-type(7) > div > div > p:nth-of-type(1) > button").click();
            setTimeout(() => {
                if (document.querySelector("#verify-password") !== null) {
                    chrome.runtime.sendMessage({
                        linkedin_get_password: true,
                    });
                }
            }, 2000);
        } else {
            chrome.runtime.sendMessage({
                linkedin_error: true,
                message: "Already disabled",
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