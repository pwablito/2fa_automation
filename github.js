console.log("github.js injected");

chrome.runtime.onMessage.addListener(
    function(request, _) {
        console.log("received message", request);
        if (request.github_credentials) {
            document.querySelector("#login_field").value = request.username;
            document.querySelector("#password").value = request.password;
            document.querySelector("#login > div.auth-form-body.mt-3 > form > div > input.btn.btn-primary.btn-block").click();
            chrome.runtime.sendMessage({
                github_logged_in: true
            })
        }
        if (request.github_phone_number) {
            document.querySelector("#number").value = request.number;
            document.querySelector("#two-factor > div > form > div > button").click();
            chrome.runtime.sendMessage({
                github_get_code: true
            });
        }
        if (request.github_code) {
            document.querySelector("#two-factor-code").value = request.code;
            document.querySelector("#two-factor > div > form > button").click();
            chrome.runtime.sendMessage({
                github_finished: true
            });
        }
        if (request.github_password) {
            document.querySelector("#sudo_password").value = request.password;
            document.querySelector("#login > form > div.Box-body.overflow-auto.auth-form-body > sudo-auth > sudo-password > div:nth-child(2) > button").click();
        }
    }
);

if (document.querySelector("#two-factor > div > div.border-top.pt-6.mt-6.clearfix > div.col-12.col-md-6.pl-md-3.float-left > form > button") != null) {
    //Initiate 2fa process (generate backup codes in github servers)
    document.querySelector("#two-factor > div > div.border-top.pt-6.mt-6.clearfix > div.col-12.col-md-6.pl-md-3.float-left > form > button").click();
} else if (document.querySelector("#js-pjax-container > div > form:nth-child(3) > button") !== null) {
    // Enable next button by clicking download button, then click next
    document.querySelector("#js-pjax-container > div > div > div.recovery-codes-saving-options > form > button").click();
    document.querySelector("#js-pjax-container > div > form:nth-child(3) > button").click();
} else if (document.querySelector("#sudo_password") !== null) {
    // Need "sudo" password (further authentication to change settings)
    chrome.runtime.sendMessage({
        github_get_password: true
    });
} else {
    // Check if signed in, this starts the automation
    chrome.runtime.sendMessage({
        github_logged_in: document.querySelector("#login_field") === null
    });
}