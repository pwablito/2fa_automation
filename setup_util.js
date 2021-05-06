function enable_injection(service_name) {
    chrome.runtime.sendMessage({
        enable_injection: true,
        service: service_name
    });
}

function disable_injection(service_name) {
    chrome.runtime.sendMessage({
        disable_injection: true,
        service: service_name
    });
}