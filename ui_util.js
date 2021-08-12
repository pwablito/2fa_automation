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
    constructor(name, identity_prefix, parent_id, logo_file, controller, start_url) {
        /*
         * @param {string} name - Name of the site (i.e. "Google")
         * @param {string} identity_prefix - Prefix for UI elements (i.e. "google" would result in "google_ui_div"
         * @param {string} parent_id - ID of the parent element in which this will be placed
         * @param {string} logo_file - Path to the logo file to display on the side of the UI
         * @param {AutomationController} controller - Controller which is an AutomationUI object (i.e. SetupUI or DisableUI)
         * @param {string} start_url - URL for the first page of the 2fa automation process (will be automatically opened)
         */
        this.name = name;
        this.identity_prefix = identity_prefix;
        this.parent_id = parent_id;
        this.logo_file = logo_file;
        this.controller = controller;
        this.start_url = start_url;
    }

    launch_listener() {
        chrome.runtime.onMessage.addListener(
            function listener(request, sender) {
                if (request[`${this.identity_prefix}_get_credentials`]) {
                    this.get_credentials();
                } else if (request[`${this.identity_prefix}_get_password`]) {
                    this.get_credentials();
                } else if (request[`${this.identity_prefix}_get_email`]) {
                    this.get_email();
                } else if (request[`${this.identity_prefix}_get_phone`]) {
                    this.get_phone();
                } else if (request[`${this.identity_prefix}_get_code`]) {
                    this.get_code();
                } else if (request[`${this.identity_prefix}_get_method`]) {
                    this.get_method();
                } else if (request[`${this.identity_prefix}_finished`]) {
                    chrome.runtime.onMessage.removeListener(listener);
                    this.finished();
                } else if (request[`${this.identity_prefix}_error`]) {
                    chrome.runtime.onMessage.removeListener(listener);
                    this.error();
                } else {
                    this.error(`Got invalid request: ${request}`);
                }
            }
        );
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
        this.launch_listener();
        this.loading();
        chrome.windows.create({
            url: this.start_url,
            focused: false,
            state: "minimized",
            incognito: true
        }, (window) => {
            chrome.windows.update(window.id, { state: 'minimized' });
        });
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

    finished() {
        this.controller.disable_injection(this.identity_prefix);
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            ${message != null ? "<p>" + message + "</p>" : ""}
            <p>Finished automation for ${this.name}</p>
            `
        );
    }

    error(message) {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            <p>Error: ${message}</p>
            `
        );
        this.controller.disable_injection(this.identity_prefix);
    }

    get_credentials(message = null) {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            ${message != null ? "<p>" + message + "</p>" : ""}
            <p>Please enter your email and password</p>
            <form id="${this.identity_prefix}_credentials_form">
                <input type="email" id="${this.identity_prefix}_email_input" placeholder="Email" required>
                <input type="password" id="${this.identity_prefix}_password_input" placeholder="Password" required>
                <button class="btn btn-success" type="submit">Submit</button>
            </form>
            `
        );
        $(`#${this.identity_prefix}_credentials_form`).submit((e) => {
            e.preventDefault();
            let email = $(`#${this.identity_prefix}_email_input`).val();
            let password = $(`#${this.identity_prefix}_password_input`).val();
            if (email && password) {
                let request_body = {
                    email: email,
                    password: password
                }
                request_body[`${this.identity_prefix}_credentials`] = true;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                this.loading();
            }
        });
    }

    get_password(message = null) {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            ${message != null ? "<p>" + message + "</p>" : ""}
            <p>Please enter your password</p>
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

    get_email(message = null) {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            ${message != null ? "<p>" + message + "</p>" : ""}
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

    get_phone(message = null) {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            ${message != null ? "<p>" + message + "</p>" : ""}
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

    get_code(message = null) {
        this.error("Not implemented");
    }

    get_method(message = null) {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            ${message != null ? "<p>" + message + "</p>" : ""}
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