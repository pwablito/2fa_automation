
console.log("google.js setup script injected");

function timer(ms) { return new Promise(res => setTimeout(res, ms)); }

// maxWait is in seconds
async function waitUntilPageLoad(document,maxWait) {
    for (let i = 0; i < maxWait*10; i++) {
        if( document.readyState !== 'loading' ) { return true;}
        console.log(i);
        await timer(100); // then the created Promise can be awaited
    }
    return false;
}

async function waitUntilElementLoad(document, elemXPath,  maxWait) {
    for (let i = 0; i < maxWait*10; i++) {
        if(document.querySelector(elemXPath)) { return true;}
        console.log(i);
        await timer(100); // then the created Promise can be awaited
    }
    return false;
}


async function handleReceivedMessage(request) {
    if (request.google_username) {
        document.querySelector("[type=email]").value = request.username;
        document.querySelector("#identifierNext > div > button").click();
        chrome.runtime.sendMessage({
            "google_get_password": true
        });
    } else if (request.google_password) {
        document.querySelector("[type=password]").value = request.password;
        document.querySelector("#passwordNext > div > button").click();
        setTimeout(() => {
            if (document.querySelector("#password > div > div > div > input") != null) {
                chrome.runtime.sendMessage({
                    google_get_password: true,
                    message: "Incorrect password"
                })
            }
        }, 5000);
    } else if (request.google_phone_number) {
        document.querySelector("[type=tel]").value = request.number;
        let phoneNumberError =document.querySelector("html > body > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:nth-of-type(3) > div:nth-of-type(1) > div > div:nth-of-type(1) > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2)");
        document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div").click();
        let textCodeInputXPath = "c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > div > div > div > input";
        // let textCodeInput = document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > div > div > div > input");
        await timer(1000);
        console.log("1"), phoneNumberError.innerHTML;
        if (phoneNumberError.innerHTML != "") {
            chrome.runtime.sendMessage({
                google_get_phone_number: true,
                message: phoneNumberError.innerHTML
            });
            console.log("2");
        } else if (await waitUntilElementLoad(document, textCodeInputXPath, 1)) {
            chrome.runtime.sendMessage({
                "google_get_code": true,
            });
            console.log("3");
        }
    } else if (request.google_code) {
        let codeInput = document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div > div > div > input");
        codeInput.value = request.code;
        document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div").click()
        let codeErrorXPath ="html > body > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:nth-of-type(3) > div:nth-of-type(1) > div > div:nth-of-type(1) > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2)";
        let codeError = document.querySelector(codeErrorXPath);
        console.log("A");
        if (await waitUntilElementLoad(document, codeErrorXPath , 0.5) && codeError.innerHTML != "") {
            chrome.runtime.sendMessage({
                google_get_code: true,
                message: codeError.innerHTML
            });
            console.log("B");
        } else {
            console.log("C");
            document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(2)").click();
        }
    } else if (request.google_start_backup) {
        // document.querySelector("html > body > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:nth-of-type(1) > div:nth-of-type(12) > div:nth-of-type(2) > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(3) > div").click();
        //     setTimeout(() => {
        //         document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(3)").click();
        //         setTimeout(() => {
        //             chrome.runtime.sendMessage({
        //                 google_get_totp_code: true,
        //                 totp_url: document.querySelector("html > body > div > div > div:nth-of-type(2) > span > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > img").src
        //             });
        //             document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(3)").click();
        //         }, 1500);
        //     }, 1500);

        document.querySelector("html > body > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:nth-of-type(1) > div:nth-of-type(12) > div:nth-of-type(2) > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(3) > div").click();
        let popUpElemNextButtonXPath = "html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(3)";
        if (await waitUntilElementLoad(document, popUpElemNextButtonXPath, 2)) {
            for (let i = 0; i < 20; i++) {
                    if(document.querySelector(popUpElemNextButtonXPath).click()) {
                        await timer(100); // 100 ms delay. Waiting for the button to be clickable
                        break;
                    }
            }
        }
        let qrCodeXPath = "html > body > div > div > div:nth-of-type(2) > span > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > img";
        if (await waitUntilElementLoad(document, qrCodeXPath, 2)) {
            document.querySelector(popUpElemNextButtonXPath).click();
            chrome.runtime.sendMessage({
                google_get_totp_code: true,
                totp_url: document.querySelector(qrCodeXPath).src
            });
            document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(3)").click();
        }
    } else if (request.google_totp_code) {
        document.querySelector("html > body > div > div > div:nth-of-type(2) > span > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div:first-of-type > div > div:first-of-type > input").value = request.code;
        document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(4)").click();

        await timer(1000);
        let codeErrorXPath = "html > body > div:nth-of-type(12) > div > div:nth-of-type(2) > span > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div:nth-of-type(2) > div:nth-of-type(2)";
        let codeError = document.querySelector(codeErrorXPath);
        if (await waitUntilElementLoad(document, codeErrorXPath , 0.5) && codeError.innerHTML != "") {
            chrome.runtime.sendMessage({
                google_get_totp_code: true,
                message: codeError.innerHTML
            });
        } else {
            if (document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(5) > span > span") !== null &&
                document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(5) > span > span").textContent === "Done") {
                chrome.runtime.sendMessage({
                    google_finished: true,
                });
            } else {
                chrome.runtime.sendMessage({
                    google_error: true,
                    message: "Something went wrong",
                })
            }                
        }
    }
}


chrome.runtime.onMessage.addListener(
    function(request, _) {
        handleReceivedMessage(request).then();
    }
);

// if (window.location.href.includes("myaccount.google.com/signinoptions/two-step-verification/enroll-welcome")) {
//     if (document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div > div:nth-child(3) > div > div:nth-child(2) > div > div") != null) {
//         document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div > div:nth-child(3) > div > div:nth-child(2) > div > div").click();
//     } else {
//         document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div").click()
//     }
// } else if (window.location.href.includes("accounts.google.com/signin/v2/challenge/pwd")) {
//     chrome.runtime.sendMessage({
//         "google_get_password": true
//     });
// } else if (window.location.href.includes("myaccount.google.com/signinoptions/two-step-verification/enroll")) {
//     if (document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > div > div > div > input") != null) {
//         chrome.runtime.sendMessage({
//             "google_get_phone_number": true
//         });
//     }
// } else if (window.location.href.includes("myaccount.google.com/signinoptions/two-step-verification?")) {
//     chrome.runtime.sendMessage({
//         "google_backup": true
//     });
// } else if (window.location.href.includes("myaccount.google.com/intro/security")) {
//     document.querySelector("c-wiz > div > div:nth-child(2) > c-wiz > c-wiz > div > div:nth-child(3) > div > div > c-wiz > section > div > div > div > div > div > div > div > div:nth-child(4) > div > a").click();
// } else if (window.location.href.includes("/identifier")) {
//     chrome.runtime.sendMessage({
//         "google_get_username": true
//     });
// } else if (window.location.href.includes("myaccount.google.com/security")) {
//     window.location.href = "https://myaccount.google.com/signinoptions/two-step-verification/enroll-welcome";
// } else if (window.location.href.includes("accounts.google.com/ServiceLogin/signinchooser")) {
//     document.querySelector("#view_container > div > div > div:nth-child(2) > div > div > div > form > span > section > div > div > div > div > ul > li:nth-child(2) > div").click();
//     setTimeout(() => {
//         chrome.runtime.sendMessage({
//             "google_get_username": true
//         });
//     }, 5000);
// }

// else if (window.location.href.includes("signinchooser")) {
//     // In case all the accounts are logged out and google redirects to choose account. We redirect to select a new account always. 
//     let UseAnotherAccountButton = document.querySelector("#view_container > div > div > div:nth-of-type(2) > div > div:nth-of-type(1) > div > form > span > section > div > div > div > div > ul > li:nth-of-type(3) > div").click();
//     if( document.readyState !== 'loading' ) { UseAnotherAccountButton.click();
//     } else {
//         document.addEventListener('DOMContentLoaded', function(){UseAnotherAccountButton.click();});
//     }
// }else { // either google.com/signin or redirection to google.com
//     if (window.location.href == "https://google.com" || window.location.href.includes("signin"))
//     console.log("In login");
//     if (document.querySelector("[type=email]") != null) {
//         chrome.runtime.sendMessage({
//             google_get_username: true,
//         });
//     } else {
//         console.log("Already signed in");
//         window.location.href = "https://github.com/settings/two_factor_authentication/setup/intro";
//     } 
// }

(async () => {
    try {
        if (window.location.href.includes("https://myaccount.google.com/")) {
            console.log("Signed in");
            await waitUntilPageLoad(document, 3);
            if (window.location.href.includes("myaccount.google.com/signinoptions/two-step-verification")) { 
                // 2FA is already enabled
                if (document.querySelector("html > body > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:nth-of-type(1) > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > div > div")) {
                    chrome.runtime.sendMessage({
                        "google_backup": true,
                        "message": "2FA is already enabled on this account"
                    });
                }
                // Get started page
                else if (document.querySelector("#yDmH0d > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:nth-of-type(3) > div:nth-of-type(2) > div > div")) {
                    document.querySelector("#yDmH0d > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:nth-of-type(3) > div:nth-of-type(2) > div > div").click();
                    await waitUntilElementLoad(document, "[type=tel]", 2);
                }
                if (document.querySelector("[type=tel]")) { // phone number fill page
                    chrome.runtime.sendMessage({
                        "google_get_phone_number": true
                    });
                } 
            } else {
                window.location.href = "https://myaccount.google.com/signinoptions/two-step-verification/enroll-welcome";
            }
        } else if (window.location.href.includes("signinchooser")) {
            // In case all the accounts are logged out and google redirects to choose account. We redirect to select a new account always. 
            let UseAnotherAccountButtonXPath = "html > body > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div > div:nth-of-type(2) > div > div > div:nth-of-type(2) > div > div:nth-of-type(1) > div > form > span > section > div > div > div > div:nth-of-type(1) > ul > li:nth-of-type(2) > div > div > div:nth-of-type(2)";
            if(await waitUntilElementLoad(document, UseAnotherAccountButtonXPath, 2)) {
                document.querySelector(UseAnotherAccountButtonXPath).click();
            }
        } else if (window.location.href.includes("/signin/") || window.location.href.includes("/identifier")) {
            if (document.querySelector("[type=email]") && document.querySelector("[type=email]").value == "") {
                chrome.runtime.sendMessage({
                    "google_get_username": true
                });
            } else if (document.querySelector("[type=password]")) {
                chrome.runtime.sendMessage({
                    "google_get_password": true
                });
            } else { 
                chrome.runtime.sendMessage({
                    google_error: true,
                    message: "Something went wrong",
                    message_for_dev : window.location.href
                });
            }
        }
    } catch (e) {
        // Deal with the fact the chain failed
    }
})();