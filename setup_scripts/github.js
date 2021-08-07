console.log("github.js setup script injected");

function change(field, value) {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: false, key: '', char: '' }));
}

function rafAsync() {
    return new Promise(resolve => {
        requestAnimationFrame(resolve); //faster than set time out
    });
}

function checkElement(selector) {
    if (document.querySelector(selector) === null) {
        return rafAsync().then(() => checkElement(selector));
    } else {
        return Promise.resolve(true);
    }
}


chrome.runtime.onMessage.addListener(
    function(request, _) {
        if (request.github_credentials) {
            document.querySelector("[name=login]").value = request.username;
            document.querySelector("[name=password]").value = request.password;
            document.querySelector("[id='login'] > div:nth-of-type(4) > form > div > input:nth-of-type(12)").click();
            setTimeout(() => {
                window.location.href = "https://github.com/settings/two_factor_authentication/setup/intro";
            }, 500);
            // window.location.href = "https://github.com/settings/two_factor_authentication/setup/intro";
        } else if (request.github_phone_number) {
            change(document.querySelector("[name=number]"), request.number);
            // document.querySelector("[name=number]").value = request.number;
            document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > two-factor-setup-verification > div:nth-of-type(2) > form > div > div:nth-of-type(3) > button").click();
            // document.querySelector("#two-factor > div > form > div > button").click();
            chrome.runtime.sendMessage({
                github_get_code: true
            });
        } else if (request.github_code) {
            // Entering code
            change(document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > two-factor-setup-verification > div:nth-of-type(1) > form > div > div:nth-of-type(3) > input"), request.code);            
            setTimeout(() => {
                document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(3) > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > two-factor-setup-recovery-codes > div > form:nth-of-type(1) > button:nth-of-type(1)").click();
                setTimeout(() => {
                    document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(3) > div > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(3)").click();
                    document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(4) > div > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(3)").click();
                    chrome.runtime.sendMessage({
                        github_finished: true
                    });
                }, 1000);
            }, 1000);
            
            // checkElement("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(3) > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > two-factor-setup-recovery-codes > div > form:nth-of-type(1) > button:nth-of-type(1)")
            // .then((element) => { // downloading recovery code
            //     document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(3) > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > two-factor-setup-recovery-codes > div > form:nth-of-type(1) > button:nth-of-type(1)").click();
            //     console.log("downloaded codes");
            //     setTimeout(() => {
            //         document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(3) > div > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(3)").click();
            //         // document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(4) > div > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(3)").click();
            //         // chrome.runtime.sendMessage({
            //         //     github_finished: true
            //         // });
            //     }, 2000);
                
            // });
            // checkElement("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(4) > div > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(3)")
            // .then((element) => { // clicking done button
            //     console.log("click on Done button");
            //     document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(4) > div > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(3)").click();
            //     chrome.runtime.sendMessage({
            //         github_finished: true
            //     });
            // });
        } else if (request.github_password) {
            document.querySelector("#sudo_password").value = request.password;
            document.querySelector("#login > form > div.Box-body.overflow-auto.auth-form-body > sudo-auth > sudo-password > div:nth-child(2) > button").click();
        } else if (request.github_start_sms) {
            document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(1) > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(3) > two-factor-setup-type-selection > form > div:nth-of-type(2) > label > span:nth-of-type(1) > input").click();
            document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(1) > div > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(3)").click();
            chrome.runtime.sendMessage({
                github_get_phone_number: true,
            });
        }  else if (request.github_start_totp) { 
            document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(1) > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(3) > two-factor-setup-type-selection > form > div:nth-of-type(1) > label > span:nth-of-type(1) > input").click();
            document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(1) > div > div:nth-of-type(2) > div:nth-of-type(2) > button:nth-of-type(3)").click()
            setTimeout(() => {
                chrome.runtime.sendMessage({
                    github_get_code: true,
                    totp_secret: document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > two-factor-setup-verification > div:nth-of-type(1) > form > div > div:nth-of-type(1) > details > details-dialog > div:nth-of-type(2)").textContent.replace(/\s+/g, '')
                });
            }, 1000);
            // document.querySelector("html > body > div:nth-of-type(15) > div > div > div > div > div:nth-of-type(3) > button").click();
            // checkElement("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > two-factor-setup-verification > div:nth-of-type(1) > form > div > div:nth-of-type(1) > details > summary")
            // .then((element) => {
            //     document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > two-factor-setup-verification > div:nth-of-type(1) > form > div > div:nth-of-type(1) > details > summary").click();
            //     console.log("click to get text QR");
            // });
            
            // checkElement("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > two-factor-setup-verification > div:nth-of-type(1) > form > div > div:nth-of-type(1) > details > details-dialog > div:nth-of-type(2)")
            // .then((element) => {
            //     console.log("qr code sent to extension");
            //     console.log(document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > two-factor-setup-verification > div:nth-of-type(1) > form > div > div:nth-of-type(1) > details > details-dialog > div:nth-of-type(2)").textContent);
            //     chrome.runtime.sendMessage({
            //         github_get_code: true,
            //         totp_secret: document.querySelector("[id='two-factor'] > div > single-page-wizard > div:nth-of-type(2) > single-page-wizard-step:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(2) > two-factor-setup-verification > div:nth-of-type(1) > form > div > div:nth-of-type(1) > details > details-dialog > div:nth-of-type(2)").textContent.replace(/\s+/g, '')
            //     });
            // });
            
        }
    }
);

// if (window.location.href.includes("github.com/sessions/two-factor")) {
//     chrome.runtime.sendMessage({
//         github_error: true,
//         message: "2FA already set up",
//     });
// } else

 if (window.location.href.includes("settings/two_factor_authentication/setup")) {
    chrome.runtime.sendMessage({
        github_get_type: true,
    });
} else { // either github.com/login or redirection to github.com
    console.log("In login");
    if (document.querySelector("[name=login]") != null) {
        chrome.runtime.sendMessage({
            github_log_in: true,
        });
    } else {
        console.log("Already signed in");
        window.location.href = "https://github.com/settings/two_factor_authentication/setup/intro";
    } 
}
// else if (document.querySelector("#two-factor > div > div.border-top.pt-6.mt-6.clearfix > div.col-12.col-md-6.pl-md-3.float-left > form > button") != null) {
//     //Initiate 2fa process (generate backup codes in github servers)
//     document.querySelector("#two-factor > div > div.border-top.pt-6.mt-6.clearfix > div.col-12.col-md-6.pl-md-3.float-left > form > button").click();
// } else if (document.querySelector("#js-pjax-container > div > form:nth-child(3) > button") !== null) {
//     // Enable next button by clicking download button, then click next
//     document.querySelector("#js-pjax-container > div > div > div.recovery-codes-saving-options > form > button").click();
//     document.querySelector("#js-pjax-container > div > form:nth-child(3) > button").click();
// } else if (document.querySelector("#sudo_password") !== null) {
//     // Need "sudo" password (further authentication to change settings)
//     chrome.runtime.sendMessage({
//         github_get_password: true
//     });
// } else {
//     // Check if signed in, this starts the automation
//     chrome.runtime.sendMessage({
//         github_logged_in: document.querySelector("#login_field") === null
//     });
// }