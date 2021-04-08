$(document).ready(() => {
    // Get settings if any
    chrome.runtime.sendMessage({ get_settings: true }, (response) => {
        console.log("Got response", response);
        if (response.auto_detect_setting) {
            $("#auto_detect_setting").click();
        }
        if (response.remember_accounts_setting) {
            $("#remember_accounts_setting").click();
        }
    });
    $("#auto_detect_setting").click(() => {
        // Change auto detection setting in storage
        chrome.runtime.sendMessage({ auto_detect_setting: true, set_to: $("#auto_detect_setting").is(":checked") }, (response) => {
            console.log(response);
        });
    });

    $("#remember_accounts_setting").click(() => {
        // Change remember accounts setting in storage
        chrome.runtime.sendMessage({ remember_accounts_setting: true, set_to: $("#remember_accounts_setting").is(":checked") }, (response) => {
            console.log(response);
        });
    });
})