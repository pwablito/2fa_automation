
console.log("google.js setup script injected");

// maxWait is in seconds
function waitUntilPageLoad(document,maxWait) {
    for (let i = 0; i < maxWait *10; i++) {
        if( document.readyState !== 'loading' ) { return true;}
        setTimeout(() => {}, 100);
      }
      return false;
}

function waitUntilElementLoad(elem,  maxWait) {
    for (let i = 0; i < 50; i++) {
        if(elem) { return true;}
        setTimeout(() => {}, 100);
      }
      return false;
}


chrome.runtime.onMessage.addListener(
    function(request, _) {
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
            let textCodeInput = document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > div > div > div > input");
            setTimeout(() => {
                console.log("1"), phoneNumberError.innerHTML;
                if (phoneNumberError.innerHTML != "") {
                    chrome.runtime.sendMessage({
                        google_get_phone_number: true,
                        message: phoneNumberError.innerHTML
                    });
                    console.log("2");
                } else if (waitUntilElementLoad(textCodeInput, 1)) {
                    chrome.runtime.sendMessage({
                        "google_get_code": true,
                    });
                    console.log("3");
                }
            }, 1000); // waiting for the error message to get filled 
            
            // setTimeout(() => {
            //     if (document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div:nth-child(2) > div > div > div > input") == null) {
            //         chrome.runtime.sendMessage({
            //             "google_get_code": true
            //         })
            //     } else {
            //         chrome.runtime.sendMessage({
            //             google_get_phone_number: true,
            //             message: "Try again with a different phone number"
            //         })
            //     }
            // }, 3000);
        } else if (request.google_code) {
            let codeInput = document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div > div > div > input");
            codeInput.value = request.code;
            document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div").click()
            let codeError = document.querySelector("html > body > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:nth-of-type(3) > div:nth-of-type(1) > div > div:nth-of-type(1) > div > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2) > div > div:nth-of-type(2) > div:nth-of-type(2)");
            console.log("A");
            if (waitUntilElementLoad(codeError , 0.5) && codeError != "") {
                chrome.runtime.sendMessage({
                    google_get_code: true,
                    message: codeError.innerHTML
                });
                console.log("B");
            } else {
                console.log("C");
                document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(2)").click();
            }
            // setTimeout(() => {
            //     if (document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div > div > div > input") != null) {
            //         chrome.runtime.sendMessage({
            //             google_get_code: true,
            //             message: "Incorrect code"
            //         })
            //     } else {
            //         document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(2)").click();
            //     }
            // }, 4000);
        } else if (request.google_start_backup) {
            document.querySelector("html > body > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:nth-of-type(1) > div:nth-of-type(12) > div:nth-of-type(1) > div > div > div > div:nth-of-type(2) > div > div:nth-of-type(3) > div").click();
            let popUpElemNextButton = document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(3)");
            if (waitUntilElementLoad(popUpElemNextButton, 2)) {
                popUpElemNextButton.click();
            }
            let qrCode = document.querySelector("html > body > div > div > div:nth-of-type(2) > span > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > img")
            if (waitUntilElementLoad(qrCode, 2)) {
                popUpElemNextButton.click();
                chrome.runtime.sendMessage({
                    google_get_totp_code: true,
                    totp_url: qrCode.src
                });
                document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(3)").click();
            }
            // setTimeout(() => {
            //     document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(3)").click();
            //     setTimeout(() => {
            //         chrome.runtime.sendMessage({
            //             google_get_totp_code: true,
            //             totp_url: document.querySelector("html > body > div > div > div:nth-of-type(2) > span > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > img").src
            //         });
            //         document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(3)").click();
            //     }, 1500);
            // }, 1500);
        } else if (request.google_totp_code) {
            document.querySelector("html > body > div > div > div:nth-of-type(2) > span > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div:first-of-type > div > div:first-of-type > input").value = request.code;
            document.querySelector("html > body > div > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(4)").click();
            
            
            setTimeout(() => {
                let codeError = document.querySelector("html > body > div:nth-of-type(12) > div > div:nth-of-type(2) > span > div > div > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div > div:nth-of-type(2) > div:nth-of-type(2)");
                if (waitUntilElementLoad(codeError , 0.5) && codeError != "") {
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
            }, 1000);
        }
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


if (window.location.href.includes("https://myaccount.google.com/")) {
    console.log("Signed in");
    waitUntilPageLoad(document, 3);
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
            waitUntilElementLoad(document.querySelector("[type=tel]"), 2);
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
    let UseAnotherAccountButton = document.querySelector("#view_container > div > div > div:nth-of-type(2) > div > div:nth-of-type(1) > div > form > span > section > div > div > div > div > ul > li:nth-of-type(3) > div").click();
    if(waitUntilElementLoad(UseAnotherAccountButton, 2)) {
        UseAnotherAccountButton.click();
    }
} else if (window.location.href.includes("/signin/") || window.location.href.includes("/identifier")) {
    if (document.querySelector("[type=email]") && document.querySelector("[type=email]") == "") {
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