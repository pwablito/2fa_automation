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