function enable_injection(service_name, type) {
    chrome.runtime.sendMessage({
        enable_injection: true,
        service: service_name,
        type: type,
    });
}

function disable_injection(service_name, type) {
    chrome.runtime.sendMessage({
        disable_injection: true,
        service: service_name,
        type: type,
    });
}
