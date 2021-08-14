console.log("github.js disable script injected");


chrome.runtime.onMessage.addListener(
    function(request, _) {
        if (request.github_credentials) {
            document.querySelector("#login_field").value = request.login;
            document.querySelector("#password").value = request.password;
            document.querySelector("html > body > div:nth-of-type(3) > main > div > div:nth-of-type(4) > form").submit();
        } else if (request.github_password) {
            document.querySelector("[type=password]").value = request.password;
            document.querySelector("[type=submit]").click()
        }
    }
);


if (window.location.href.includes("github.com/settings/security")) {
    if (document.querySelector("[id='js-pjax-container'] > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div > form > input:nth-of-type(1)")) {
        document.querySelector("[id='js-pjax-container'] > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div > form > input:nth-of-type(1)").click();
    } else {
        //already disabled
        chrome.runtime.sendMessage({
            github_error: true,
            message: "2FA already disabled",
        });
    }
} else if (window.location.href.includes("github.com/settings/two_factor_authentication")) {
    if (document.querySelector("[type=password]")) {
        console.log("request password");
        chrome.runtime.sendMessage({
            github_get_password: true,
        });
    }
} else { // either github.com/login or redirection to github.com
    console.log("In login");
    if (document.querySelector("[name=login]") != null) {
        chrome.runtime.sendMessage({
            github_log_in: true,
        });
    } else {
        console.log("Already signed in");
        window.location.href = "https://github.com/settings/security";
    }
}