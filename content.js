function getElementByXpath(doc, xpath) {
    return doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}

function change(field, value) {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: false, key: '', char: '' }));
    field.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: false, key: '', char: '' }));
}

chrome.runtime.onMessage.addListener(
    async function(request, _) {
        if (request.reddit_automate) {
            getElementByXpath(document, '/html/body/div[1]/div/div[2]/div[2]/div/div/div[2]/div[1]/div[9]/div[2]/div/button').click();
            await new Promise(r => setTimeout(r, 2000));
            var iframe_elem = getElementByXpath(document, "/html/body/div[1]/div/div[2]/div[3]/div[2]/div/iframe")
            var iframe = iframe_elem.contentDocument || iframe_elem.contentWindow.document;
            change(getElementByXpath(iframe, '/html/body/div/div/div[2]/main/form[1]/fieldset[1]/input'), request.password);
            await new Promise(r => setTimeout(r, 500));
            getElementByXpath(iframe, '/html/body/div/div/div[2]/main/form[1]/fieldset[2]/button').click();
            chrome.runtime.sendMessage({
                scan_and_get_code: true
            });
        }
        if (request.reddit_place_code) {

            var iframe_elem = getElementByXpath(document, "/html/body/div[1]/div/div[2]/div[3]/div[2]/div/iframe")
            var iframe = iframe_elem.contentDocument || iframe_elem.contentWindow.document;
            change(getElementByXpath(iframe, '/html/body/div/div/div[2]/main/form[2]/fieldset[1]/input'), request.code);
            await new Promise(r => setTimeout(r, 500));
            getElementByXpath(iframe, '/html/body/div/div/div[2]/main/form[2]/fieldset[2]/button').click();
            chrome.runtime.sendMessage({
                finished: true
            });

        }
    }
);