var disable_processes = [];

$("#disable_accounts_button").click(() => {
    if (!$("#disable_accounts_button").hasClass("disabled")) {
        $("#select_accounts_div").hide();
        $("#disable_accounts_div").show();
        let boxes = $(".checkbox");
        boxes.each((index) => {
            if (boxes[index].checked) {
                service_name = $(boxes[index]).data("service");
                disable_processes.push(service_name);
                enable_injection(service_name, "disable");
                if (service_name === "twitter") {
                    initiate_twitter_disable();
                } else if (service_name === "reddit") {
                    initiate_reddit_disable();
                } else if (service_name === "github") {
                    initiate_github_disable();
                } else if (service_name === "google") {
                    initiate_google_disable();
                } else if (service_name === "pinterest") {
                    initiate_pinterest_disable();
                } else if (service_name === "facebook") {
                    initiate_facebook_disable();
                } else if (service_name === "amazon") {
                    initiate_amazon_disable();
                } else if (service_name === "yahoo") {
                    initiate_yahoo_disable();
                } else if (service_name === "dropbox") {
                    initiate_dropbox_disable();
                } else if (service_name === "zoom") {
                    initiate_zoom_disable();
                } else {
                    console.log("Undefined service: '" + service_name + "'");
                }
            }
        });
    }
});

$("#home_button").click(() => {
    for (let service in disable_processes) {
        disable_injection(service, "disable");
    }
    disable_processes = [];
    window.location.href = "popup.html";
});

// START_TWITTER
function initiate_twitter_disable() {
    $("#disable_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/twitter.svg"></div>
                <div class="col-9">
                    <div id="twitter_disable_div" class="row" style="text-align: left;"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#twitter_disable_div").html(`Please wait...`);
    chrome.windows.create({
        url: "https://twitter.com/settings/account/login_verification/enrollment",
        focused: false,
        state: "minimized"
    }, (window) => {
        chrome.windows.update(window.id, { state: 'minimized' });
    });

    chrome.runtime.onMessage.addListener(
        (request, sender) => {
            if (request.twitter_logged_in != null) {
                if (request.twitter_logged_in) {
                    $("#twitter_disable_div").html(
                        `
                        <p>Please enter your phone number</p>
                        <input type=text id="twitter_phone_number_input" placeholder="Phone number">
                        <button class="btn btn-success" id="twitter_phone_number_button">Submit</button>
                        `
                    );
                    $("#twitter_phone_number_button").click(() => {
                        let number = $("#twitter_phone_number_input").val();
                        if (number) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    twitter_phone_number: true,
                                    number: number
                                }
                            );
                            $("#twitter_disable_div").html(`Please wait...`);
                        }
                    });
                } else {
                    $("#twitter_disable_div").html(
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
                            $("#twitter_disable_div").html(`Please wait...`);
                        }
                    });
                }
            } else if (request.twitter_get_type) {
                $("#twitter_disable_div").html(
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
                    $("#twitter_disable_div").html(`Please wait...`);
                });
                $("#twitter_sms_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            twitter_sms: true
                        }
                    );
                    $("#twitter_disable_div").html(`Please wait...`);
                });
            } else if (request.twitter_get_password) {
                $("#twitter_disable_div").html(
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
                    $("#twitter_disable_div").html(`Please wait...`);
                });
            } else if (request.twitter_get_code) {
                if (request.totp_otpauth_url) {
                    $("#twitter_disable_div").html(
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
                        $("#twitter_disable_div").html(`Please wait...`);
                    });
                } else {
                    $("#twitter_disable_div").html(
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
                            $("#twitter_disable_div").html(`Please wait...`);
                        }
                    });
                }
            } else if (request.twitter_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#twitter_disable_div").html(`Finished setting up Twitter`);
                disable_injection("twitter", "disable");
            }
        }
    );
}
// END TWITTER

// START REDDIT
function initiate_reddit_disable() {
    $("#disable_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/reddit.svg"></div>
                <div class="col-9">
                    <div id="reddit_disable_div" class="row" style="text-align: left;"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#reddit_disable_div").html("Please wait...");
    chrome.windows.create({
        url: "https://www.reddit.com/2fa/enable",
        focused: false,
        state: "minimized"
    }, (window) => {
        chrome.windows.update(window.id, { state: 'minimized' });
    });

    chrome.runtime.onMessage.addListener(
        (request, sender) => {
            if (request.reddit_error) {
                $('#reddit_disable_div').html(request.message);
            } else if (request.reddit_get_credentials) {
                $("#reddit_disable_div").html(
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
                        $("#reddit_disable_div").html(`Please wait...`);
                    }
                });
            } else if (request.reddit_get_password) {
                $("#reddit_disable_div").html(
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
                    $("#reddit_disable_div").html(`Please wait...`);
                });
            } else if (request.reddit_get_code) {
                $("#reddit_disable_div").html(
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
                    $("#reddit_disable_div").html(`Please wait...`);
                });
            } else if (request.reddit_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#reddit_disable_div").html(`Finished setting up Reddit`);
                disable_injection("reddit", "disable");
            }
        }
    )
}
// END REDDIT

// START GITHUB
function initiate_github_disable() {
    $("#disable_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/github.svg"></div>
                <div class="col-9">
                    <div id="github_disable_div" class="row" style="text-align: left;"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#github_disable_div").html(`Please wait...`);
    chrome.windows.create({
        url: "https://github.com/settings/two_factor_authentication/verify?",
        focused: false,
        state: "minimized"
    }, (window) => {
        chrome.windows.update(window.id, { state: 'minimized' });
    });

    chrome.runtime.onMessage.addListener(
        (request, sender) => {
            if (request.github_logged_in !== null) {
                if (request.github_logged_in) {
                    $("#github_disable_div").html(
                        `
                        <p>Please enter your phone number</p>
                        <input type=text id="github_phone_number_input" placeholder="Phone number">
                        <button class="btn btn-success" id="github_phone_number_button">Submit</button>
                        `
                    );
                    $("#github_phone_number_button").click(() => {
                        let number = $("#github_phone_number_input").val();
                        if (number) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    github_phone_number: true,
                                    number: number
                                }
                            );
                            $("#github_disable_div").html(`Please wait...`);
                        }
                    });
                } else {
                    $("#github_disable_div").html(
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
                            $("#github_disable_div").html(`Please wait...`);
                        }
                    });
                }
            }
            if (request.github_get_password) {
                $("#github_disable_div").html(
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
                    $("#github_disable_div").html(`Please wait...`);
                });
            }
            if (request.github_get_code) {
                $("#github_disable_div").html(
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
                    $("#github_disable_div").html(`Please wait...`);
                });
            }
            if (request.github_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#github_disable_div").html(`Finished setting up Github`);
                disable_injection("github", "disable");
            }
        }
    );
}
// END GITHUB

// START GOOGLE
function initiate_google_disable() {
    $("#disable_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/google.svg"></div>
                <div class="col-9">
                    <div id="google_disable_div" class="row" style="text-align: left;"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#google_disable_div").html(`Please wait...`);
    chrome.windows.create({
        url: "https://myaccount.google.com/signinoptions/two-step-verification/enroll-welcome",
        focused: false,
        state: "minimized"
    }, (window) => {
        chrome.windows.update(window.id, { state: 'minimized' });
    });

    chrome.runtime.onMessage.addListener(
        (request, sender) => {
            if (request.google_error) {
                $("#google_disable_div").html(
                    `
                    <p>${request.message}</p>
                    `
                );
                disable_injection("google", "disable");
            } else if (request.google_get_password) {
                $("#google_disable_div").html(
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
                    $("#google_disable_div").html(`Please wait...`);
                });
            } else if (request.google_get_phone_number) {
                $("#google_disable_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your phone number</p>
                    <input type=text id="google_phone_number_input" placeholder="Phone number">
                    <button class="btn btn-success" id="google_phone_number_button">Submit</button>
                    `
                );
                $("#google_phone_number_button").click(() => {
                    let number = $("#google_phone_number_input").val();
                    if (number) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                google_phone_number: true,
                                number: number
                            }
                        );
                        $("#google_disable_div").html(`Please wait...`);
                    }
                });
            } else if (request.google_get_code) {
                $("#google_disable_div").html(
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
                    $("#google_disable_div").html(`Please wait...`);
                });
            } else if (request.google_get_totp_code) {
                $("#google_disable_div").html(
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
                    $("#google_disable_div").html(`Please wait...`);
                });
            } else if (request.google_get_username) {
                $("#google_disable_div").html(
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
                        $("#google_disable_div").html(`Please wait...`);
                    }
                });
            } else if (request.google_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#google_disable_div").html(`Finished setting up Google`);
                disable_injection("google", "disable");
            } else if (request.google_backup) {
                $("#google_disable_div").html(
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
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            google_start_backup: true
                        }
                    );
                    $("#google_disable_div").html(`Please wait...`);
                });
                $("#google_no_button").click(() => {
                    chrome.tabs.remove(sender.tab.id);
                    $("#google_disable_div").html(`Finished setting up Google`);
                    disable_injection("google", "disable");
                });
            }
        }
    );
}
// END GOOGLE

// START_PINTEREST
function initiate_pinterest_disable() {
    $("#disable_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/pinterest.svg"></div>
                <div class="col-9">
                    <div id="pinterest_disable_div" class="row" style="text-align: left;"></div>
                </div>
            </div>
        </div>
        `
    );
}
// END PINTEREST

// START FACEBOOK
function initiate_facebook_disable() {
    $("#disable_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/facebook.svg"></div>
                <div class="col-9">
                    <div id="facebook_disable_div" class="row"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#facebook_disable_div").html(`Please wait...`);
    chrome.windows.create({
        url: "https://www.facebook.com/security/2fac/disable/intro",
        focused: false,
        state: "minimized"
    }, (window) => {
        chrome.windows.update(window.id, { state: 'minimized' });
    });

    chrome.runtime.onMessage.addListener(
        (request, sender) => {
            if (request.facebook_error) {
                $("#facebook_disable_div").html(
                    `
                    <p>${request.message}</p>
                    `
                );
                disable_injection("facebook", "disable");
            } else if (request.facebook_get_type) {
                $("#facebook_disable_div").html(
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
                    $("#facebook_disable_div").html(`Please wait...`);
                });
                $("#facebook_sms_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            facebook_start_sms: true
                        }
                    );
                    $("#facebook_disable_div").html(`Please wait...`);
                });
            } else if (request.facebook_get_password) {
                $("#facebook_disable_div").html(
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
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                facebook_password: true,
                                password: password
                            }
                        );
                    }
                    $("#facebook_disable_div").html(`Please wait...`);
                });
            } else if (request.facebook_get_phone_number) {
                $("#facebook_disable_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your phone number</p>
                    <input type=text id="facebook_phone_number_input" placeholder="Phone number">
                    <button class="btn btn-success" id="facebook_phone_number_button">Submit</button>
                    `
                );
                $("#facebook_phone_number_button").click(() => {
                    let number = $("#facebook_phone_number_input").val();
                    if (number) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                facebook_phone_number: true,
                                number: number
                            }
                        );
                        $("#facebook_disable_div").html(`Please wait...`);
                    }
                });
            } else if (request.facebook_get_code) {
                if (request.totp_url) {
                    $("#facebook_disable_div").html(
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
                                    code: code
                                }
                            );
                        }
                        $("#facebook_disable_div").html(`Please wait...`);
                    });
                } else {
                    $("#facebook_disable_div").html(
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
                        $("#facebook_disable_div").html(`Please wait...`);
                    });
                }
            } else if (request.facebook_get_credentials) {
                $("#facebook_disable_div").html(
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
                        $("#facebook_disable_div").html(`Please wait...`);
                    }
                });
            } else if (request.facebook_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#facebook_disable_div").html(`Finished setting up Facebook`);
                disable_injection("facebook", "disable");
            }
        }
    );
}
// END FACEBOOK

// START AMAZON
function initiate_amazon_disable() {
    $("#disable_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/amazon.svg"></div>
                <div class="col-9">
                    <div id="amazon_disable_div" class="row"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#amazon_disable_div").html(`Please wait...`);
    chrome.windows.create({
        url: "https://www.amazon.com/a/settings/approval/disable/register",
        focused: false,
        state: "minimized"
    }, (window) => {
        chrome.windows.update(window.id, { state: 'minimized' });
    });

    chrome.runtime.onMessage.addListener(
        (request, sender) => {
            if (request.amazon_error) {
                $("#amazon_disable_div").html(
                    `
                    <p>${request.message}</p>
                    `
                );
                disable_injection("amazon", "disable");
            } else if (request.amazon_get_type) {
                $("#amazon_disable_div").html(
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
                    $("#amazon_disable_div").html(`Please wait...`);
                });
                $("#amazon_sms_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            amazon_start_sms: true
                        }
                    );
                    $("#amazon_disable_div").html(`Please wait...`);
                });
            } else if (request.amazon_get_password) {
                $("#amazon_disable_div").html(
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
                    $("#amazon_disable_div").html(`Please wait...`);
                });
            } else if (request.amazon_approve_login) {
                $("#amazon_disable_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please approve the request sent to your email and/or phone</p>
                    `
                );
            } else if (request.amazon_get_phone_number) {
                $("#amazon_disable_div").html(
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
                                amazon_phone_number: true,
                                phone_number: phone_number
                            }
                        );
                        $("#amazon_disable_div").html(`Please wait...`);
                    }
                });
            } else if (request.amazon_get_email) {
                $("#amazon_disable_div").html(
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
                        $("#amazon_disable_div").html(`Please wait...`);
                    }
                });
            } else if (request.amazon_get_code) {
                if (request.totp_url) {
                    $("#amazon_disable_div").html(
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
                        $("#amazon_disable_div").html(`Please wait...`);
                    });
                } else {
                    $("#amazon_disable_div").html(
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
                        $("#amazon_disable_div").html(`Please wait...`);
                    });
                }
            } else if (request.amazon_get_credentials) {
                $("#amazon_disable_div").html(
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
                        $("#amazon_disable_div").html(`Please wait...`);
                    }
                });
            } else if (request.amazon_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#amazon_disable_div").html(`Finished setting up Amazon`);
                disable_injection("amazon", "disable");
            }
        }
    );
}
// END AMAZON

// START YAHOO
function initiate_yahoo_disable() {
    $("#disable_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/yahoo.svg"></div>
                <div class="col-9">
                    <div id="yahoo_disable_div" class="row"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#yahoo_disable_div").html(`Please wait...`);
    chrome.windows.create({
        url: "https://login.yahoo.com/myaccount/security/two-step-verification",
        focused: false,
        state: "minimized"
    }, (window) => {
        chrome.windows.update(window.id, { state: 'minimized' });
    });

    chrome.runtime.onMessage.addListener(
        (request, sender) => {
            if (request.yahoo_error) {
                $("#yahoo_disable_div").html(
                    `
                    <p>${request.message}</p>
                    `
                );
                chrome.tabs.remove(sender.tab.id);
                disable_injection("yahoo", "disable");
            } else if (request.yahoo_get_email) {
                $("#yahoo_disable_div").html(
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
                        $("#yahoo_disable_div").html(`Please wait...`);
                    }
                });
            } else if (request.yahoo_get_password) {
                $("#yahoo_disable_div").html(
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
                    $("#yahoo_disable_div").html(`Please wait...`);
                });
            } else if (request.yahoo_get_phone_number) {
                $("#yahoo_disable_div").html(
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
                        $("#yahoo_disable_div").html(`Please wait...`);
                    }
                });
            } else if (request.yahoo_get_code) {
                $("#yahoo_disable_div").html(
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
                    $("#yahoo_disable_div").html(`Please wait...`);
                });
            } else if (request.yahoo_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#yahoo_disable_div").html(`Finished setting up Yahoo`);
                disable_injection("yahoo", "disable");
            }
        }
    );
}
// END YAHOO


// START DROPBOX
function initiate_dropbox_disable() {
    $("#disable_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/dropbox.svg"></div>
                <div class="col-9">
                    <div id="dropbox_disable_div" class="row"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#dropbox_disable_div").html(`Please wait...`);
    chrome.windows.create({
        url: "https://www.dropbox.com/account/security",
        focused: false,
        state: "minimized"
    }, (window) => {
        chrome.windows.update(window.id, { state: 'minimized' });
    });

    chrome.runtime.onMessage.addListener(
        (request, sender) => {
            if (request.dropbox_error) {
                $("#dropbox_disable_div").html(
                    `
                    <p>${request.message}</p>
                    `
                );
                chrome.tabs.remove(sender.tab.id);
                disable_injection("dropbox", "disable");
            } else if (request.dropbox_get_credentials) {
                $("#dropbox_disable_div").html(
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
                        $("#dropbox_disable_div").html(`Please wait...`);
                    }
                });
            } else if (request.dropbox_get_password) {
                $("#dropbox_disable_div").html(
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
                    $("#dropbox_disable_div").html(`Please wait...`);
                });
            } else if (request.dropbox_get_phone_number) {
                $("#dropbox_disable_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your phone number</p>
                    <input type=text id="dropbox_phone_number_input" placeholder="Phone number">
                    <button class="btn btn-success" id="dropbox_phone_number_button">Submit</button>
                    `
                );
                $("#dropbox_phone_number_button").click(() => {
                    let number = $("#dropbox_phone_number_input").val();
                    if (number) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                dropbox_phone_number: true,
                                number: number
                            }
                        );
                        $("#dropbox_disable_div").html(`Please wait...`);
                    }
                });
            } else if (request.dropbox_get_code) {
                if (request.totp_secret) {
                    $("#dropbox_disable_div").html(
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
                                    code: code
                                }
                            );
                        }
                        $("#dropbox_disable_div").html(`Please wait...`);
                    });
                } else {
                    $("#dropbox_disable_div").html(
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
                        $("#dropbox_disable_div").html(`Please wait...`);
                    });
                };
            } else if (request.dropbox_get_type) {
                $("#dropbox_disable_div").html(
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
                    $("#dropbox_disable_div").html(`Please wait...`);
                });
                $("#dropbox_sms_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            dropbox_start_sms: true,
                        }
                    );
                    $("#dropbox_disable_div").html(`Please wait...`);
                });
            } else if (request.dropbox_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#dropbox_disable_div").html(`Finished setting up Dropbox`);
                disable_injection("dropbox", "disable");
            }
        }
    );
}
// END DROPBOX

// START ZOOM
function initiate_zoom_disable() {
    $("#disable_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/zoom.svg"></div>
                <div class="col-9">
                    <div id="zoom_disable_div" class="row"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#zoom_disable_div").html(`Please wait...`);
    chrome.windows.create({
        url: "https://zoom.us/profile",
        focused: false,
        state: "minimized"
    }, (window) => {
        chrome.windows.update(window.id, { state: 'minimized' });
    });

    chrome.runtime.onMessage.addListener(
        (request, sender) => {
            if (request.zoom_error) {
                $("#zoom_disable_div").html(
                    `
                    <p>${request.message}</p>
                    `
                );
                chrome.tabs.remove(sender.tab.id);
                disable_injection("zoom", "disable");
            } else if (request.zoom_get_email) {
                $("#zoom_disable_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your email address</p>
                    <input type=text id="zoom_email_input" placeholder="Email">
                    <button class="btn btn-success" id="zoom_email_button">Submit</button>
                    `
                );
                $("#zoom_email_button").click(() => {
                    let email = $("#zoom_email_input").val();
                    if (email) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                zoom_email: true,
                                email: email
                            }
                        );
                        $("#zoom_disable_div").html(`Please wait...`);
                    }
                });
            } else if (request.zoom_get_password) {
                $("#zoom_disable_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your password</p>
                    <input type=password id="zoom_password_input" placeholder="Password">
                    <button class="btn btn-success" id="zoom_password_button">Submit</button>
                    `
                );
                $("#zoom_password_button").click(() => {
                    let password = $("#zoom_password_input").val();
                    if (password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                zoom_password: true,
                                password: password
                            }
                        );
                    }
                    $("#zoom_disable_div").html(`Please wait...`);
                });
            } else if (request.zoom_get_phone_number) {
                $("#zoom_disable_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your phone number</p>
                    <input type=text id="zoom_phone_number_input" placeholder="Phone number">
                    <button class="btn btn-success" id="zoom_phone_number_button">Submit</button>
                    `
                );
                $("#zoom_phone_number_button").click(() => {
                    let number = $("#zoom_phone_number_input").val();
                    if (number) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                zoom_phone_number: true,
                                number: number,
                            }
                        );
                        $("#zoom_disable_div").html(`Please wait...`);
                    }
                });
            } else if (request.zoom_get_code) {
                $("#zoom_disable_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter the code sent to your phone</p>
                    <input type=text id="zoom_code_input" placeholder="Code">
                    <button class="btn btn-success" id="zoom_code_button">Submit</button>
                    `
                );
                $("#zoom_code_button").click(() => {
                    let code = $("#zoom_code_input").val();
                    if (code) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                zoom_code: true,
                                code: code
                            }
                        );
                    }
                    $("#zoom_disable_div").html(`Please wait...`);
                });
            } else if (request.zoom_get_type) {
                $("#zoom_disable_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <div class="row">
                        <div class="col-6">
                            <p>Please choose a type of 2FA to set up</p>
                        </div>
                        <div class="col-6">
                            <button class="btn btn-success" id="zoom_totp_button">TOTP</button>
                            <br><br>
                            <button class="btn btn-success" id="zoom_sms_button">SMS</button>
                        </div>
                    </div>
                    `
                );
                $("#zoom_totp_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            zoom_start_totp: true
                        }
                    );
                    $("#zoom_disable_div").html(`Please wait...`);
                });
                $("#zoom_sms_button").click(() => {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            zoom_start_sms: true
                        }
                    );
                    $("#zoom_disable_div").html(`Please wait...`);
                });
            } else if (request.zoom_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#zoom_disable_div").html(`Finished setting up Zoom`);
                disable_injection("zoom", "disable");
            }
        }
    );
}
// END ZOOM