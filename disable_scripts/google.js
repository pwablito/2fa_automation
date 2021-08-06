console.log("google.js disable script injected");


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
        if (request.google_username) {
            document.querySelector("#identifierId").value = request.username;
            document.querySelector("#identifierNext > div > button").click();
            chrome.runtime.sendMessage({
                "google_get_password": true
            });
        } else if (request.google_code) {
            document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div > div > div > input").value = request.code;
            document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div").click()
            setTimeout(() => {
                if (document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div > div > div > div > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > div > div > div > div > input") != null) {
                    chrome.runtime.sendMessage({
                        google_get_code: true,
                        message: "Incorrect code"
                    })
                } else {
                    document.querySelector("c-wiz > div > div:nth-child(3) > c-wiz > div > div > div:nth-child(3) > div:nth-child(2) > div > div:nth-child(3) > div:nth-child(2)").click();
                }
            }, 4000);
        } else if (request.google_password) {
            document.querySelector("#password > div > div > div > input").value = request.password;
            document.querySelector("#passwordNext > div > button").click();
            setTimeout(() => {
                if (document.querySelector("#password > div > div > div > input") != null) {
                    chrome.runtime.sendMessage({
                        google_get_password: true,
                        message: "Incorrect password"
                    })
                }
            }, 5000);
        }
    }
);

if (window.location.href.includes("accounts.google.com/signin/v2/challenge/pwd")) {
    chrome.runtime.sendMessage({
        "google_get_password": true
    });
} else if (window.location.href.includes("/identifier")) {
    chrome.runtime.sendMessage({
        "google_username": true
    });
} else if (window.location.href.includes("myaccount.google.com/security")) {
    console.log("In myaccount.google.com/security");
    if( document.readyState !== 'loading' ) {
        console.log( 'document is already ready, just execute code here' );
        document.querySelector("html > body > c-wiz > div > div:nth-of-type(2) > c-wiz > c-wiz > div > div:nth-of-type(3) > div > div > c-wiz > section > div:nth-of-type(3) > div > div > div:nth-of-type(3) > div:nth-of-type(2) > a").click();
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            console.log( 'document was not ready, place code here' );
            document.querySelector("html > body > c-wiz > div > div:nth-of-type(2) > c-wiz > c-wiz > div > div:nth-of-type(3) > div > div > c-wiz > section > div:nth-of-type(3) > div > div > div:nth-of-type(3) > div:nth-of-type(2) > a").click();

        });
    }
} else if (window.location.href.includes("myaccount.google.com/signinoptions/two-step-verification?")) {
    function onReady() {
        if (document.querySelector("html > body > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:nth-of-type(1) > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > div > div")) {
            document.querySelector("html > body > c-wiz > div > div:nth-of-type(3) > c-wiz > div > div > div:nth-of-type(1) > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > div > div").click();
        } 
        checkElement("html > body > div:nth-of-type(11) > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(2)") //use whichever selector you want
        .then((element) => {
            console.info(element);
            document.querySelector("html > body > div:nth-of-type(11) > div > div:nth-of-type(2) > div:nth-of-type(3) > div > div:nth-of-type(2)").click()
            chrome.runtime.sendMessage({
                "google_finished": true
            });
        });
    }
    if( document.readyState !== 'loading' ) {
        onReady();
    } else {
        document.addEventListener('DOMContentLoaded', onReady);
    }
}