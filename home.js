$(document).ready(() => {
    // Get settings if any
    chrome.storage.sync.get(['auto_detect_setting', 'remember_accounts_setting'], (result) => {
        if (result.auto_detect_setting) {
            $("#auto_detect_setting").click();
        }
        if (result.remember_accounts_setting) {
            $("#remember_accounts_setting").click();
        }
    });
    $("#auto_detect_setting").click(() => {
        // Change auto detection setting in storage
        chrome.storage.sync.set({ auto_detect_setting: $("#auto_detect_setting").is(":checked") }, function() {
            console.log('Auto detect setting is set to ' + $("#auto_detect_setting").is(":checked"));
        });
    });

    $("#remember_accounts_setting").click(() => {
        // Change remember accounts setting in storage
        chrome.storage.sync.set({ remember_accounts_setting: $("#remember_accounts_setting").is(":checked") }, function() {
            console.log('Remember accounts setting is set to ' + $("#remember_accounts_setting").is(":checked"));
        });
    });
});