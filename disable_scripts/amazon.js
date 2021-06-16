console.log("amazon.js disable script injected");


chrome.runtime.onMessage.addListener(
    function(request, _) {
        if (request.amazon_code) {
            document.querySelector().value = request.code;
            // Click submit button
        }
    }
);


if (window.location.href.includes("amazon.com/a/settings/approval")) {
    document.querySelector("#disable-button").click();
    setTimeout(() => {
        document.querySelector("#remove-devices-checkbox-input").click();
        document.querySelector("#confirm-disable-dialog-modal-submit").click();
    }, 1000);
} else if (window.location.href.includes("signin")) {
    chrome.runtime.sendMessage({
        amazon_get_credentials: true,
    });
}