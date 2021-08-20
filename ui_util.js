class AutomationUI {
    constructor(parent_id) {
        this.sites = [];
        this.parent_id = parent_id;
        $(`#${this.parent_id}`).html(
            `
            <div id="site_automation_div"></div>
            <button id="next_site_automation" class="btn btn-success" style="display: none;">Next</button>
            `
        );
        $("#next_site_automation").click(() => {
            this.disable_injection(this.current_site.identity_prefix);
            this.current_site.destroy();
            $(`#next_site_automation`).hide();
            this.next();
        });
        chrome.runtime.onMessage.addListener(
            (request, _) => {
                if (request.next_automation) {
                    $(`#next_site_automation`).show();
                }
            }
        );
    }

    add_site(site) {
        if (!(site instanceof AutomationSiteUI)) {
            throw "Site must be an AutomationSiteUI object"
        }
        this.sites.push(site);
    }

    run() {
        this.next();
    }

    next() {
        if (this.sites.length === 0) {
            this.finished(); // TODO implement this function
        }
        this.current_site = this.sites.pop();
        this.enable_injection(this.current_site.identity_prefix);
        this.current_site.initialize("site_automation_div");
    }

    stop() {
        this.disable_injection(this.current_site.identity_prefix);
        this.current_site.close_window();
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
    constructor(name, identity_prefix, logo_file, controller, start_url, incognito = false) {
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
        this.logo_file = logo_file;
        this.controller = controller;
        this.start_url = start_url;
        this.incognito = incognito
        this.window_id = null
        this.handlers = []
        this.init_default_handlers()
    }

    init_default_handlers() {
        this.register_handler("get_credentials", this.get_credentials);
        this.register_handler("get_password", this.get_password);
        this.register_handler("get_email", this.get_email);
        this.register_handler("get_phone", this.get_phone);
        this.register_handler("get_code", this.get_code);
        this.register_handler("get_method", this.get_method);
        this.register_handler("error", this.error_handler);
        this.register_handler("finished", this.finished);
        this.register_handler("change_method", this.change_method);
    }

    register_handler(suffix, handler) {
        this.handlers.push({ suffix: suffix, handler: handler, context: this });
    }

    initialize(parent_id) {
        this.parent_id = parent_id;
        $(`#${this.parent_id}`).html(
            `
            <div class="gray" id="${this.identity_prefix}-container">
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
            console.log(window.id);
            chrome.windows.update(window.id, { state: 'minimized' });
        });
    }

    destroy() {
        $(`#${this.identity_prefix}-container`).remove();
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
                    let consumed_request = false;
                    for (const handler of ui.handlers) {
                        if (request[`${ui.identity_prefix}_${handler.suffix}`]) {
                            consumed_request = true;
                            handler.handler(sender, request, handler.context);
                            if (handler.suffix === "error" || handler.suffix === "finished") {
                                chrome.runtime.onMessage.removeListener(listener);
                            }
                        }
                    }
                    if (!consumed_request) {
                        chrome.runtime.onMessage.removeListener(listener);
                        ui.request_error(request);
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

    finished(sender, request, context) {
        $(`#${context.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
            <p>Finished automation for ${context.name}</p>
            `
        );
        context.controller.disable_injection(context.identity_prefix);
        context.close_window();
        chrome.runtime.sendMessage({
            next_automation: true,
        });
    }

    request_error(request) {
        this.error(`Got invalid request: ${JSON.stringify(request)}`);
    }

    error_handler(_, request, context) {
        context.error(request.message);
    }

    error(message) {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            <p>${this.name} Error: ${message}</p>
            `
        );
        this.controller.disable_injection(this.identity_prefix);
        this.close_window();
        chrome.runtime.sendMessage({
            next_automation: true,
        });
    }

    get_credentials(sender, request, context) {
        $(`#${context.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
            <p>Please enter your ${request.type === null ? "login" : request.type === "username" ? "username" : "email"} and password for ${context.name}</p>
            <form id="${context.identity_prefix}_credentials_form">
                <input type="${request.type !== null && request.type === "email" ? "email" : "text"}" id="${context.identity_prefix}_login_input" placeholder="${request.type === null ? "Login" : request.type === "username" ? "Username" : "Email"}" required>
                <input type="password" id="${context.identity_prefix}_password_input" placeholder="Password" required>
                <button class="btn btn-success" type="submit">Submit</button>
            </form>
            `
        );
        $(`#${context.identity_prefix}_credentials_form`).submit((e) => {
            e.preventDefault();
            let login = $(`#${context.identity_prefix}_login_input`).val();
            let password = $(`#${context.identity_prefix}_password_input`).val();
            if (login && password) {
                let request_body = {
                    login: login,
                    password: password
                }
                request_body[`${context.identity_prefix}_credentials`] = true;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                context.loading();
            }
        });
    }

    get_password(sender, request, context) {
        chrome.windows.update(sender.tab.windowId, { state: 'minimized' });
        $(`#${context.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
            <p>Please enter ${request.username != null ? "the password for " + request.username : "your password"}</p>
            <form id="${context.identity_prefix}_password_form">
            <input type="password" id="${context.identity_prefix}_password_input" placeholder="Password" required>
            <button class="btn btn-success" type="submit">Submit</button>
            </form>
            `
        );
        $(`#${context.identity_prefix}_password_form`).submit((e) => {
            e.preventDefault();
            let password = $(`#${context.identity_prefix}_password_input`).val();
            if (password) {
                let request_body = {
                    password: password
                }
                request_body[`${context.identity_prefix}_password`] = true;
                request_body["next_step"] = request.next_step;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                context.loading();
            }
        });
    }

    get_email(sender, request, context) {
        $(`#${context.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
            <p>Please enter your email for ${context.name}</p>
            <form id="${context.identity_prefix}_credentials_form">
                <input type="email" id="${context.identity_prefix}_email_input" placeholder="Email" required>
                <button class="btn btn-success" type="submit">Submit</button>
            </form>
            `
        );
        $(`#${context.identity_prefix}_credentials_form`).submit((e) => {
            e.preventDefault();
            let email = $(`#${context.identity_prefix}_email_input`).val();
            if (email) {
                let request_body = {
                    email: email
                }
                request_body[`${context.identity_prefix}_email`] = true;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                context.loading();
            }
        });
    }

    get_phone(sender, request, context) {
        $(`#${context.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
            <p>Please enter your phone number to setup 2FA for ${context.name}</p>
            <form id="${context.identity_prefix}_phone_form">
                <input type="tel" id="${context.identity_prefix}_phone_input" placeholder="Phone number" required>
                <button class="btn btn-success" type="submit">Submit</button>
            </form>
            `
        );
        $(`#${context.identity_prefix}_phone_form`).submit((e) => {
            e.preventDefault();
            let phone = $(`#${context.identity_prefix}_phone_input`).val();
            if (phone) {
                let request_body = {
                    phone: phone
                }
                request_body[`${context.identity_prefix}_phone`] = true;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                context.loading();
            }
        });
    }

    get_code(sender, request, context) {
        if (request.type == null) {
            $(`#${context.identity_prefix}_ui_div`).html(
                // This usually happens when authenticating for a disable script- that's why the wording is vague. This is a catch-all for any 2fa code method that is already setup
                `
                ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                <p>Please enter your 2FA code for ${context.name}</p>
                <form id="${context.identity_prefix}_code_form">
                    <input type="text" id="${context.identity_prefix}_code_input" placeholder="Code" required>
                    <button class="btn btn-success" type="submit">Submit</button>
                </form>
                `
            );
        } else if (request.type === "totp") {
            if (request.login_challenge) {
                $(`#${context.identity_prefix}_ui_div`).html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter the code generated by your authenticator app</p>
                    <form id="${context.identity_prefix}_code_form">
                        <input type="text" id="${context.identity_prefix}_code_input" placeholder="Code" required>
                        <button class="btn btn-success" type="submit">Submit</button>
                    </form>
                    `
                );
            } else if (!(request.totp_seed || request.totp_url)) {
                context.error("TOTP seed not provided");
                return;
            } else {
                let totp_url;
                if (request.totp_url) {
                    totp_url = request.totp_url;
                } else {
                    totp_url = `otpauth://totp/${context.name}?secret=${request.totp_seed}`;
                    console.log(totp_url);
                }
                $(`#${context.identity_prefix}_ui_div`).html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Download Google Authenticator, scan this QR code, and enter the generated code</p>
                    <div class="row">
                        <div class="col-6">
                            <form id="${context.identity_prefix}_code_form">
                            <input type="text" id="${context.identity_prefix}_code_input" placeholder="Code" required>
                                <button class="btn btn-success" type="submit">Submit</button>
                            </form>
                        </div>
                        <div class="col-6">
                            <div id="${context.identity_prefix}_qr_div" style="width: 100%;">
                        </div>
                    </div>
                    `
                );
                new QRCode(document.getElementById(`${context.identity_prefix}_qr_div`), totp_url);
            }


        } else if (request.type === "sms") {
            $(`#${context.identity_prefix}_ui_div`).html(
                `
                ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                <p>Please enter the code sent to your phone via SMS</p>
                <form id="${context.identity_prefix}_code_form">
                    <input type="text" id="${context.identity_prefix}_code_input" placeholder="Code" required>
                    <button class="btn btn-success" type="submit">Submit</button>
                </form>
                `
            );
        }
        $(`#${context.identity_prefix}_code_form`).submit((e) => {
            e.preventDefault();
            let code = $(`#${context.identity_prefix}_code_input`).val();

            if (code) {
                let request_body = {
                    code: code,
                    totp_seed: request.totp_seed
                }

                if (request.login_challenge) {
                    request_body['login_challenge'] = true;
                }
                request_body[`${context.identity_prefix}_code`] = true;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                context.loading();
            }
        });
    }

    get_method(sender, request, context) {
        $(`#${context.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
            <div class="row">
                <div class="col-6">
                    <p>Please choose a type of 2FA to set up for ${context.name}</p>
                </div>
                <div class="col-6">
                    <button class="btn btn-success" id="${context.identity_prefix}_totp_button">TOTP</button> <span id = "${context.identity_prefix}_totp_tick" style="display:none"> &#10004</span>
                    <br><br>
                    <button class="btn btn-success" id="${context.identity_prefix}_sms_button">SMS</button> <span id = "${context.identity_prefix}_sms_tick" style="display:none"> &#10004</span>
                </div>
            </div>
            `
        );
        if (request.sms_already_setup) {
            document.getElementById(context.identity_prefix + "_sms_button").disabled = "disabled";
            document.getElementById(context.identity_prefix + "_sms_tick").style.display = "";
        }
        if (request.totp_already_setup) {
            document.getElementById(context.identity_prefix + "_totp_button").disabled = "disabled";
            document.getElementById(context.identity_prefix + "_totp_tick").style.display = "";
        }
        $(`#${context.identity_prefix}_totp_button`).click(() => {
            let request_body = {}
            request_body[`${context.identity_prefix}_totp`] = true;
            chrome.tabs.sendMessage(sender.tab.id, request_body);
            context.loading();
        });
        $(`#${context.identity_prefix}_sms_button`).click(() => {
            let request_body = {}
            request_body[`${context.identity_prefix}_sms`] = true;
            chrome.tabs.sendMessage(sender.tab.id, request_body);
            context.loading();
        });
    }

    change_method(sender, request, context) {
        $(`#${context.identity_prefix}_ui_div`).html(
            `
            <div class="row">
                <div class="col-6">
                    <p>You are currently using ${request.method_enabled == "sms" ? "SMS" : " an authenticator app" } to login to your account at ${this.name}. </p>
                    <p>Would you like to change this method? </p>
                </div>
                <div class="col-6">
                    <button class="btn btn-success" id="${context.identity_prefix}_continue_button">Yes</button>
                    <br><br>
                    <button class="btn btn-success" id="${context.identity_prefix}_cancel_button">No</button>
                </div>
            </div>
            `
        );

        $(`#${context.identity_prefix}_continue_button`).click(() => {
            if (request.method_enabled == 'sms') {
                let request_body = {
                    change_method: true,
                    method_enabled: 'sms',
                }
                request_body[`${context.identity_prefix}_totp`] = true;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                context.loading();
            } else {
                let request_body = {
                    change_method: true,
                    method_enabled: 'totp',
                }
                request_body[`${context.identity_prefix}_sms`] = true;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                context.loading();

            }
        });

        $(`#${context.identity_prefix}_cancel_button`).click(() => {
            context.finished(sender, request, context);
        });
    }
}

class AmazonUI extends AutomationSiteUI {
    constructor(name, identity_prefix, logo_file, controller, start_url, incognito = false) {
        super(name, identity_prefix, logo_file, controller, start_url, incognito);
        this.register_handler("approve_login", this.approve_login);
    }

    approve_login(sender, request, context) {
        $(`#${context.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
            <p>
                Amazon requires that you approve your login attempts manually each time you sign in.
                To do this, please follow the link sent to your phone and email.
                There, click "Approve" and then close the window. Then check back here for more instructions.
            </p>
            `
        );
    }
}

class YahooUI extends AutomationSiteUI {
    constructor(name, identity_prefix, logo_file, controller, start_url, incognito = false) {
        super(name, identity_prefix, logo_file, controller, start_url, incognito);
        this.register_handler("complete_captcha", this.complete_captcha);
    }

    complete_captcha(sender, request, context) {
        $(`#${context.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
            <p>
                Yahoo requires that you prove that you're not a robot before continuing.
                To complete this check please click the next button.                
            </p>

            <div class="col-6">
                    <button class="btn btn-success" id="${context.identity_prefix}_continue_button">Continue</button>

            </div>
            `
        );
        $(`#${context.identity_prefix}_continue_button`).click(() => {
            chrome.windows.update(sender.tab.windowId, { state: 'normal' });
        });
    }
}