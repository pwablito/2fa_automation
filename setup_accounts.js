function timer(ms) { return new Promise(res => setTimeout(res, ms)); }

var setup_processes = [];
var automationUI = new SetupUI();
$("#setup_accounts_button").click(() => {
    if (!$("#setup_accounts_button").hasClass("disabled")) {
        $("#select_accounts_div").hide();
        $("#setup_accounts_div").show();
        let sites = [];
        let boxes = $(".checkbox");
        boxes.each((index) => {
            if (boxes[index].checked) {
                service_name = $(boxes[index]).data("service");
                if (service_name === "twitter") {
                    automationUI.add_site(new AutomationSiteUI("Twitter", "twitter", "setup_processes_list", "logos/twitter.svg", automationUI, "https://twitter.com/settings/account/login_verification/enrollment", true));
                } else if (service_name === "reddit") {
                    automationUI.add_site(new AutomationSiteUI("Reddit", "reddit", "setup_processes_list", "logos/reddit.svg", automationUI, "https://www.reddit.com/login"));
                } else if (service_name === "github") {
                    automationUI.add_site(new AutomationSiteUI("GitHub", "github", "setup_processes_list", "logos/github.svg", automationUI, "https://github.com/login"));
                } else if (service_name === "google") {
                    automationUI.add_site(new AutomationSiteUI("Google", "google", "setup_processes_list", "logos/google.svg", automationUI, "https://accounts.google.com/signin"));
                } else if (service_name === "pinterest") {
                    automationUI.add_site(new AutomationSiteUI("Pinterest", "pinterest", "setup_processes_list", "logos/pinterest.svg", automationUI, "https://www.pinterest.com/settings/security"));
                } else if (service_name === "facebook") {
                    automationUI.add_site(new AutomationSiteUI("Facebook", "facebook", "setup_processes_list", "logos/facebook.svg", automationUI, "https://www.facebook.com/security/2fac/setup/intro"));
                } else if (service_name === "amazon") {
                    automationUI.add_site(new AutomationSiteUI("Amazon", "amazon", "setup_processes_list", "logos/amazon.svg", automationUI, "https://www.amazon.com/a/settings/approval/setup/register"));
                } else if (service_name === "yahoo") {
                    automationUI.add_site(new AutomationSiteUI("Yahoo", "yahoo", "setup_processes_list", "logos/yahoo.svg", automationUI, "https://login.yahoo.com/myaccount/security/two-step-verification"));
                } else if (service_name === "dropbox") {
                    automationUI.add_site(new AutomationSiteUI("Dropbox", "dropbox", "setup_processes_list", "logos/dropbox.svg", automationUI, "https://www.dropbox.com/login"));
                } else if (service_name === "linkedin") {
                    automationUI.add_site(new AutomationSiteUI("Linkedin", "linkedin", "setup_processes_list", "logos/linkedin.svg", automationUI, "https://www.linkedin.com/psettings/two-step-verification"));
                } else {
                    throw "Undefined service: '" + service_name + "'";
                }
            }
        });
        automationUI.run();
    }
});

$("#home_button").click(() => {
    automationUI.stop();
    window.location.href = "popup.html";
});

// START_TWITTER
function initiate_twitter_setup() {
    $("#setup_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/twitter.svg"></div>
                <div class="col-9">
                    <div id="twitter_setup_div" class="row" style="text-align: left;"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#twitter_setup_div").html(`Please wait...`);
    // chrome.windows.create({
    //     url: "https://twitter.com/settings/account/login_verification/enrollment",
    //     focused: false,
    //     state: "minimized",
    //     incognito: true
    // }, (window) => {
    //     chrome.windows.update(window.id, { state: 'minimized' });
    // });

    chrome.runtime.onMessage.addListener(
        function twitter_listener(request, sender) {
            if (request.twitter_logged_in != null) {
                if (request.twitter_logged_in) {
                    $("#twitter_setup_div").html(
                        `
                        <p>Please enter your phone number</p>
                        <input type=text id="twitter_phone_number_input" placeholder="Phone number">
                        <button class="btn btn-success" id="twitter_phone_number_button">Submit</button>
                        `
                    );
                    $("#twitter_phone_number_button").click(() => {
                        let phone = $("#twitter_phone_number_input").val();
                        if (phone) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    twitter_phone: true,
                                    phone: phone
                                }
                            );
                            $("#twitter_setup_div").html(`Please wait...`);
                        }
                    });
                } else {
                    $("#twitter_setup_div").html(
                        `
                        <p>Please enter your username and password</p>
                        <input type=text id="twitter_username_input" placeholder="Username">
                        <input type=password id="twitter_password_input" placeholder="Password">
                        <button class="btn btn-success" id="twitter_credentials_button">Submit</button>
                        `
                    );
                    $("#twitter_credentials_button").click(() => {
                        let username = $("#twitter_username_input").val();
                        let password = $("#twitter_password_input").val();
                        if (username && password) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    twitter_credentials: true,
                                    username: username,
                                    password: password
                                }
                            );
                            $("#twitter_setup_div").html(`Please wait...`);
                        }
                    });
                }
            } else if (request.twitter_get_method) {
                $("#twitter_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <div class="row">
                        <div class="col-6">
                            <p>Please choose a type of 2FA to set up</p>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-success" id="twitter_totp_button">TOTP</button>
                            <br><br>
                            <button class="btn btn-success" id="twitter_sms_button">SMS</button>
                        </div>
                    </div>
                    `
                );
                $("#twitter_totp_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            twitter_totp: true
                        }
                    );
                    $("#twitter_setup_div").html(`Please wait...`);
                });
                $("#twitter_sms_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            twitter_sms: true
                        }
                    );
                    $("#twitter_setup_div").html(`Please wait...`);
                });
            } else if (request.twitter_get_password) {
                $("#twitter_setup_div").html(
                    `
                    <p>Please enter your password</p>
                    <input type=password id="twitter_password_input" placeholder="Password">
                    <button class="btn btn-success" id="twitter_password_button">Submit</button>
                    `
                );
                $("#twitter_password_button").click(() => {
                    let password = $("#twitter_password_input").val();
                    if (password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                twitter_password: true,
                                password: password
                            }
                        );
                    }
                    $("#twitter_setup_div").html(`Please wait...`);
                });
            } else if (request.twitter_get_code) {
                if (request.totp_otpauth_url) {
                    //TODO implement this without using an API
                    $("#twitter_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p>Download Google Authenticator, scan this QR code, and enter the generated code</p>
                        <div class="row">
                            <div class="col-6">
                                <input type=text id="twitter_code_input" placeholder="Code">
                                <button class="btn btn-success" id="twitter_code_button">Submit</button>
                            </div>
                            <div class="col-6">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${request.totp_otpauth_url}" style="width: 100%;">
                            </div>
                        </div>
                        `
                    );
                    $("#twitter_code_button").click(() => {
                        let code = $("#twitter_code_input").val();
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    twitter_code: true,
                                    code: code
                                }
                            );
                        }
                        $("#twitter_setup_div").html(`Please wait...`);
                    });
                } else {
                    $("#twitter_setup_div").html(
                        `
                    <p>Please enter the code sent to your phone</p>
                    <input type=text id="twitter_code_input" placeholder="Code">
                    <button class="btn btn-success" id="twitter_code_button">Submit</button>
                    `
                    );
                    $("#twitter_code_button").click(() => {
                        let code = $("#twitter_code_input").val();
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    twitter_code: true,
                                    code: code
                                }
                            );
                            $("#twitter_setup_div").html(`Please wait...`);
                        }
                    });
                }
            } else if (request.twitter_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#twitter_setup_div").html(`Finished setting up Twitter`);
                disable_injection("twitter", "setup");
                chrome.runtime.onMessage.removeListener(twitter_listener);
            }
        }
    );
}
// END TWITTER

// START REDDIT
function initiate_reddit_setup() {
    $("#setup_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/reddit.svg"></div>
                <div class="col-9">
                    <div id="reddit_setup_div" class="row" style="text-align: left;"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#reddit_setup_div").html("Please wait...");
    // chrome.windows.create({
    //     url: "https://www.reddit.com/login/", //"https://www.reddit.com/2fa/enable",
    //     focused: false,
    //     state: "minimized"
    // }, (window) => {
    //     chrome.windows.update(window.id, { state: 'minimized' });
    // });

    chrome.runtime.onMessage.addListener(
        function reddit_listener(request, sender) {
            if (request.reddit_error) {
                $('#reddit_setup_div').html(request.message);
                chrome.tabs.remove(sender.tab.id);
                disable_injection("reddit", "setup");
                chrome.runtime.onMessage.removeListener(reddit_listener);
            } else if (request.reddit_get_credentials) {
                $("#reddit_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your username and password</p>
                    <input type=text id="reddit_username_input" placeholder="Username">
                    <input type=password id="reddit_password_input" placeholder="Password">
                    <button class="btn btn-success" id="reddit_credentials_button">Submit</button>
                    `
                );
                $("#reddit_credentials_button").click(() => {
                    let username = $("#reddit_username_input").val();
                    let password = $("#reddit_password_input").val();
                    if (username && password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                reddit_credentials: true,
                                username: username,
                                password: password
                            }
                        );
                        $("#reddit_setup_div").html(`Please wait...`);
                    }
                });
            } else if (request.reddit_get_password) {
                $("#reddit_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your password</p>
                    <input type=password id="reddit_password_input">
                    <button class="btn btn-success" id="reddit_password_button">Submit</button>
                    `
                );
                $("#reddit_password_button").click(() => {
                    let password = $("#reddit_password_input").val();
                    if (password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                reddit_password: true,
                                password: password
                            }
                        );
                    }
                    $("#reddit_setup_div").html(`Please wait...`);
                });
            } else if (request.reddit_get_code) {
                $("#reddit_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Download Google Authenticator, scan this QR code, and enter the generated code</p>
                    <div class="row">
                        <div class="col-6">
                            <input type=text id="reddit_code_input" placeholder="Code">
                            <button class="btn btn-success" id="reddit_code_button">Submit</button>
                        </div>
                        <div class="col-6">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Reddit?secret=${request.totp_secret}" style="width: 100%;">
                        </div>
                    </div>
                    `
                );
                $("#reddit_code_button").click(() => {
                    let code = $("#reddit_code_input").val();
                    if (code) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                reddit_code: true,
                                code: code
                            }
                        );
                    }
                    $("#reddit_setup_div").html(`Please wait...`);
                });
            } else if (request.reddit_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#reddit_setup_div").html(`Finished setting up Reddit`);
                disable_injection("reddit", "setup");
                chrome.runtime.onMessage.removeListener(reddit_listener);
            }
        }
    );
}
// END REDDIT

// START GITHUB
function initiate_github_setup() {
    $("#setup_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/github.svg"></div>
                <div class="col-9">
                    <div id="github_setup_div" class="row" style="text-align: left;"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#github_setup_div").html(`Please wait...`);
    // chrome.windows.create({
    //     url: "https://github.com/login",
    //     focused: false,
    //     state: "minimized"
    // }, (window) => {
    //     chrome.windows.update(window.id, { state: 'minimized' });
    // });

    chrome.runtime.onMessage.addListener(
        function github_listener(request, sender) {
            if (request.github_log_in !== null) {
                $("#github_setup_div").html(
                    `
                    <p>Please enter your username and password</p>
                    <input type=text id="github_username_input" placeholder="Username">
                    <input type=password id="github_password_input" placeholder="Password">
                    <button class="btn btn-success" id="github_credentials_button">Submit</button>
                    `
                );
                $("#github_credentials_button").click(() => {
                    let username = $("#github_username_input").val();
                    let password = $("#github_password_input").val();
                    if (username && password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                github_credentials: true,
                                username: username,
                                password: password
                            }
                        );
                        $("#github_setup_div").html(`Please wait...`);
                    }
                });

            }
            if (request.github_get_password) {
                $("#github_setup_div").html(
                    `
                    <p>Please enter your password</p>
                    <input type=password id="github_password_input">
                    <button class="btn btn-success" id="github_password_button">Submit</button>
                    `
                );
                $("#github_password_button").click(() => {
                    let password = $("#github_password_input").val();
                    if (password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                github_password: true,
                                password: password
                            }
                        );
                    }
                    $("#github_setup_div").html(`Please wait...`);
                });
            } else if (request.github_get_phone) {
                $("#github_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your phone number</p>
                    <input type=text id="github_phone_number_input" placeholder="Phone number">
                    <button class="btn btn-success" id="github_phone_number_button">Submit</button>
                    `
                );
                $("#github_phone_number_button").click(() => {
                    let phone = $("#github_phone_number_input").val();
                    if (phone) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                github_phone: true,
                                phone: phone
                            }
                        );
                        $("#github_setup_div").html(`Please wait...`);
                    }
                });
            } else if (request.github_get_code) {
                if (request.totp_secret) {
                    $("#github_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p>Download Google Authenticator, scan this QR code, and enter the generated code</p>
                        <div class="row">
                            <div class="col-6">
                                <input type=text id="github_code_input" placeholder="Code">
                                <button class="btn btn-success" id="github_code_button">Submit</button>
                            </div>
                            <div class="col-6">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/github?secret=${request.totp_secret}" style="width: 100%;">
                            </div>
                        </div>
                        `
                    );
                    $("#github_code_button").click(() => {
                        let code = $("#github_code_input").val();
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    github_code: true,
                                    code: code,
                                    totp_secret: request.totp_secret
                                }
                            );
                        }
                        $("#github_setup_div").html(`Please wait...`);
                    });
                } else {
                    $("#github_setup_div").html(
                        `
                        <p>Please enter the code sent to your phone</p>
                        <input type=text id="github_code_input" placeholder="Code">
                        <button class="btn btn-success" id="github_code_button">Submit</button>
                        `
                    );
                    $("#github_code_button").click(() => {
                        let code = $("#github_code_input").val();
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    github_code: true,
                                    code: code
                                }
                            );
                        }
                        $("#github_setup_div").html(`Please wait...`);
                    });
                }
            } else if (request.github_get_method) {
                $("#github_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <div class="row">
                        <div class="col-6">
                            <p>Please choose a type of 2FA to set up</p>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-success" id="github_totp_button">TOTP</button>
                            <br><br>
                            <button class="btn btn-success" id="github_sms_button">SMS</button>
                        </div>
                    </div>
                    `
                );
                $("#github_totp_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            github_start_totp: true
                        }
                    );
                    $("#github_setup_div").html(`Please wait...`);
                });
                $("#github_sms_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            github_start_sms: true,
                        }
                    );
                    $("#github_setup_div").html(`Please wait...`);
                });
            } else if (request.github_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#github_setup_div").html(`Finished setting up Github`);
                disable_injection("github", "setup");
                chrome.runtime.onMessage.removeListener(github_listener);
            }
        }
    );
}
//END GITHUB

// START GOOGLE
function initiate_google_setup() {
    $("#setup_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/google.svg"></div>
                <div class="col-9">
                    <div id="google_setup_div" class="row" style="text-align: left;"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#google_setup_div").html(`Please wait...`);
    // chrome.windows.create({
    //     url: "https://accounts.google.com/signin", //"https://myaccount.google.com/signinoptions/two-step-verification/enroll-welcome",
    //     focused: false,
    //     state: "minimized"
    // }, (window) => {
    //     chrome.windows.update(window.id, { state: 'minimized' });
    // });

    chrome.runtime.onMessage.addListener(
        function google_listener(request, sender) {
            if (request.google_error) {
                $("#google_setup_div").html(
                    `
                    <p>${request.message}</p>
                    `
                );
                disable_injection("google", "setup");
                chrome.runtime.onMessage.removeListener(google_listener);
            } else if (request.google_get_password) {
                $("#google_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your password</p>
                    <input type=password id="google_password_input" placeholder="Password">
                    <button class="btn btn-success" id="google_password_button">Submit</button>
                    `
                );
                $("#google_password_button").click(() => {
                    let password = $("#google_password_input").val();
                    if (password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                google_password: true,
                                password: password
                            }
                        );
                    }
                    $("#google_setup_div").html(`Please wait...`);
                });
            } else if (request.google_get_phone) {
                $("#google_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your phone number</p>
                    <input type=text id="google_phone_number_input" placeholder="Phone number">
                    <button class="btn btn-success" id="google_phone_number_button">Submit</button>
                    `
                );
                $("#google_phone_number_button").click(() => {
                    let phone = $("#google_phone_number_input").val();
                    if (phone) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                google_phone: true,
                                phone: phone
                            }
                        );
                        $("#google_setup_div").html(`Please wait...`);
                    }
                });
            } else if (request.google_get_code) {
                $("#google_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter the code sent to your phone</p>
                    G-<input type=text id="google_code_input" placeholder="Code">
                    <button class="btn btn-success" id="google_code_button">Submit</button>
                    `
                );
                $("#google_code_button").click(() => {
                    let code = $("#google_code_input").val();
                    if (code) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                google_code: true,
                                code: code
                            }
                        );
                    }
                    $("#google_setup_div").html(`Please wait...`);
                });
            } else if (request.google_get_totp_code) {
                $("#google_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    
                    <p>Download Google Authenticator, scan this QR code, and enter the generated code</p>
                    <div class="row">
                        <div class="col-6">
                            <input type=text id="google_code_input" placeholder="Code">
                            <button class="btn btn-success" id="google_code_button">Submit</button>
                        </div>
                        <div class="col-6">
                            <img src="${request.totp_url}" style="width: 100%;">
                        </div>
                    </div>
                    `
                );
                $("#google_code_button").click(() => {
                    let code = $("#google_code_input").val();
                    if (code) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                google_totp_code: true,
                                code: code
                            }
                        );
                    }
                    $("#google_setup_div").html(`Please wait...`);
                });
            } else if (request.google_get_username) {
                $("#google_setup_div").html(
                    `
                    <p>Please enter your username</p>
                    <input type=text id="google_username_input" placeholder="Username">
                    <button class="btn btn-success" id="google_username_button">Submit</button>
                    `
                );
                $("#google_username_button").click(() => {
                    let username = $("#google_username_input").val();
                    if (username) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                google_username: true,
                                username: username
                            }
                        );
                        $("#google_setup_div").html(`Please wait...`);
                    }
                });
            } else if (request.google_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#google_setup_div").html(`
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    Finished setting up Google`);
                disable_injection("google", "setup");
                chrome.runtime.onMessage.removeListener(google_listener);
            } else if (request.google_backup) {
                $("#google_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <div class="row">
                        <div class="col-6">
                            <p>Would you like to set up TOTP as a backup method?</p>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-success" id="google_yes_button">Yes</button>
                            <br><br>
                            <button class="btn btn-success" id="google_no_button">No</button>
                        </div>
                    </div>
                    `
                );
                $("#google_yes_button").click(() => {
                    $("#google_setup_div").html(`Please wait...`);
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            google_start_backup: true
                        }
                    );
                });
                $("#google_no_button").click(() => {
                    chrome.tabs.remove(sender.tab.id);
                    $("#google_setup_div").html(`Finished setting up Google`);
                    disable_injection("google", "setup");
                    chrome.runtime.onMessage.removeListener(google_listener);
                });
            }
        }
    );
}
// END GOOGLE

// START_PINTEREST
function initiate_pinterest_setup() {
    $("#setup_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/pinterest.svg"></div>
                <div class="col-9">
                    <div id="pinterest_setup_div" class="row" style="text-align: left;"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#pinterest_setup_div").html("Please wait...");
    // chrome.windows.create({
    //     url: "https://www.pinterest.com/login/", //"https://www.pinterest.com/settings/security",
    //     focused: false,
    //     state: "minimized",
    // }, (window) => {
    //     chrome.windows.update(window.id, { state: "minimized" });
    // });

    chrome.runtime.onMessage.addListener(
        function pinterest_listener(request, sender) {
            if (request.pinterest_error) {
                $("#pinterest_setup_div").html(
                    `
                    <p>${request.message}</p>
                    `
                );
                disable_injection("pinterest", "setup");
                chrome.runtime.onMessage.removeListener(pinterest_listener);
            } else if (request.pinterest_get_credentials) {
                $("#pinterest_setup_div").html(
                    `
                    <p>Please enter your email and password</p>
                    <input type=text id="pinterest_email_input" placeholder="Email">
                    <input type=password id="pinterest_password_input" placeholder="Password">
                    <button class="btn btn-success" id="pinterest_credentials_button">Submit</button>
                    `
                );
                $("#pinterest_credentials_button").click(() => {
                    let email = $("#pinterest_email_input").val();
                    let password = $("#pinterest_password_input").val();
                    if (email && password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                pinterest_credentials: true,
                                email: email,
                                password: password
                            }
                        );
                        $("#pinterest_setup_div").html(`Please wait...`);
                    }
                });
            }
        }
    );
}
// END PINTEREST

// START FACEBOOK
function initiate_facebook_setup() {
    $("#setup_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/facebook.svg"></div>
                <div class="col-9">
                    <div id="facebook_setup_div" class="row"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#facebook_setup_div").html(`Please wait...`);
    // chrome.windows.create({
    //     url: "https://www.facebook.com/security/2fac/setup/intro", // "https://www.facebook.com", //
    //     focused: false,
    //     state: "minimized"
    // }, (window) => {
    //     chrome.windows.update(window.id, { state: 'minimized' });
    // });

    chrome.runtime.onMessage.addListener(
        function facebook_listener(request, sender) {
            if (request.facebook_error) {
                $("#facebook_setup_div").html(
                    `
                    <p>${request.message}</p>
                    `
                );
                disable_injection("facebook", "setup");
                chrome.runtime.onMessage.removeListener(facebook_listener);
            } else if (request.facebook_get_method) {
                $("#facebook_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <div class="row">
                        <div class="col-6">
                            <p>Please choose a type of 2FA to set up</p>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-success" id="facebook_totp_button">TOTP</button>
                            <br><br>
                            <button class="btn btn-success" id="facebook_sms_button">SMS</button>
                        </div>
                    </div>
                    `
                );
                $("#facebook_totp_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            facebook_start_totp: true
                        }
                    );
                    $("#facebook_setup_div").html(`Please wait...`);
                });
                $("#facebook_sms_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            facebook_start_sms: true
                        }
                    );
                    $("#facebook_setup_div").html(`Please wait...`);
                });
            } else if (request.facebook_get_password) {
                $("#facebook_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your password</p>
                    <input type=password id="facebook_password_input" placeholder="Password">
                    <button class="btn btn-success" id="facebook_password_button">Submit</button>
                    `
                );
                $("#facebook_password_button").click(() => {
                    let password = $("#facebook_password_input").val();
                    if (password) {
                        if (request.facebook_method == "totp") {
                            console.log("Got password now sending message that we are using totp")
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    facebook_password: true,
                                    password: password,
                                    facebook_method: "totp"
                                }
                            );
                        } else {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    facebook_password: true,
                                    password: password
                                }
                            );
                        }

                    }
                    $("#facebook_setup_div").html(`Please wait...`);
                });
            } else if (request.facebook_get_phone) {
                $("#facebook_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your phone number</p>
                    <input type=text id="facebook_phone_number_input" placeholder="Phone number">
                    <button class="btn btn-success" id="facebook_phone_number_button">Submit</button>
                    `
                );
                $("#facebook_phone_number_button").click(() => {
                    let phone = $("#facebook_phone_number_input").val();
                    if (phone) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                facebook_phone: true,
                                phone: phone
                            }
                        );
                        $("#facebook_setup_div").html(`Please wait...`);
                    }
                });
            } else if (request.facebook_get_code) {
                if (request.totp_url) {
                    $("#facebook_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        
                        <p>Download Google Authenticator, scan this QR code, and enter the generated code</p>
                        <div class="row">
                            <div class="col-6">
                                <input type=text id="facebook_code_input" placeholder="Code">
                                <button class="btn btn-success" id="facebook_code_button">Submit</button>
                            </div>
                            <div class="col-6">
                                <img src="${request.totp_url}" style="width: 100%;">
                            </div>
                        </div>
                        `
                    );
                    $("#facebook_code_button").click(() => {
                        let code = $("#facebook_code_input").val();
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    facebook_totp_code: true,
                                    totp_url: request.totp_url,
                                    code: code
                                }
                            );
                        }
                        $("#facebook_setup_div").html(`Please wait...`);
                    });
                } else {
                    $("#facebook_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p>Please enter the code sent to your phone</p>
                        <input type=text id="facebook_code_input" placeholder="Code">
                        <button class="btn btn-success" id="facebook_code_button">Submit</button>
                        `
                    );
                    $("#facebook_code_button").click(() => {
                        let code = $("#facebook_code_input").val();
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    facebook_sms_code: true,
                                    code: code
                                }
                            );
                        }
                        $("#facebook_setup_div").html(`Please wait...`);
                    });
                }
            } else if (request.facebook_get_credentials) {
                $("#facebook_setup_div").html(
                    `
                    <p>Please enter your email and password</p>
                    <input type=text id="facebook_email_input" placeholder="Email">
                    <input type=password id="facebook_password_input" placeholder="Password">
                    <button class="btn btn-success" id="facebook_credentials_button">Submit</button>
                    `
                );
                $("#facebook_credentials_button").click(() => {
                    let email = $("#facebook_email_input").val();
                    let password = $("#facebook_password_input").val();
                    if (email && password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                facebook_credentials: true,
                                email: email,
                                password: password
                            }
                        );
                        $("#facebook_setup_div").html(`Please wait...`);
                    }
                });
            } else if (request.facebook_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#facebook_setup_div").html(`
                ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                Finished setting up Facebook`);
                disable_injection("facebook", "setup");
                chrome.runtime.onMessage.removeListener(facebook_listener);
            }
        }
    );
}
// END FACEBOOK

// START AMAZON
function initiate_amazon_setup() {
    $("#setup_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/amazon.svg"></div>
                <div class="col-9">
                    <div id="amazon_setup_div" class="row"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#amazon_setup_div").html(`Please wait...`);
    // chrome.windows.create({
    //     url: "https://www.amazon.com/a/settings/approval/setup/register",
    //     focused: false,
    //     state: "minimized"
    // }, (window) => {
    //     chrome.windows.update(window.id, { state: 'minimized' });
    // });

    chrome.runtime.onMessage.addListener(
        function amazon_listener(request, sender) {
            if (request.amazon_error) {
                $("#amazon_setup_div").html(
                    `
                    <p>${request.message}</p>
                    `
                );
                disable_injection("amazon", "setup");
                chrome.runtime.onMessage.removeListener(amazon_listener);
            } else if (request.amazon_get_method) {
                $("#amazon_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <div class="row">
                        <div class="col-6">
                            <p>Please choose a type of 2FA to set up</p>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-success" id="amazon_totp_button">TOTP</button>
                            <br><br>
                            <button class="btn btn-success" id="amazon_sms_button">SMS</button>
                        </div>
                    </div>
                    `
                );
                $("#amazon_totp_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            amazon_start_totp: true
                        }
                    );
                    $("#amazon_setup_div").html(`Please wait...`);
                });
                $("#amazon_sms_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            amazon_start_sms: true
                        }
                    );
                    $("#amazon_setup_div").html(`Please wait...`);
                });
            } else if (request.amazon_get_password) {
                if (request.amazon_password_incorrect) {
                    console.log("wrong password")
                    $("#amazon_setup_div").html(
                        `
                            ${
                                request.message != null
                                ? "<p>" + request.message + "</p>"
                                : ""
                            }
                            <p style='color:red'>The password you entered is incorrect. Please try again</p>
                            <input type=password id="amazon_password_input" placeholder="Password">
                            <button class="btn btn-success" id="amazon_password_button">Submit</button>
                            `
                    );
                    $("#amazon_password_button").click(() => {
                        let password = $("#amazon_password_input").val();
                        if (password) {
                            chrome.tabs.sendMessage(sender.tab.id, {
                                amazon_password: true,
                                password: password,
                            });
                        }
                        $("#amazon_setup_div").html(`Please wait...`);
                    });
                } else {
                    $("#amazon_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p>Please enter your password</p>
                        <input type=password id="amazon_password_input" placeholder="Password">
                        <button class="btn btn-success" id="amazon_password_button">Submit</button>
                        `
                    );
                    $("#amazon_password_button").click(() => {
                        let password = $("#amazon_password_input").val();
                        if (password) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    amazon_password: true,
                                    password: password
                                }
                            );
                        }
                        $("#amazon_setup_div").html(`Please wait...`);
                    });
                }

            } else if (request.amazon_approve_login) {
                $("#amazon_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please approve the request sent to your email and/or phone</p>
                    `
                );
            } else if (request.amazon_get_phone) {
                if (request.amazon_invalid_phone_number) {
                    $("#amazon_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p style='color:red'>The phone number you entered is invalid. Please try again</p>
                        <input type=text id="amazon_phone_number_input" placeholder="Phone number">
                        <button class="btn btn-success" id="amazon_phone_number_button">Submit</button>
                        `
                    );
                    $("#amazon_phone_number_button").click(() => {
                        let phone_number = $("#amazon_phone_number_input").val();
                        if (phone_number) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    amazon_phone: true,
                                    phone_number: phone_number
                                }
                            );
                            $("#amazon_setup_div").html(`Please wait...`);
                        }
                    });
                } else {
                    $("#amazon_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p>Please enter your phone number</p>
                        <input type=text id="amazon_phone_number_input" placeholder="Phone number">
                        <button class="btn btn-success" id="amazon_phone_number_button">Submit</button>
                        `
                    );
                    $("#amazon_phone_number_button").click(() => {
                        let phone_number = $("#amazon_phone_number_input").val();
                        if (phone_number) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    amazon_phone: true,
                                    phone_number: phone_number
                                }
                            );
                            $("#amazon_setup_div").html(`Please wait...`);
                        }
                    });
                }

            } else if (request.amazon_get_email) {
                $("#amazon_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your email address</p>
                    <input type=text id="amazon_email_input" placeholder="Email">
                    <button class="btn btn-success" id="amazon_email_button">Submit</button>
                    `
                );
                $("#amazon_email_button").click(() => {
                    let email = $("#amazon_email_input").val();
                    if (email) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                amazon_email: true,
                                email: email
                            }
                        );
                        $("#amazon_setup_div").html(`Please wait...`);
                    }
                });
            } else if (request.amazon_get_code) {
                if (request.amazon_incorrect_sms_code) {
                    console.log("received incorrect sms code message")
                    $("#amazon_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p style='color:red'>The code you entered is incorrect. Please try again</p>
                        <input type=text id="amazon_code_input" placeholder="Code">
                        <button class="btn btn-success" id="amazon_code_button">Submit</button>
                        `
                    );
                    $("#amazon_code_button").click(() => {
                        let code = $("#amazon_code_input").val();
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    amazon_sms_code: true,
                                    code: code
                                }
                            );
                        }
                        $("#amazon_setup_div").html(`Please wait...`);
                    });
                } else if (request.totp_url && request.amazon_incorrect_totp_code) {
                    $("#amazon_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p style='color:red'>The code you entered is incorrect. Please try again</p>
                        <p>Download Google Authenticator, scan this QR code, and enter the generated code</p>
                        <div class="row">
                            <div class="col-6">
                                <input type=text id="amazon_code_input" placeholder="Code">
                                <button class="btn btn-success" id="amazon_code_button">Submit</button>
                            </div>
                            <div class="col-6">
                                <img src="${request.totp_url}" style="width: 100%;">
                            </div>
                        </div>
                        `
                    );
                    $("#amazon_code_button").click(() => {
                        let code = $("#amazon_code_input").val();
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    amazon_totp_code: true,
                                    code: code
                                }
                            );
                        }
                        $("#amazon_setup_div").html(`Please wait...`);
                    });
                } else if (request.totp_url) {
                    $("#amazon_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        
                        <p>Download Google Authenticator, scan this QR code, and enter the generated code</p>
                        <div class="row">
                            <div class="col-6">
                                <input type=text id="amazon_code_input" placeholder="Code">
                                <button class="btn btn-success" id="amazon_code_button">Submit</button>
                            </div>
                            <div class="col-6">
                                <img src="${request.totp_url}" style="width: 100%;">
                            </div>
                        </div>
                        `
                    );
                    $("#amazon_code_button").click(() => {
                        let code = $("#amazon_code_input").val();
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    amazon_totp_code: true,
                                    code: code
                                }
                            );
                        }
                        $("#amazon_setup_div").html(`Please wait...`);
                    });
                } else {
                    $("#amazon_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p>Please enter the code sent to your phone</p>
                        <input type=text id="amazon_code_input" placeholder="Code">
                        <button class="btn btn-success" id="amazon_code_button">Submit</button>
                        `
                    );
                    $("#amazon_code_button").click(() => {
                        let code = $("#amazon_code_input").val();
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    amazon_sms_code: true,
                                    code: code
                                }
                            );
                        }
                        $("#amazon_setup_div").html(`Please wait...`);
                    });
                }
            } else if (request.amazon_get_credentials) {
                $("#amazon_setup_div").html(
                    `
                    <p>Please enter your email and password</p>
                    <input type=text id="amazon_email_input" placeholder="Email">
                    <input type=password id="amazon_password_input" placeholder="Password">
                    <button class="btn btn-success" id="amazon_credentials_button">Submit</button>
                    `
                );
                $("#amazon_credentials_button").click(() => {
                    let email = $("#amazon_email_input").val();
                    let password = $("#amazon_password_input").val();
                    if (email && password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                amazon_credentials: true,
                                email: email,
                                password: password
                            }
                        );
                        $("#amazon_setup_div").html(`Please wait...`);
                    }
                });
            } else if (request.amazon_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#amazon_setup_div").html(`Finished setting up Amazon`);
                disable_injection("amazon", "setup");
                chrome.runtime.onMessage.removeListener(amazon_listener);
            }
        }
    );
}
// END AMAZON

// START YAHOO
function initiate_yahoo_setup() {
    $("#setup_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/yahoo.svg"></div>
                <div class="col-9">
                    <div id="yahoo_setup_div" class="row"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#yahoo_setup_div").html(`Please wait...`);
    // chrome.windows.create({
    //     url: "https://login.yahoo.com/myaccount/security/two-step-verification",
    //     focused: false,
    //     state: "minimized"
    // }, (window) => {
    //     chrome.windows.update(window.id, { state: 'minimized' });
    // });

    chrome.runtime.onMessage.addListener(
        function yahoo_listener(request, sender) {
            if (request.yahoo_error) {
                if (request.message == "recaptcha required") {
                    $("#yahoo_setup_div").html(
                        `

                        <p>Yahoo requires you to prove that you're not a robot. Please complete the recaptcha when the tab opens.</p>
                        `
                    );

                    chrome.windows.update(sender.tab.windowId, { state: 'normal' });
                } else if (request.yahoo_error_code == "incorrectTOTPCode") {
                    if (request.yahoo_error_code == "incorrectTOTPCode") {
                        console.log("Error with code, retrying");
                        if (request.yahoo_totp_url) {
                            $("#yahoo_setup_div").html(
                                `
                            ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                            <p style="color:red;"> The code you entered is not correct. Please try again. </p>
                            <p>Download Google Authenticator, scan this QR code, and enter the generated code</p>
                            <div class="row">
                                <div class="col-6">
                                    <input type=text id="yahoo_code_input" placeholder="Code">
                                    <button class="btn btn-success" id="yahoo_code_button">Submit</button>
                                </div>
                                <div class="col-6">
                                    <img src="${request.yahoo_totp_url}" style="width: 100%;">
                                </div>
                            </div>
                            `
                            );

                            $("#yahoo_code_button").click(() => {
                                let code = $("#yahoo_code_input").val();
                                console.log(code);
                                if (code) {
                                    chrome.tabs.sendMessage(
                                        sender.tab.id, {
                                            yahoo_incorrect_totp: true,
                                            yahoo_code: true,
                                            yahoo_totp: true,
                                            code: code,
                                            totp_url: request.yahoo_totp_url
                                        }
                                    );
                                }
                                $("#yahoo_setup_div").html(`Please wait...`);
                            });
                        }

                    } else if (request.yahoo_incorrect_phone_number) {
                        console.log("Error with phone number, retrying");
                        $("#yahoo_setup_div").html(
                            `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p style='color:red'> The phone number you entered is invalid. Please try again</p>
                        <input type=text id="yahoo_phone_number_input" placeholder="Phone number">
                        <button class="btn btn-success" id="yahoo_phone_number_button">Submit</button>
                        `
                        );
                        $("#yahoo_phone_number_button").click(() => {
                            let number = $("#yahoo_phone_number_input").val();
                            if (number) {
                                chrome.tabs.sendMessage(
                                    sender.tab.id, {
                                        yahoo_phone_number: true,
                                        number: number
                                    }
                                );
                                $("#yahoo_setup_div").html(`Please wait...`);
                            }
                        });

                    } else {
                        $("#yahoo_setup_div").html(
                            `
                        <p>${request.message}</p>
                        `
                        );
                        chrome.tabs.remove(sender.tab.id);
                        disable_injection("yahoo", "setup");
                        chrome.runtime.onMessage.removeListener(yahoo_listener);
                    }

                } else if (request.yahoo_get_email) {
                    $("#yahoo_setup_div").html(
                        `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your email address</p>
                    <input type=text id="yahoo_email_input" placeholder="Email">
                    <button class="btn btn-success" id="yahoo_email_button">Submit</button>
                    `
                    );
                    $("#yahoo_email_button").click(() => {
                        let email = $("#yahoo_email_input").val();
                        if (email) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    yahoo_email: true,
                                    email: email
                                }
                            );
                            $("#yahoo_setup_div").html(`Please wait...`);
                        }
                    });
                } else if (request.yahoo_get_password) {

                    chrome.windows.update(sender.tab.windowId, { state: 'minimized' });
                    $("#yahoo_setup_div").html(
                        `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your password</p>
                    <input type=password id="yahoo_password_input" placeholder="Password">
                    <button class="btn btn-success" id="yahoo_password_button">Submit</button>
                    `
                    );
                    $("#yahoo_password_button").click(() => {
                        let password = $("#yahoo_password_input").val();
                        if (password) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    yahoo_password: true,
                                    password: password
                                }
                            );
                        }
                        $("#yahoo_setup_div").html(`Please wait...`);
                    });
                } else if (request.yahoo_get_phone_number) {
                    $("#yahoo_setup_div").html(
                        `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your phone number</p>
                    <input type=text id="yahoo_phone_number_input" placeholder="Phone number">
                    <button class="btn btn-success" id="yahoo_phone_number_button">Submit</button>
                    `
                    );
                    $("#yahoo_phone_number_button").click(() => {
                        let number = $("#yahoo_phone_number_input").val();
                        if (number) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    yahoo_phone_number: true,
                                    number: number
                                }
                            );
                            $("#yahoo_setup_div").html(`Please wait...`);
                        }
                    });
                } else if (request.yahoo_get_code) {
                    if (request.yahoo_totp_url) {
                        $("#yahoo_setup_div").html(
                            `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p>Download Google Authenticator, scan this QR code, and enter the generated code</p>
                        <div class="row">
                            <div class="col-6">
                                <input type=text id="yahoo_code_input" placeholder="Code">
                                <button class="btn btn-success" id="yahoo_code_button">Submit</button>
                            </div>
                            <div class="col-6">
                                <img src="${request.yahoo_totp_url}" style="width: 100%;">
                            </div>
                        </div>
                        `
                        );

                        $("#yahoo_code_button").click(() => {
                            let code = $("#yahoo_code_input").val();
                            console.log(code);
                            if (code) {
                                chrome.tabs.sendMessage(
                                    sender.tab.id, {
                                        yahoo_code: true,
                                        yahoo_totp: true,
                                        code: code,
                                        totp_url: request.yahoo_totp_url
                                    }
                                );
                            }
                            $("#yahoo_setup_div").html(`Please wait...`);
                        });
                    } else {
                        $("#yahoo_setup_div").html(
                            `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p>Please enter the code sent to your phone</p>
                        <input type=text id="yahoo_code_input" placeholder="Code">
                        <button class="btn btn-success" id="yahoo_code_button">Submit</button>
                        `
                        );
                        $("#yahoo_code_button").click(() => {
                            let code = $("#yahoo_code_input").val();
                            if (code) {
                                chrome.tabs.sendMessage(
                                    sender.tab.id, {
                                        yahoo_code: true,
                                        code: code
                                    }
                                );
                            }
                            $("#yahoo_setup_div").html(`Please wait...`);
                        });
                    }

                } else if (request.yahoo_get_method) {
                    $("#yahoo_setup_div").html(
                        `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <div class="row">
                        <div class="col-6">
                            <p>Please choose a type of 2FA to set up</p>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-success" id="yahoo_totp_button">TOTP</button>
                            <br><br>
                            <button class="btn btn-success" id="yahoo_sms_button">SMS</button>
                        </div>
                    </div>
                    `
                    );
                    $("#yahoo_totp_button").click(() => {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                yahoo_start_totp: true
                            }
                        );
                        $("#yahoo_setup_div").html(`Please wait...`);
                    });
                    $("#yahoo_sms_button").click(() => {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                yahoo_start_sms: true,
                            }
                        );
                        $("#yahoo_setup_div").html(`Please wait...`);
                    });
                } else if (request.yahoo_finished) {
                    chrome.tabs.remove(sender.tab.id);
                    $("#yahoo_setup_div").html(`Finished setting up Yahoo`);
                    disable_injection("yahoo", "setup");
                    chrome.runtime.onMessage.removeListener(yahoo_listener);
                }
            }
        }
    );
}
// END YAHOO


// START DROPBOX
function initiate_dropbox_setup() {
    $("#setup_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/dropbox.svg"></div>
                <div class="col-9">
                    <div id="dropbox_setup_div" class="row"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#dropbox_setup_div").html(`Please wait...`);
    // chrome.windows.create({
    //     url: "https://www.dropbox.com/login", //"https://www.dropbox.com/account/security",
    //     focused: false,
    //     state: "minimized"
    // }, (window) => {
    //     chrome.windows.update(window.id, { state: 'minimized' });
    // });

    chrome.runtime.onMessage.addListener(
        function dropbox_listener(request, sender) {
            if (request.dropbox_error) {
                $("#dropbox_setup_div").html(
                    `
                    <p>${request.message}</p>
                    `
                );
                chrome.tabs.remove(sender.tab.id);
                disable_injection("dropbox", "setup");
                chrome.runtime.onMessage.removeListener(dropbox_listener);
            } else if (request.dropbox_get_credentials) {
                $("#dropbox_setup_div").html(
                    `
                    <p>Please enter your username and password</p>
                    <input type=text id="dropbox_username_input" placeholder="Username">
                    <input type=password id="dropbox_password_input" placeholder="Password">
                    <button class="btn btn-success" id="dropbox_credentials_button">Submit</button>
                    `
                );
                $("#dropbox_credentials_button").click(() => {
                    let username = $("#dropbox_username_input").val();
                    let password = $("#dropbox_password_input").val();
                    if (username && password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                dropbox_credentials: true,
                                username: username,
                                password: password
                            }
                        );
                        $("#dropbox_setup_div").html(`Please wait...`);
                    }
                });
            } else if (request.dropbox_get_password) {
                $("#dropbox_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your password</p>
                    <input type=password id="dropbox_password_input" placeholder="Password">
                    <button class="btn btn-success" id="dropbox_password_button">Submit</button>
                    `
                );
                $("#dropbox_password_button").click(() => {
                    let password = $("#dropbox_password_input").val();
                    if (password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                dropbox_password: true,
                                password: password
                            }
                        );
                    }
                    $("#dropbox_setup_div").html(`Please wait...`);
                });
            } else if (request.dropbox_get_phone) {
                $("#dropbox_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your phone number</p>
                    <input type=text id="dropbox_phone_number_input" placeholder="Phone number">
                    <button class="btn btn-success" id="dropbox_phone_number_button">Submit</button>
                    `
                );
                $("#dropbox_phone_number_button").click(() => {
                    let phone = $("#dropbox_phone_number_input").val();
                    if (phone) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                dropbox_phone: true,
                                phone: phone
                            }
                        );
                        $("#dropbox_setup_div").html(`Please wait...`);
                    }
                });
            } else if (request.dropbox_get_code) {
                if (request.totp_secret) {
                    $("#dropbox_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p>Download Google Authenticator, scan this QR code, and enter the generated code</p>
                        <div class="row">
                            <div class="col-6">
                                <input type=text id="dropbox_code_input" placeholder="Code">
                                <button class="btn btn-success" id="dropbox_code_button">Submit</button>
                            </div>
                            <div class="col-6">
                                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Dropbox?secret=${request.totp_secret}" style="width: 100%;">
                            </div>
                        </div>
                        `
                    );
                    $("#dropbox_code_button").click(() => {
                        let code = $("#dropbox_code_input").val();
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    dropbox_code: true,
                                    code: code,
                                    totp_secret: request.totp_secret
                                }
                            );
                        }
                        $("#dropbox_setup_div").html(`Please wait...`);
                    });
                } else {
                    $("#dropbox_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p>Please enter the code sent to your phone</p>
                        <input type=text id="dropbox_code_input" placeholder="Code">
                        <button class="btn btn-success" id="dropbox_code_button">Submit</button>
                        `
                    );
                    $("#dropbox_code_button").click(() => {
                        let code = $("#dropbox_code_input").val();
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    dropbox_code: true,
                                    code: code
                                }
                            );
                        }
                        $("#dropbox_setup_div").html(`Please wait...`);
                    });
                };
            } else if (request.dropbox_get_method) {
                $("#dropbox_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <div class="row">
                        <div class="col-6">
                            <p>Please choose a type of 2FA to set up</p>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-success" id="dropbox_totp_button">TOTP</button>
                            <br><br>
                            <button class="btn btn-success" id="dropbox_sms_button">SMS</button>
                        </div>
                    </div>
                    `
                );
                $("#dropbox_totp_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            dropbox_start_totp: true
                        }
                    );
                    $("#dropbox_setup_div").html(`Please wait...`);
                });
                $("#dropbox_sms_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            dropbox_start_sms: true,
                        }
                    );
                    $("#dropbox_setup_div").html(`Please wait...`);
                });
            } else if (request.dropbox_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#dropbox_setup_div").html(`
                ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                Finished setting up Dropbox`);
                disable_injection("dropbox", "setup");
                chrome.runtime.onMessage.removeListener(dropbox_listener);
            }
        }
    );
}
// END DROPBOX

// START LINKEDIN
function initiate_linkedin_setup() {
    $("#setup_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/linkedin.svg"></div>
                <div class="col-9">
                    <div id="linkedin_setup_div" class="row"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#linkedin_setup_div").html(`Please wait...`);
    // chrome.windows.create({
    //     url: "https://www.linkedin.com/psettings/two-step-verification",
    //     focused: false,
    //     state: "minimized"
    // }, (window) => {
    //     chrome.windows.update(window.id, { state: 'minimized' });
    // });

    chrome.runtime.onMessage.addListener(
        function linkedin_listener(request, sender) {
            if (request.linkedin_error) {
                $("#linkedin_setup_div").html(
                    `
                    <p>${request.message}</p>
                    `
                );
                chrome.tabs.remove(sender.tab.id);
                disable_injection("linkedin", "setup");
                chrome.runtime.onMessage.removeListener(linkedin_listener);
            } else if (request.linkedin_get_code) {
                if (request.linkedin_incorrect_SMS_code) {
                    $("#linkedin_setup_div").html(
                        `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p style="color:red;"> The code you entered is not correct. Please try again. </p>
                    <input type=text id="linkedin_code_input" placeholder="Code">
                    <button class="btn btn-success" id="linkedin_code_button">Submit</button>
                    `
                    );
                    $("#linkedin_code_button").click(() => {
                        let code = $("#linkedin_code_input").val();
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    linkedin_code: true,
                                    code: code
                                }
                            );
                        }
                        $("#linkedin_setup_div").html(`Please wait...`);
                    });
                } else if (request.linkedin_incorrect_TOTP_code) {
                    console.log("Invalid totp code");
                    $("#linkedin_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p style="color:red;"> The code you entered is not correct. Please try again. </p>
                        <p>Download Google Authenticator, scan this QR code, and enter the generated code</p>
                        <div class="row">
                            <div class="col-6">
                                <input type=text id="linkedin_code_input" placeholder="Code">
                                <button class="btn btn-success" id="linkedin_code_button">Submit</button>
                            </div>
                            <div class="col-6">
                                <img src="${request.totp_url}" style="width: 100%;">
                            </div>
                        </div>
                        `
                    );
                    $("#linkedin_code_button").click(() => {
                        let code = $("#linkedin_code_input").val();
                        console.log(code);
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    linkedin_code: true,
                                    code: code
                                }
                            );
                        }
                        $("#linkedin_setup_div").html(`Please wait...`);
                    });
                } else if (request.totp_url) {
                    $("#linkedin_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p>Download Google Authenticator, scan this QR code, and enter the generated code</p>
                        <div class="row">
                            <div class="col-6">
                                <input type=text id="linkedin_code_input" placeholder="Code">
                                <button class="btn btn-success" id="linkedin_code_button">Submit</button>
                            </div>
                            <div class="col-6">
                                <img src="${request.totp_url}" style="width: 100%;">
                            </div>
                        </div>
                        `
                    );
                    $("#linkedin_code_button").click(() => {
                        let code = $("#linkedin_code_input").val();
                        console.log(code);
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    linkedin_code: true,
                                    code: code
                                }
                            );
                        }
                        $("#linkedin_setup_div").html(`Please wait...`);
                    });
                } else {

                    $("#linkedin_setup_div").html(
                        `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter the code sent to your phone</p>
                    <input type=text id="linkedin_code_input" placeholder="Code">
                    <button class="btn btn-success" id="linkedin_code_button">Submit</button>
                    `
                    );
                    $("#linkedin_code_button").click(() => {
                        let code = $("#linkedin_code_input").val();
                        if (code) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    linkedin_code: true,
                                    code: code
                                }
                            );
                        }
                        $("#linkedin_setup_div").html(`Please wait...`);
                    });
                }
            } else if (request.linkedin_get_password) {
                $("#linkedin_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your password</p>
                    <input type=password id="linkedin_password_input" placeholder="Password">
                    <button class="btn btn-success" id="linkedin_password_button">Submit</button>
                    `
                );
                $("#linkedin_password_button").click(() => {
                    let password = $("#linkedin_password_input").val();
                    if (password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                linkedin_password: true,
                                password: password
                            }
                        );
                        $("#linkedin_setup_div").html(`Please wait...`);
                    }
                });
            } else if (request.linkedin_incorrect_password) {
                $("#linkedin_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p style="color:red;">That password was incorrect. Please enter your password again </p>
                    <input type=password id="linkedin_password_input" placeholder="Password">
                    <button class="btn btn-success" id="linkedin_password_button">Submit</button>
                    `
                );
                $("#linkedin_password_button").click(() => {
                    let password = $("#linkedin_password_input").val();
                    if (password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                linkedin_password: true,
                                password: password
                            }
                        );
                        $("#linkedin_setup_div").html(`Please wait...`);
                    }
                });
            } else if (request.linkedin_get_credentials) {
                $("#linkedin_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your email and password</p>
                    <input type=text id="linkedin_email_input" placeholder="Email">
                    <input type=password id="linkedin_password_input" placeholder="Password">
                    <button class="btn btn-success" id="linkedin_credentials_button">Submit</button>
                    `
                );
                $("#linkedin_credentials_button").click(() => {
                    let email = $("#linkedin_email_input").val();
                    let password = $("#linkedin_password_input").val();
                    if (email && password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                linkedin_credentials: true,
                                password: password,
                                username: email
                            }
                        );
                        $("#linkedin_setup_div").html(`Please wait...`);
                    }
                });
            } else if (request.linkedin_get_method) {
                $("#linkedin_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <div class="row">
                        <div class="col-6">
                            <p>Please choose a type of 2FA to set up</p>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-success" id="linkedin_totp_button">TOTP</button>
                            <br><br>
                            <button class="btn btn-success" id="linkedin_sms_button">SMS</button>
                        </div>
                    </div>
                    `
                );
                $("#linkedin_totp_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            linkedin_start_totp: true
                        }
                    );
                    $("#linkedin_setup_div").html(`Please wait...`);
                });
                $("#linkedin_sms_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            linkedin_start_sms: true
                        }
                    );
                    $("#linkedin_setup_div").html(`Please wait...`);
                });
            } else if (request.linkedin_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#linkedin_setup_div").html(`Finished enabling LinkedIn`);
                disable_injection("linkedin", "setup");
                chrome.runtime.onMessage.removeListener(linkedin_listener);
            }
        });
}
// END LINKEDIN
