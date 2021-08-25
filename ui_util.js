
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

class AutomationUI {
    constructor(parent_id) {
        this.sites = [];
        this.percentage_increment = 0;
        this.total_number_of_sites 
        this.parent_id = parent_id;
        $(`#${this.parent_id}`).html(
            `
            <div id="site_automation_div"></div>
            <button id="next_site_automation" class="btn-lg btn-success" style="display: none;">Next</button>
            `
        );
        $("#next_site_automation").click(() => {
            this.disable_injection(this.current_site.identity_prefix);
            $(`#next_site_automation`).hide();
            $(`#${this.parent_id}`).append($(`#next_site_automation`))
            this.current_site.destroy();
            this.next();
        });
        chrome.runtime.onMessage.addListener(
            (request, _) => {
                // For debug purposes in the UI only
                console.log(request);
            }
        );
    }

    add_site(site) {
        if (!(site instanceof AutomationSiteUI)) {
            throw "Site must be an AutomationSiteUI object"
        }
        this.sites.push(site);
        this.total_number_of_sites = this.sites.length
        this.percentage_increment = 100/this.total_number_of_sites;
        console.log(this.percentage_increment.toString())
        console.log(this.total_number_of_sites.toString())
    }

    run() {
        this.next();
    }

    next() {

        
        if (this.sites.length === 0) {

            $("#site_automation_div").html(
                `
                <div class="row m-0 p-2">
                    <div class="col d-flex justify-content-center">
                        <img src="images/finishedall.svg" style="height:147px; width:225px;">
                    </div>
                </div>
                <div class="row m-0 p-2">
                    <div class="col d-flex justify-content-center">
                        <h4>  You are all done setting up your accounts! </h4>
                    </div>
                </div>
                <div class="row m-0 p-2">
                    <div class="col d-flex justify-content-center">
                        <a class="btn-lg btn-success" href="popup.html" role="button">  Finish! </a>
                    </div>
                </div>
                `
            );
        } 
        let percentage_completed = (this.total_number_of_sites - this.sites.length) * this.percentage_increment;
        document.querySelector("#system_progress_bar").setAttribute("style", "width: " + percentage_completed.toString() + "%;");
        document.querySelector("#system_progress_bar").setAttribute("aria-valuenow", percentage_completed.toString());

        

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
        // Calls the enable_injection function in `util.js`
        enable_injection(service, "setup")
    }

    disable_injection(service) {
        // Calls the disable_injection function in `util.js`
        disable_injection(service, "setup")
    }
}

class DisableUI extends AutomationUI {
    enable_injection(service) {
        // Calls the enable_injection function in `util.js`
        enable_injection(service, "disable")
    }

    disable_injection(service) {
        // Calls the disable_injection function in `util.js`
        disable_injection(service, "disable")
    }
}

class AutomationSiteUI {
    constructor(name, identity_prefix, logo_file, controller, start_url) {
        /*
         * @param {string} name - Name of the site (i.e. "Google")
         * @param {string} identity_prefix - Prefix for UI elements (i.e. "google" would result in "google_ui_div"
         * @param {string} parent_id - ID of the parent element in which this will be placed
         * @param {string} logo_file - Path to the logo file to display on the side of the UI
         * @param {AutomationUI} controller - Controller which is an AutomationUI object (i.e. SetupUI or DisableUI)
         * @param {string} start_url - URL for the first page of the 2fa automation process (will be automatically opened)
         */
        this.name = name;
        this.identity_prefix = identity_prefix;
        this.logo_file = logo_file;
        this.controller = controller;
        this.start_url = start_url;
        this.window_id = null;
        this.handlers = [];
        this.init_default_handlers();
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
        this.register_handler("get_backup_code_download", this.get_backup_code_download);
        this.register_handler("get_already_enabled_2fa", this.get_already_enabled_2fa);
        this.register_handler("change_method", this.change_method);
        
    }

    register_handler(suffix, handler) {
        this.handlers.push({ suffix: suffix, handler: handler, context: this });
    }

    initialize(parent_id) {
        this.parent_id = parent_id;
        let capitalizedWebsite = capitalizeFirstLetter(this.identity_prefix);
        $(`#header`).html(
            `
            <h4 class="pt-1" id="header"> Setting up ${capitalizedWebsite} </h4>
            `
        )
        $(`#icon`).html(
            `
            <img src="${this.logo_file}" style="height: 40px; width: 40px">
            `
        )

        $(`#website`).html(
            `
            <p> <small> ${capitalizedWebsite} </small></p>
            `
        )


        $(`#${this.parent_id}`).html(
            `
            <div class="gray p-0" id="${this.identity_prefix}-container" style="height: 400px;">
                <div id="${this.identity_prefix}_ui_div" ></div> 
            </div>
            `
        );

        
        this.launch_listener(this);
        this.loading();
        chrome.runtime.getBackgroundPage(function(backgroundPage) { // To get incognito status from background page
            console.log(backgroundPage.isStartingTabIncognito);
            chrome.windows.create({
                url: this.start_url,
                focused: false,
                state: "minimized",
                incognito: backgroundPage.isStartingTabIncognito,
            }, (window) => {
                this.window_id = window.id;
                console.log(window.id);
                chrome.windows.update(window.id, { state: 'minimized' });
                chrome.runtime.sendMessage({window_id:window.id});
            });
        }.bind(this));
    }

    destroy() {
        //$(`#site-automation-div`).append($(`#next_site_automation`))
        //$(`#next_site_automation`).hide();
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
        let capitalizedWebsite =capitalizeFirstLetter(this.identity_prefix);
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            <div class="row m-0 p-2">
                <div class="col d-flex justify-content-center">
                    <img src="${this.logo_file}" style="height:100px; width:100px;">
                </div>
            </div>
            <div class="row m-0 p-2">
                <div class="col d-flex justify-content-center">
                    <h4>  ${capitalizedWebsite} is loading....</h4>
                </div>
            </div>
            <div class="row m-0 p-2">
                <div class="col d-flex justify-content-center">
                    <img src="images/loading.svg" style="height:200px; width:200px;">
                </div>
            </div>
            `
        );
    }

    get_backup_code_download(sender, request, context) {
        console.log("Seting attribute to true");
        document.querySelector(`#${context.identity_prefix}`).setAttribute("backup_code_download", true);
        console.log(document.querySelector(`#${context.identity_prefix}`));
    }

    get_already_enabled_2fa(sender, request, context) {
        console.log("getting attribute");
        console.log(document.querySelector(`#${context.identity_prefix}`));
        let request_body = {
            already_enabled_2fa: true,
            backup_code_download: document.querySelector(`#${context.identity_prefix}`).getAttribute("backup_code_download")
        }
        chrome.tabs.sendMessage(sender.tab.id, request_body);
        
    }

    
    
    finished(sender, request, context) {
        console.log(request);// contains backup_codes_array
        $(`#${context.identity_prefix}_ui_div`).html(
            `
            <div class="row m-0 p-2">
                <div class="col d-flex justify-content-center">
                    <img src="images/finishedaccount.svg" style="height:160px; width:225px;">
                </div>
            </div>
            <div class="row m-0 p-2">
                <div class="col d-flex justify-content-center">
                    <h4>  It worked! Ready to secure your next account?</h4>
                </div>
            </div>
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
            `
        );
        document.querySelector(`#website_progress_bar`).setAttribute("style", "width:100%")
        document.querySelector(`#website_progress_bar`).setAttribute("aria-valuenow", "100")
        context.controller.disable_injection(context.identity_prefix);
        context.close_window();
        $(`#${context.identity_prefix}_ui_div`).append($(`#next_site_automation`));
        $(`#next_site_automation`).show();
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
        $(`#next_site_automation`).show();
    }

    get_credentials(sender, request, context) {

        if (request.message == null && document.querySelector(`#${context.identity_prefix}`).getAttribute("password") && document.querySelector(`#${context.identity_prefix}`).getAttribute("email")) {
            let password = document.querySelector(`#${context.identity_prefix}`).getAttribute("password");
            let login = document.querySelector(`#${context.identity_prefix}`).getAttribute("email");
            let request_body = {
                login: login,
                password: password
            }
            request_body[`${context.identity_prefix}_password`] = true;
            request_body["next_step"] = request.next_step;
            chrome.tabs.sendMessage(sender.tab.id, request_body);
            context.loading();
        } else {
            $(`#${context.identity_prefix}_ui_div`).html(
                `

                <div class="row m-0 p-2">
                    <div class="col d-flex justify-content-center">
                        <img src="images/username.svg" style="height:120px; width:200px;">
                    </div>
                </div>
                <div class="row m-0 p-2">
                    <div class="col d-flex justify-content-center">
                        <h4>  Let&#39;s get you logged in. </h4>
                    </div>
                </div>
                <div class="row m-0 p-0">
                    <div class="col d-flex justify-content-center">
                    ${request.message != null ? "<p class='mb-0' style='color:#dc3545;'>" + request.message + "</p>" : ""}
                       </div>
                </div>
                <form id="${context.identity_prefix}_credentials_form">
                    <div class="row m-0 pt-3 pb-1 pr-4 pl-4 justify-content-center">
                        <div class="input-group input-group-lg">
                            <input type="${request.type !== null && request.type === "email" ? "email" : "text"}" id="${context.identity_prefix}_login_input" class="form-control" aria-label="Large" aria-describedby="inputGroup-sizing-sm" id="${context.identity_prefix}_email_input" placeholder="${request.type === null ? "Login" : request.type === "username" ? "Username" : "Email"}" required>
                         </div>
                    </div>
                    <div class="row m-0 pt-3 pb-1 pr-4 pl-4 justify-content-center">
                        <div class="input-group input-group-lg">
                            <input type="password" class="form-control" aria-label="Large" aria-describedby="inputGroup-sizing-sm" id="${context.identity_prefix}_password_input" placeholder="Password" required>
                        </div>
                    </div>
                    <div class="row m-0 p-2 justify-content-center">
                        <button class="btn-lg btn-success" type="submit">Submit</button>
                    </div>
                </form>
                `
            );
            document.querySelector(`#website_progress_bar`).setAttribute("style", "width:20%")
            document.querySelector(`#website_progress_bar`).setAttribute("aria-valuenow", "20")
            $(`#${context.identity_prefix}_credentials_form`).submit((e) => {
                e.preventDefault();
                let login = $(`#${context.identity_prefix}_login_input`).val();
                let password = $(`#${context.identity_prefix}_password_input`).val();
                if (login && password) {
                    let account_div = document.querySelector(`#${context.identity_prefix}`);
                    account_div.setAttribute("email", login);
                    account_div.setAttribute("password", password);
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
    }

    get_password(sender, request, context) {
        if (request.message == null && document.querySelector(`#${context.identity_prefix}`).getAttribute("password")) {
            let password = document.querySelector(`#${context.identity_prefix}`).getAttribute("password");
            let request_body = {
                password: password
            }
            request_body[`${context.identity_prefix}_password`] = true;
            request_body["next_step"] = request.next_step;
            chrome.tabs.sendMessage(sender.tab.id, request_body);
            context.loading();
        } else {
            chrome.windows.update(sender.tab.windowId, { state: 'minimized' });
            $(`#${context.identity_prefix}_ui_div`).html(
                `
                <div class="row m-0 p-2">
                    <div class="col d-flex justify-content-center">
                        <img src="images/password.svg" style="height:166px; width:200px;">
                    </div>
                </div>
                <div class="row m-0 p-2">
                    <div class="col d-flex justify-content-center">
                        <h4>  Enter your password. </h4>
                       </div>
                </div>
                <div class="row m-0 p-0">
                    <div class="col d-flex justify-content-center">
                    ${request.message != null ? "<p style='color:#dc3545;'>" + request.message + "</p>" : ""}
                       </div>
                </div>
                        
                    
                <form id="${context.identity_prefix}_password_form">
                    <div class="row m-0 pt-3 pb-1 pr-4 pl-4 justify-content-center">
                        <div class="input-group input-group-lg">
                            <input type="password" class="form-control" aria-label="Large" aria-describedby="inputGroup-sizing-sm" id="${context.identity_prefix}_password_input" placeholder="Password" required>
                         </div>
                    </div>
                    <div class="row m-0 p-2 justify-content-center">
                        <button class="btn-lg btn-success" type="submit">Submit</button>
                    </div>
                </form>

                `
            );
            document.querySelector(`#website_progress_bar`).setAttribute("style", "width:20%")
            document.querySelector(`#website_progress_bar`).setAttribute("aria-valuenow", "20")
            $(`#${context.identity_prefix}_password_form`).submit((e) => {
                e.preventDefault();
                let password = $(`#${context.identity_prefix}_password_input`).val();
                if (password) {
                    let account_div = document.querySelector(`#${context.identity_prefix}`);
                    account_div.setAttribute("password", password);
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

    }

    get_email(sender, request, context) {
        if (request.message == null && document.querySelector(`#${context.identity_prefix}`).getAttribute("email")) {
            let email = document.querySelector(`#${context.identity_prefix}`).getAttribute("email");
            let request_body = {
                email: email
            }
            request_body[`${context.identity_prefix}_email`] = true;
            chrome.tabs.sendMessage(sender.tab.id, request_body);
            context.loading();
        } else {
            $(`#${context.identity_prefix}_ui_div`).html(
                `

                <div class="row m-0 p-2">
                    <div class="col d-flex justify-content-center">
                        <img src="images/username.svg" style="height:120px; width:200px;">
                    </div>
                </div>
                <div class="row m-0 p-2">
                    <div class="col d-flex justify-content-center">
                        <h4>  Let&#39;s get you logged in. First we need to know what account you want to use. </h4>
                    </div>
                </div>
                <div class="row m-0 p-0">
                    <div class="col d-flex justify-content-center">
                    ${request.message != null ? "<p class='mb-0' style='color:#dc3545;'>" + request.message + "</p>" : ""}
                       </div>
                </div>
                <form id="${context.identity_prefix}_credentials_form">
                    <div class="row m-0 pt-3 pb-1 pr-4 pl-4 justify-content-center">
                        <div class="input-group input-group-lg">
                            <input type="email" class="form-control" aria-label="Large" aria-describedby="inputGroup-sizing-sm" id="${context.identity_prefix}_email_input" placeholder="Email" required>
                         </div>
                    </div>
                    <div class="row m-0 p-2 justify-content-center">
                        <button class="btn-lg btn-success" type="submit">Submit</button>
                    </div>
                </form>
                
                `
            );
            document.querySelector(`#website_progress_bar`).setAttribute("style", "width:10%")
            document.querySelector(`#website_progress_bar`).setAttribute("aria-valuenow", "10")
            $(`#${context.identity_prefix}_credentials_form`).submit((e) => {
                e.preventDefault();
                let email = $(`#${context.identity_prefix}_email_input`).val();
                if (email) {
                    let account_div = document.querySelector(`#${context.identity_prefix}`);
                    account_div.setAttribute("email", email);
                    let request_body = {
                        email: email
                    }
                    request_body[`${context.identity_prefix}_email`] = true;
                    chrome.tabs.sendMessage(sender.tab.id, request_body);
                    context.loading();
                }
            });
        }
    }

    get_phone(sender, request, context) {
        $(`#${context.identity_prefix}_ui_div`).html(
            `

            <div class="row m-0 pt-0">
                <div class="col">
                  <img src="images/sms.svg" style="height: 150px; width:141px;">
                </div>
            </div>
            <div class="row m-0 pl-5 pr-5 pb-1 pt-1">
                <div class="col">
                    <h4> Set Up Your Phone</h4>
                </div>
            </div>
            <div class="row m-0 pl-5 pr-5 pb-0 pt-0">
                <div class="col">
                    <p class="mb-0"> What phone number do you want to use? </p>
                </div>
            </div>
            <div class="row m-0 p-0">
                <div class="col d-flex justify-content-center">
                    ${request.message != null ? "<p style='color:#dc3545;' class='mb-0'><small>" + "There was a problem with that number. Please try a different number." + "</small></p>" : ""}
                </div>
            </div>
            
        
            <form id="${context.identity_prefix}_phone_form" class="mb-0">
                <div class="row m-0 pt-1 pb-1 pr-4 pl-4 justify-content-center">
                    <div class="input-group input-group-lg">
                      <input type="tel" class="form-control" aria-label="Large" aria-describedby="inputGroup-sizing-sm" id="${context.identity_prefix}_phone_input" placeholder="Phone number" required>
                    </div>
                </div>
                <div class="row m-0 p-2 justify-content-center">
                    <button class="btn-lg btn-success" type="submit">Submit</button>
                </div>
            </form>

            `
        );
        if(context.identity_prefix == "google" && document.querySelector(`#${context.identity_prefix}`).getAttribute("method")=="totp"){
            document.querySelector(`#website_progress_bar`).setAttribute("style", "width:50%")
            document.querySelector(`#website_progress_bar`).setAttribute("aria-valuenow", "50")
        } else {
            document.querySelector(`#website_progress_bar`).setAttribute("style", "width:60%")
            document.querySelector(`#website_progress_bar`).setAttribute("aria-valuenow", "60")
        }
        
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

                    <div class="row m-0 pt-0">
                            <div class="col qr_code_placeholder" id="${context.identity_prefix}_qrcode_placeholder">
                                <img src="images/authcode.svg" style="height: 150px; width:150px;">
                            </div>
                        </div>
                        <div class="row m-0 pl-5 pr-5 pb-1 pt-1">
                            <div class="col">
                                <h4> You have 2FA enabled.</h4>
                            </div>
                        </div>
                        <div class="row m-0 pl-5 pr-5 pb-0 pt-0">
                            <div class="col">
                                <p> Enter the 6-digit code from your authenticator app. </p>
                            </div>
                        </div>
                        <div class="row m-0 p-0">
                            <div class="col d-flex justify-content-center">
                                ${request.message != null ? "<p style='color:#dc3545;'>" + request.message + "</p>" : ""}
                           </div>
                        </div>
                            
                        
                        <form id="${context.identity_prefix}_code_form" class="mb-0">
                            <div class="row m-0 pt-1 pb-1 pr-4 pl-4 justify-content-center">
                                <div class="input-group input-group-lg">
                                    <input type="text" class="form-control" aria-label="Large" aria-describedby="inputGroup-sizing-sm" id="${context.identity_prefix}_code_input" placeholder="Code" required>
                                </div>
                            </div>
                            <div class="row m-0 p-2 justify-content-center">
                                <button class="btn-lg btn-success" type="submit">Submit</button>
                            </div>
                        </form>
    
                    `

                );
                
                $(`#${context.identity_prefix}_code_form`).submit((e) => {
                    e.preventDefault();
                    let code = $(`#${context.identity_prefix}_code_input`).val();
        
                    if (code) {
                        let request_body = {
                            code: code
                        }
        
                        if (request.login_challenge) {
                            request_body['login_challenge'] = true;
                        }
                        request_body[`${context.identity_prefix}_code`] = true;
                        chrome.tabs.sendMessage(sender.tab.id, request_body);
                        context.loading();
                    }
                });
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

                    <div class="row m-0 pt-3">
                        <div class="col">
                            <img src="images/authapp.png" style="height: 100px; width:100px;">
                        </div>
                    </div>
                    <div class="row m-0 pl-5 pr-5 pb-1 pt-1">
                        <div class="col">
                            <h4> Set Up Authenticator</h4>
                        </div>
                    </div>
                    <div class="row m-0 pl-5 pr-5 pb-0 pt-0">
                        <div class="col">
                            <ul class="text-left mb-0">
                                <li> Install authenticator app</li>
                                <li> Select <strong> Set up account</strong></li>
                                <li> Choose <strong> Scan a barcode app</strong></li>
                            </ul>
                        </div>
                    </div>
                    <div class="row m-0 center-text">
                        <div class="col">
                            <div class="qrcode" id="${context.identity_prefix}_qr_div" style="width: 100%;">
                            </div>
                        </div>
                    </div>

                    <div class="row m-0 p-1 justify-content-center">
                        <button class="btn-lg btn-success" id="${context.identity_prefix}_next_button">Next</button>
                    </div>
                    
                    `
                );

                if(context.identity_prefix == "google" && document.querySelector(`#${context.identity_prefix}`).getAttribute("method")=="totp"){
                    document.querySelector(`#website_progress_bar`).setAttribute("style", "width:80%")
                    document.querySelector(`#website_progress_bar`).setAttribute("aria-valuenow", "800")
                } else {
                    document.querySelector(`#website_progress_bar`).setAttribute("style", "width:60%")
                    document.querySelector(`#website_progress_bar`).setAttribute("aria-valuenow", "60")
                }
                
                let elm = new QRCode(document.getElementById(`${context.identity_prefix}_qr_div`), totp_url);

                $(`#${context.identity_prefix}_next_button`).click(() => {
                    $(`#${context.identity_prefix}_ui_div`).html(
                        `
                        <div class="row m-0 pt-0">
                            <div class="col qr_code_placeholder" id="${context.identity_prefix}_qrcode_placeholder">
                                <img src="images/authcode.svg" style="height: 150px; width:150px;">
                            </div>
                        </div>
                        <div class="row m-0 pl-5 pr-5 pb-1 pt-1">
                            <div class="col">
                                <h4> Set Up Authenticator</h4>
                            </div>
                        </div>
                        <div class="row m-0 pl-5 pr-5 pb-0 pt-0">
                            <div class="col">
                                <p> Enter the 6-digit code you see in the app. </p>
                            </div>
                        </div>
                        <div class="row m-0 p-0">
                            <div class="col d-flex justify-content-center">
                                ${request.message != null ? "<p style='color:#dc3545;'>" + request.message + "</p>" : ""}
                           </div>
                        </div>
                            
                        
                        <form id="${context.identity_prefix}_code_form" class="mb-0">
                            <div class="row m-0 pt-1 pb-1 pr-4 pl-4 justify-content-center">
                                <div class="input-group input-group-lg">
                                    <input type="text" class="form-control" aria-label="Large" aria-describedby="inputGroup-sizing-sm" id="${context.identity_prefix}_code_input" placeholder="Code" required>
                                </div>
                            </div>
                            <div class="row m-0 p-2 justify-content-center">
                                <button class="btn-lg btn-success" type="submit">Submit</button>
                            </div>
                        </form>
                        <div class="row m-0 p-0">
                            <div class="col">
                            <a href="#" id="${context.identity_prefix}_view_qrcode"> <small>  Need to scan barcode again? </small> </a>
                            </div>
                        </div>         
                        `
                    );

                    if(context.identity_prefix == "google" && document.querySelector(`#${context.identity_prefix}`).getAttribute("method")=="totp"){
                        document.querySelector(`#website_progress_bar`).setAttribute("style", "width:90%")
                        document.querySelector(`#website_progress_bar`).setAttribute("aria-valuenow", "90")
                    } else {
                        document.querySelector(`#website_progress_bar`).setAttribute("style", "width:80%")
                        document.querySelector(`#website_progress_bar`).setAttribute("aria-valuenow", "80")
                    }
                    $(`#${context.identity_prefix}_view_qrcode`).click(() => {
                        document.getElementById(`${context.identity_prefix}_qrcode_placeholder`).innerHTML = "";
                        new QRCode(document.getElementById(`${context.identity_prefix}_qrcode_placeholder`), totp_url);
                    });

                    $(`#${context.identity_prefix}_code_form`).submit((e) => {
                        e.preventDefault();
                        let code = $(`#${context.identity_prefix}_code_input`).val();
            
                        if (code) {
                            let request_body = {
                                code: code
                            }
            
                            if (request.totp_seed) {
                                request_body["totp_seed"] = request.totp_seed;
                            }
            
                            if (request.login_challenge) {
                                request_body['login_challenge'] = true;
                            }
                            request_body[`${context.identity_prefix}_code`] = true;
                            chrome.tabs.sendMessage(sender.tab.id, request_body);
                            context.loading();
                        }
                    });
                });
            }

        } else if (request.type === "sms") {

            if (request.login_challenge) {
                $(`#${context.identity_prefix}_ui_div`).html(
                    `

                    <div class="row m-0 pt-0">
                        <div class="col">
                            <img src="images/sms.svg" style="height: 150px; width:141px;">
                        </div>
                    </div>
                    <div class="row m-0 pl-5 pr-5 pb-1 pt-1">
                        <div class="col">
                            <h4> You have 2FA enabled.</h4>
                        </div>
                    </div>
                    <div class="row m-0 pl-5 pr-5 pb-0 pt-0">
                        <div class="col">
                            <p> Google just sent you a text message with a verification code to your phone. Enter the code below. </p>
                        </div>
                    </div>
                    <div class="row m-0 p-0">
                        <div class="col d-flex justify-content-center">
                            ${request.message != null ? "<p style='color:#dc3545;'>" + request.message + "</p>" : ""}
                        </div>
                    </div>
                
            
                    <form id="${context.identity_prefix}_code_form" class="mb-0">
                        <div class="row m-0 pt-1 pb-1 pr-4 pl-4 justify-content-center">
                            <div class="input-group input-group-lg">
                            <input type="text" class="form-control" aria-label="Large" aria-describedby="inputGroup-sizing-sm" id="${context.identity_prefix}_code_input" placeholder="Code" required>
                            </div>
                        </div>
                        <div class="row m-0 p-2 justify-content-center">
                            <button class="btn-lg btn-success" type="submit">Submit</button>
                        </div>
                    </form>
                    `
                );
            } else {
                $(`#${context.identity_prefix}_ui_div`).html(
                    `
                    <div class="row m-0 pt-0">
                        <div class="col">
                            <img src="images/sms.svg" style="height: 150px; width:141px;">
                        </div>
                    </div>
                    <div class="row m-0 pl-5 pr-5 pb-1 pt-1">
                        <div class="col">
                            <h4> Confirm that it works</h4>
                        </div>
                    </div>
                    <div class="row m-0 pl-5 pr-5 pb-0 pt-0">
                        <div class="col">
                            <p> Google just sent you a text message with a verification code to your phone. Enter the code below. </p>
                        </div>
                    </div>
                    <div class="row m-0 p-0">
                        <div class="col d-flex justify-content-center">
                            ${request.message != null ? "<p style='color:#dc3545;'>" + request.message + "</p>" : ""}
                        </div>
                    </div>
                
            
                    <form id="${context.identity_prefix}_code_form" class="mb-0">
                        <div class="row m-0 pt-1 pb-1 pr-4 pl-4 justify-content-center">
                            <div class="input-group input-group-lg">
                            <input type="text" class="form-control" aria-label="Large" aria-describedby="inputGroup-sizing-sm" id="${context.identity_prefix}_code_input" placeholder="Code" required>
                            </div>
                        </div>
                        <div class="row m-0 p-2 justify-content-center">
                            <button class="btn-lg btn-success" type="submit">Submit</button>
                        </div>
                    </form>
        
                `
                );
                if(context.identity_prefix == "google" && document.querySelector(`#${context.identity_prefix}`).getAttribute("method")=="totp"){
                    document.querySelector(`#website_progress_bar`).setAttribute("style", "width:65%")
                    document.querySelector(`#website_progress_bar`).setAttribute("aria-valuenow", "65")
                } else {
                    document.querySelector(`#website_progress_bar`).setAttribute("style", "width:80%")
                    document.querySelector(`#website_progress_bar`).setAttribute("aria-valuenow", "80")
                }
                
            }    
            
        }
        $(`#${context.identity_prefix}_code_form`).submit((e) => {
            e.preventDefault();
            let code = $(`#${context.identity_prefix}_code_input`).val();
            if (code) {
                let request_body = {
                    code: code
                }
                if (request.totp_seed) {
                    request_body["totp_seed"] = request.totp_seed;
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
        console.log(request);
        $(`#${context.identity_prefix}_ui_div`).html(
            `
            <div class="row m-0">
                <div class="col">
                    <img src="images/selectmethod.svg" style="height: 100px; width:100px;">
                </div>
            </div>
            <div class="row m-0 pl-5 pr-5 pb-2 pt-2">
                <div class="col">
                    ${request.message != null ? "<h4> You already have 2FA enabled! </h4>" : "<h4> Lets pick a method to protect your account.</h4>"}
                    
                </div>
            </div>
            <div class="row m-0">
                <div class="col-3 pl-1 pr-0 pt-3">
                    <img src="images/authapp.png" style="height: 90px; width: 85px;">
                </div>
                <div class="col-5 pl-0 pr-0 pb-1">
                    <p class="text-left mb-0"> <strong style="color: #71CF6F"> Recommended </strong> - <br> Use an app like Google Authenticator to get verification codes.</p>
                </div>
                <div class="col-4 pl-0 pt-3">
                    <button class="btn-sm btn-success" id="${context.identity_prefix}_totp_button"> Use Authenticator App <span id = "${context.identity_prefix}_totp_tick" style="display:none"> &#10004</span> </button> 
                </div>

            </div>
            <div class="row m-0 pt-3">
                <div class="col-3 pl-0 pr-4 pt-0">
                    <img src="images/sms.svg" style="height: 90px; width: 85px;">
                </div>
                <div class="col-5 pl-0 pr-0">
                    <p class="text-left">  Use text messages (SMS) to receive verification codes.</p>
                </div>
                <div class="col-4 pl-0 pt-2">
                    <button class="btn-sm btn-success" id="${context.identity_prefix}_sms_button"> Use Text Messages <span id = "${context.identity_prefix}_sms_tick" style="display:none"> &#10004</span> </button> 
                </div>
            </div>

            `
        );
        document.querySelector(`#website_progress_bar`).setAttribute("style", "width:35%")
        document.querySelector(`#website_progress_bar`).setAttribute("aria-valuenow", "35")
        if (request.sms_already_setup) {
            document.getElementById(context.identity_prefix + "_sms_button").disabled = "disabled";
            document.getElementById(context.identity_prefix + "_sms_tick").style.display = "";
        }
        if (request.totp_already_setup) {
            document.getElementById(context.identity_prefix + "_totp_button").disabled = "disabled";
            document.getElementById(context.identity_prefix + "_totp_tick").style.display = "";
        }
        $(`#${context.identity_prefix}_totp_button`).click(() => {
            if (document.querySelector(`#${context.identity_prefix}`).getAttribute("method") == "") {
                document.querySelector(`#${context.identity_prefix}`).setAttribute("method", "totp")
            }
            if (context.identity_prefix == "google" && !request.sms_already_setup) {
                $(`#${context.identity_prefix}_ui_div`).html(
                    `
                    <div class="row m-0 pt-0">
                        <div class="col">
                            <img src="images/smsfirst.svg" style="height: 200px; width:170px;">
                        </div>
                    </div>
        
                    <div class="row m-0 pl-5 pr-5 pb-0 pt-0">
                        <div class="col">
                            <p> Before setting up an authenticator app, Google requires you first enable text messages. Let&#39;s do that first. </p>
                        </div>
                    </div>
                        
                    <div class="row m-0 p-2 justify-content-center">
                        <button class="btn-lg btn-success" id="${context.identity_prefix}_continue_button">Continue</button>
                    </div>
                    `
                );
                $(`#${context.identity_prefix}_continue_button`).click(() => {
                    let request_body = {}
                    request_body[`${context.identity_prefix}_sms`] = true;
                    chrome.tabs.sendMessage(sender.tab.id, request_body);
                    context.loading();
                });
            } else {

                let request_body = {}
                request_body[`${context.identity_prefix}_totp`] = true;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                context.loading();
            }
        });
        $(`#${context.identity_prefix}_sms_button`).click(() => {
            if (document.querySelector(`#${context.identity_prefix}`).getAttribute("method") == "") {
                document.querySelector(`#${context.identity_prefix}`).setAttribute("method", "sms")
            }
            let request_body = {}
            request_body[`${context.identity_prefix}_sms`] = true;
            chrome.tabs.sendMessage(sender.tab.id, request_body);
            context.loading();
        });
    }

    change_method(sender, request, context) {
        if(request.method_enabled == document.querySelector(`#${context.identity_prefix}`).getAttribute("method")){
            context.finished(sender, request, context)
        } else {
            if(request.method_enabled == "sms"){
                $(`#${context.identity_prefix}_ui_div`).html(
                    `
                    <div class="row m-0 pt-2">
                        <div class="col">
                            <img src="images/selectmethod.svg" style="height: 100px; width:100px;">
                        </div>
                    </div>
                    <div class="row m-0 pl-2 pr-2 pb-2 pt-2">
                        <div class="col">
                            <h4> You are currently using SMS to receive verification codes for this account. Do you want to use a different method? </h4>
                        </div>
                    </div>
                    <div class="row m-0">
                        
                        <div class="col-6 p-2">
                            <button class="btn-sm btn-danger" id="${context.identity_prefix}_cancel_button"> Keep Using SMS </button> 
                        </div>
                        <div class="col-6 p-2">
                            <button class="btn-sm btn-success" id="${context.identity_prefix}_continue_button"> Change Method </button> 
                        </div>
                    </div>    
                    `
                );
                document.querySelector(`#website_progress_bar`).setAttribute("style", "width:40%")
                document.querySelector(`#website_progress_bar`).setAttribute("aria-valuenow", "40")
            } else {
                $(`#${context.identity_prefix}_ui_div`).html(
                    `
                    <div class="row m-0 pt-2">
                        <div class="col">
                            <img src="images/selectmethod.svg" style="height: 100px; width:100px;">
                        </div>
                    </div>
                    <div class="row m-0 pl-2 pr-2 pb-2 pt-2">
                        <div class="col">
                            <h4> You are currently using an authenticator app to receive verification codes for this account. Do you want to use a different method? </h4>
                        </div>
                    </div>
                    <div class="row m-0">
                        <div class="col-6 p-2">
                            <button class="btn-sm btn-danger" id="${context.identity_prefix}_cancel_button"> Keep Using App </button> 
                        </div>
                        <div class="col-6 p-2">
                            <button class="btn-sm btn-success" id="${context.identity_prefix}_continue_button"> Change Method </button> 
                        </div>
                    </div>
        
                    `
                );
                document.querySelector(`#website_progress_bar`).setAttribute("style", "width:40%")
                document.querySelector(`#website_progress_bar`).setAttribute("aria-valuenow", "40")
            }
        
    
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
}

class AmazonUI extends AutomationSiteUI {
    constructor(name, identity_prefix, logo_file, controller, start_url) {
        super(name, identity_prefix, logo_file, controller, start_url);
        this.register_handler("approve_login", this.approve_login);
    }

    approve_login(sender, request, context) {
        $(`#${context.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}

            <div class="row m-0 pt-2">
                <div class="col">
                    <img src="images/smsfirst.svg" style="height: 170px; width:200px;">
                </div>
            </div>
                <div class="row m-0 pl-2 pr-2 pb-2 pt-2">
                    <div class="col">
                        <p>  <p>
                        Amazon requires that you approve your login attempts manually each time you sign in.
                        To do this, please follow the link sent to your phone and email.
                        There, click "Approve". This page will update in a few seconds.
                    </p> </p>
                    </div>
                </div>
            
           
            `
        );
    }
}


class YahooUI extends AutomationSiteUI {
    constructor(name, identity_prefix, logo_file, controller, start_url) {
        super(name, identity_prefix, logo_file, controller, start_url);
        this.register_handler("complete_captcha", this.complete_captcha);
    }

    complete_captcha(sender, request, context) {
        $(`#${context.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}

            <div class="row m-0 pt-2">
                <div class="col">
                    <img src="images/robot.svg" style="height: 103px; width:225px;">
                </div>
            </div>
                <div class="row m-0 pl-2 pr-2 pb-2 pt-2">
                    <div class="col">
                        <p> Yahoo requires that you prove that you're not a robot before continuing.
                        To complete this check please click the next button. </p>
                    </div>
                </div>
                <div class="row m-0">
                    <button class="btn btn-success" id="${context.identity_prefix}_continue_button">Continue</button>
                </div>
            `
        );
        $(`#${context.identity_prefix}_continue_button`).click(() => {
            chrome.windows.update(sender.tab.windowId, { state: 'normal' });
        });
    }
}

class GoogleUI extends AutomationSiteUI {
    constructor(name, identity_prefix, logo_file, controller, start_url) {
        super(name, identity_prefix, logo_file, controller, start_url);
        this.register_handler("finished_check", this.finished_check);
    }
    finished_check(sender, request, context) {
        console.log(request.method);
        console.log(document.querySelector(`#${context.identity_prefix}`).getAttribute("method"));
        if((request.method != document.querySelector(`#${context.identity_prefix}`).getAttribute("method") )&& (document.querySelector(`#${context.identity_prefix}`).getAttribute("method")!= "")){
            console.log("either methods are the same or method is not null")
            $(`#${context.identity_prefix}_ui_div`).html(
                `

                    <div class="row m-0 pt-4">
                        <div class="col">
                            <img src="images/authapp.png" style="height: 200px; width:189px;">
                        </div>
                    </div>
        
                    <div class="row m-0 pl-5 pr-5 pb-0 pt-4">
                        <div class="col">
                            <p> That worked! Ready to enable your authenticator app now? </p>
                        </div>
                    </div>
                        
                    <div class="row m-0 p-2 justify-content-center">
                        <button class="btn-lg btn-success" id="${context.identity_prefix}_continue_button">Continue</button>
                    </div>

                `
            );
            $(`#${context.identity_prefix}_continue_button`).click(() => {
                let request_body = {}
                request_body[`${context.identity_prefix}_totp`] = true;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                context.loading();
            });
            

        
        }  else if(document.querySelector(`#${context.identity_prefix}`).getAttribute("method")==""){
            $(`#${context.identity_prefix}_ui_div`).html(
                `
                <div class="row m-0">
                    <div class="col">
                        <img src="images/selectmethod.svg" style="height: 100px; width:100px;">
                    </div>
                </div>
                <div class="row m-0 pl-5 pr-5 pb-2 pt-2">
                    <div class="col">
                        ${request.message != null ? "<h4> You already have 2FA enabled! </h4>" : "<h4> Lets pick a method to protect your account.</h4>"}
                        
                    </div>
                </div>
                <div class="row m-0">
                    <div class="col-3 pl-1 pr-0 pt-3">
                        <img src="images/authapp.png" style="height: 90px; width: 85px;">
                    </div>
                    <div class="col-5 pl-0 pr-0 pb-1">
                        <p class="text-left mb-0"> <strong style="color: #71CF6F"> Recommended </strong> - <br> Use an app like Google Authenticator to get verification codes.</p>
                    </div>
                    <div class="col-4 pl-0 pt-3">
                        <button class="btn-sm btn-success" id="${context.identity_prefix}_totp_button"> Use Authenticator App <span id = "${context.identity_prefix}_totp_tick" style="display:none"> &#10004</span> </button> 
                    </div>
    
                </div>
                <div class="row m-0 pt-3">
                    <div class="col-3 pl-0 pr-4 pt-0">
                        <img src="images/sms.svg" style="height: 90px; width: 85px;">
                    </div>
                    <div class="col-5 pl-0 pr-0">
                        <p class="text-left">  Use text messages (SMS) to receive verification codes.</p>
                    </div>
                    <div class="col-4 pl-0 pt-2">
                        <button class="btn-sm btn-success" id="${context.identity_prefix}_sms_button"> Use Text Messages <span id = "${context.identity_prefix}_sms_tick" style="display:none"> &#10004</span> </button> 
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
                if(document.querySelector(`#${context.identity_prefix}`).getAttribute("method") == ""){
                    document.querySelector(`#${context.identity_prefix}`).setAttribute("method", "totp")
                }
                if (context.identity_prefix == "google" && !request.sms_already_setup) {
                    $(`#${context.identity_prefix}_ui_div`).html(
                        `
                        <div class="row m-0 pt-0">
                            <div class="col">
                                <img src="images/smsfirst.svg" style="height: 200px; width:170px;">
                            </div>
                        </div>
            
                        <div class="row m-0 pl-5 pr-5 pb-0 pt-0">
                            <div class="col">
                                <p> Before setting up an authenticator app, Google requires you first enable text messages. Let&#39;s do that first. </p>
                            </div>
                        </div>
                            
                        <div class="row m-0 p-2 justify-content-center">
                            <button class="btn-lg btn-success" id="${context.identity_prefix}_continue_button">Continue</button>
                        </div>
                        `
                    );
                    $(`#${context.identity_prefix}_continue_button`).click(() => {
                        let request_body = {}
                        request_body[`${context.identity_prefix}_sms`] = true;
                        chrome.tabs.sendMessage(sender.tab.id, request_body);
                        context.loading();
                    });
                } else {
                    
                    let request_body = {}
                    request_body[`${context.identity_prefix}_totp`] = true;
                    chrome.tabs.sendMessage(sender.tab.id, request_body);
                    context.loading();
                }
            });
            $(`#${context.identity_prefix}_sms_button`).click(() => {
                if(document.querySelector(`#${context.identity_prefix}`).getAttribute("method") == ""){
                    document.querySelector(`#${context.identity_prefix}`).setAttribute("method", "sms")
                }
                let request_body = {}
                request_body[`${context.identity_prefix}_sms`] = true;
                chrome.tabs.sendMessage(sender.tab.id, request_body);
                context.loading();
            });
            
        } else {
            if(document.querySelector("#finished")){
                return;
            } else {
                $(`#${context.identity_prefix}_ui_div`).html(
                    `
    
                    <div class="row m-0 p-2">
                        <div class="col d-flex justify-content-center" id="finished">
                            <img src="images/finishedaccount.svg" style="height:160px; width:225px;">
                        </div>
                    </div>
                    <div class="row m-0 p-2">
                        <div class="col d-flex justify-content-center">
                            <h4>  It worked! Ready to secure your next account?</h4>
                        </div>
                    </div>
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    `
                );
                context.controller.disable_injection(context.identity_prefix);
                context.close_window();
                console.log("In else trying to append");
                console.log(document.querySelector("#next_site_automation"));
                $(`#${context.identity_prefix}_ui_div`).append($(`#next_site_automation`));
                $(`#next_site_automation`).show();
            }
            
        
        }
    }
}

class GithubUI extends AutomationSiteUI {

    complete_captcha(sender, request, context) {
        $(`#${context.identity_prefix}_ui_div`).html(
            `
            ${request.message != null ? "<p>" + request.message + "</p>" : ""}

            <div class="row m-0 pt-2">
                <div class="col">
                    <img src="images/robot.svg" style="height: 103px; width:225px;">
                </div>
            </div>
                <div class="row m-0 pl-2 pr-2 pb-2 pt-2">
                    <div class="col">
                        <p> Github requires that you prove that you're not a robot before continuing.
                        To complete this check please click the next button. </p>
                    </div>
                </div>
                <div class="row m-0">
                    <button class="btn btn-success" id="${context.identity_prefix}_continue_button">Continue</button>
                </div>
            `
        );
        $(`#${context.identity_prefix}_continue_button`).click(() => {
            chrome.windows.update(sender.tab.windowId, { state: 'normal' });
        });
    }
}