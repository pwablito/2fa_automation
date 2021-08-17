class AutomationUI {
    constructor() {
        this.sites = [];
    }

    add_site(site) {
        if (!(site instanceof AutomationSiteUI)) {
            throw "Site must be an AutomationSiteUI object"
        }
        this.sites.push(site);
    }

    run() {
        for (let site of this.sites) {
            this.enable_injection(site.identity_prefix);
            site.initialize();
        }
    }

    stop() {
        for (let site of this.sites) {
            this.disable_injection(site.identity_prefix);
            site.close_window();
        }
    }

    enable_injection(service) {
        throw "Must be overridden"
    }

    disable_injection(service) {
        throw "Must be overridden"
    }
}

class SetupUI extends AutomationUI {
    enable_injection(service) {
        // Calls the enable_injection function in `setup_util.js`
        enable_injection(service, "setup")
    }

    disable_injection(service) {
        // Calls the disable_injection function in `setup_util.js`
        disable_injection(service, "setup")
    }
}

class DisableUI extends AutomationUI {
    enable_injection(service) {
        // Calls the enable_injection function in `setup_util.js`
        enable_injection(service, "disable")
    }

    disable_injection(service) {
        // Calls the disable_injection function in `setup_util.js`
        disable_injection(service, "disable")
    }
}

class AutomationSiteUI {
    constructor(name, identity_prefix, parent_id, logo_file, controller, start_url, incognito = false) {
        /*
         * @param {string} name - Name of the site (i.e. "Google")
         * @param {string} identity_prefix - Prefix for UI elements (i.e. "google" would result in "google_ui_div"
         * @param {string} parent_id - ID of the parent element in which this will be placed
         * @param {string} logo_file - Path to the logo file to display on the side of the UI
         * @param {AutomationUI} controller - Controller which is an AutomationUI object (i.e. SetupUI or DisableUI)
         * @param {string} start_url - URL for the first page of the 2fa automation process (will be automatically opened)
         * @param {boolean} incognito - Whether or not to open the target site in incognito mode
         */
        this.name = name;
        this.identity_prefix = identity_prefix;
        this.parent_id = parent_id;
        this.logo_file = logo_file;
        this.controller = controller;
        this.start_url = start_url;
        this.incognito = incognito
        this.window_id = null
    }

    initialize() {
        $(`#${this.parent_id}`).append(
            `
            <div class="gray">
                <div class="row">
                    <div class="col-3"><img src="${this.logo_file}"></div>
                    <div class="col-9">
                        <div id="${this.identity_prefix}_ui_div" class="row" style="text-align: left;"></div>
                    </div>
                </div>
            </div>
            `
        );
        this.launch_listener(this);
        this.loading();
        chrome.windows.create({
            url: this.start_url,
            focused: false,
            state: "minimized",
            incognito: this.incognito,
        }, (window) => {
            this.window_id = window.id;
            chrome.windows.update(window.id, { state: 'minimized' });
        });
    }

    launch_listener(ui) {
        chrome.runtime.onMessage.addListener(
            async function listener(request, sender) {
                let is_this_site = false;
                for (const [key, value] of Object.entries(request)) {
                    if (key.includes(ui.identity_prefix)) {
                        is_this_site = true;
                        break;
                    }
                }
                if (is_this_site) {
                    console.log(request);
                    if (request[`${ui.identity_prefix}_get_credentials`]) {
                        ui.get_credentials(sender, request);
                    } else if (request[`${ui.identity_prefix}_get_password`]) {
                        ui.get_password(sender, request);
                    } else if (request[`${ui.identity_prefix}_get_email`]) {
                        ui.get_email(sender, request);
                    } else if (request[`${ui.identity_prefix}_get_phone`]) {
                        ui.get_phone(sender, request);
                    } else if (request[`${ui.identity_prefix}_get_code`]) {
                        ui.get_code(sender, request);
                    } else if (request[`${ui.identity_prefix}_get_method`]) {
                        ui.get_method(sender, request);
                    } else if (request[`${ui.identity_prefix}_finished`]) {
                        chrome.runtime.onMessage.removeListener(listener);
                        ui.finished(sender, request);
                    } else if (request[`${ui.identity_prefix}_error`]) {
                        chrome.runtime.onMessage.removeListener(listener);
                        ui.error(sender, request);
                    } else {
                        chrome.runtime.onMessage.removeListener(listener);
                        ui.error(`Got invalid request: ${JSON.stringify(request)}`, sender);
                    }
                }
            }
        );
    }

    close_window() {
        if (this.window_id) chrome.windows.remove(this.window_id);
    }

    loading() {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            <div class="row">
                <div class="col-10">
                Please wait...
                </div>
                <div class="col-2">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            </div>
            `
        );
    }

    finished(sender, request) {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
            <p>Finished automation for ${this.name}</p>
            `
        );
        this.controller.disable_injection(this.identity_prefix);
        this.close_window();
    }

    error(sender, request) {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            <p>Error: ${request.message}</p>
            `
        );
        this.controller.disable_injection(this.identity_prefix);
        this.close_window();
    }

    get_credentials(sender, request) {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
            <p>Please enter your login and password</p>
            <form id="${this.identity_prefix}_credentials_form">
                <input type="text" id="${this.identity_prefix}_login_input" placeholder="Login" required>
                <input type="password" id="${this.identity_prefix}_password_input" placeholder="Password" required>
                <button class="btn btn-success" type="submit">Submit</button>
            </form>
            `
        );
        $(`#${this.identity_prefix}_credentials_form`).submit((e) => {
            e.preventDefault();
            let login = $(`#${this.identity_prefix}_login_input`).val();
            let password = $(`#${this.identity_prefix}_password_input`).val();
            if (login && password) {
                let request_body = {
                    login: login,
                    password: password
                }
                request_body[`${this.identity_prefix}_credentials`] = true;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                this.loading();
            }
        });
    }

    get_password(sender, request) {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
            <p>Please enter ${request.username != null ? "the password for " + request.username : "your password"}</p>
            <form id="${this.identity_prefix}_password_form">
                <input type="password" id="${this.identity_prefix}_password_input" placeholder="Password" required>
                <button class="btn btn-success" type="submit">Submit</button>
            </form>
            `
        );
        $(`#${this.identity_prefix}_password_form`).submit((e) => {
            e.preventDefault();
            let password = $(`#${this.identity_prefix}_password_input`).val();
            if (password) {
                let request_body = {
                    password: password
                }
                request_body[`${this.identity_prefix}_password`] = true;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                this.loading();
            }
        });
    }

    get_email(sender, request) {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
            <p>Please enter your email</p>
            <form id="${this.identity_prefix}_credentials_form">
                <input type="email" id="${this.identity_prefix}_email_input" placeholder="Email" required>
                <button class="btn btn-success" type="submit">Submit</button>
            </form>
            `
        );
        $(`#${this.identity_prefix}_credentials_form`).submit((e) => {
            e.preventDefault();
            let email = $(`#${this.identity_prefix}_email_input`).val();
            if (email) {
                let request_body = {
                    email: email
                }
                request_body[`${this.identity_prefix}_email`] = true;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                this.loading();
            }
        });
    }

    get_phone(sender, request) {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
            <p>Please enter your phone number to setup 2FA</p>
            <form id="${this.identity_prefix}_phone_form">
                <input type="tel" id="${this.identity_prefix}_phone_input" placeholder="Phone number" required>
                <button class="btn btn-success" type="submit">Submit</button>
            </form>
            `
        );
        $(`#${this.identity_prefix}_phone_form`).submit((e) => {
            e.preventDefault();
            let phone = $(`#${this.identity_prefix}_phone_input`).val();
            if (phone) {
                let request_body = {
                    phone: phone
                }
                request_body[`${this.identity_prefix}_credentials`] = true;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                this.loading();
            }
        });
    }

    get_code(sender, request) {
        if (request.type === null) {
            $(`#${this.identity_prefix}_ui_div`).html(
                // This usually happens when authenticating for a disable script- that's why the wording is vague. This is a catch-all for any 2fa code method that is already setup
                `
                ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                <p>Please enter your 2FA code</p>
                <form id="${this.identity_prefix}_code_form">
                    <input type="text" id="${this.identity_prefix}_code_input" placeholder="Code" required>
                    <button class="btn btn-success" type="submit">Submit</button>
                </form>
                `
            );
        } else if (request.type === "totp") {
            if (!(request.totp_seed || request.totp_url)) {
                this.error("TOTP seed not provided", sender);
                return;
            }

            let totp_url;
            if (request.totp_url) {
                totp_url = request.totp_url;
            } else {
                totp_url = `otpauth://totp/${this.name}?secret=${request.totp_seed}`;
            }
            $(`#${this.identity_prefix}_ui_div`).html(
                `
                ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                <p>Download Google Authenticator, scan this QR code, and enter the generated code</p>
                <div class="row">
                    <div class="col-6">
                        <form id="${this.identity_prefix}_code_form">
                            <input type="text" id="${this.identity_prefix}_code_input" placeholder="Code" required>
                            <button class="btn btn-success" type="submit">Submit</button>
                        </form>
                    </div>
                    <div class="col-6">
                        <div id="${this.identity_prefix}_qr_div" style="width: 100%;">
                    </div>
                </div>
                `
            );
            place_qr_code(totp_url, `${this.identity_prefix}_qr_div`);
        } else if (request.type === "sms") {
            $(`#${this.identity_prefix}_ui_div`).html(
                `
                ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                <p>Please enter the code sent to your phone via SMS</p>
                <form id="${this.identity_prefix}_code_form">
                    <input type="text" id="${this.identity_prefix}_code_input" placeholder="Code" required>
                    <button class="btn btn-success" type="submit">Submit</button>
                </form>
                `
            );
        }
        $(`#${this.identity_prefix}_code_form`).submit((e) => {
            e.preventDefault();
            let code = $(`#${this.identity_prefix}_code_input`).val();
            if (code) {
                let request_body = {
                    code: code
                }
                request_body[`${this.identity_prefix}_code`] = true;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                this.loading();
            }
        });
    }

    get_method(sender, request) {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
            <div class="row">
                <div class="col-6">
                    <p>Please choose a type of 2FA to set up</p>
                </div>
                <div class="col-6">
                    <button class="btn btn-success" id="${this.identity_prefix}_totp_button">TOTP</button>
                    <br><br>
                    <button class="btn btn-success" id="${this.identity_prefix}_sms_button">SMS</button>
                </div>
            </div>
            `
        );
        $(`#${this.identity_prefix}_totp_button`).click(() => {
            let request_body = {}
            request_body[`${this.identity_prefix}_totp`] = true;
            chrome.tabs.sendMessage(sender.tab.id, request_body);
            this.loading();
        });
        $(`#${this.identity_prefix}_sms_button`).click(() => {
            let request_body = {}
            request_body[`${this.identity_prefix}_sms`] = true;
            chrome.tabs.sendMessage(sender.tab.id, request_body);
            this.loading();
        });
    }
}

function place_qr_code(url, div_id) {
    new QRCode(document.getElementById(div_id), url);
}