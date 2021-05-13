var setup_processes = [];

$("#setup_accounts_button").click(() => {
    if (!$("#setup_accounts_button").hasClass("disabled")) {
        $("#select_accounts_div").hide();
        $("#setup_accounts_div").show();
        let boxes = $(".checkbox");
        boxes.each((index) => {
            if (boxes[index].checked) {
                service_name = $(boxes[index]).data("service");
                setup_processes.push(service_name);
                enable_injection(service_name);
                if (service_name === "twitter") {
                    initiate_twitter_setup();
                } else if (service_name === "reddit") {
                    initiate_reddit_setup();
                } else if (service_name === "github") {
                    initiate_github_setup();
                } else if (service_name === "google") {
                    initiate_google_setup();
                } else if (service_name === "pinterest") {
                    initiate_pinterest_setup();
                } else if (service_name === "facebook") {
                    initiate_facebook_setup();
                } else if (service_name === "amazon") {
                    initiate_amazon_setup();
                } else {
                    console.log("Undefined service: '" + service_name + "'");
                }
            }
        });
    }
});

$("#home_button").click(() => {
    for (let service in setup_processes) {
        disable_injection(service);
    }
    setup_processes = [];
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
    chrome.windows.create({
        url: "https://twitter.com/settings/account/login_verification/enrollment",
        focused: false,
        // state: "minimized"
    });

    chrome.runtime.onMessage.addListener(
        function(request, sender) {
            if (request.twitter_logged_in != null) {
                if (request.twitter_logged_in) {
                    $("#twitter_setup_div").html(
                        `
                        <p>Please enter your phone number</p>
                        <input type=text id="twitter_phone_number_input" placeholder="Phone number">
                        <button class="btn btn-success" id="twitter_phone_number_button">Submit</button>
                        `
                    );
                    $("#twitter_phone_number_button").click(function() {
                        let number = $("#twitter_phone_number_input").val();
                        if (number) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    twitter_phone_number: true,
                                    number: number
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
                    $("#twitter_credentials_button").click(function() {
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
            } else if (request.twitter_get_password) {
                $("#twitter_setup_div").html(
                    `
                    <p>Please enter your password</p>
                    <input type=password id="twitter_password_input">
                    <button class="btn btn-success" id="twitter_password_button">Submit</button>
                    `
                );
                $("#twitter_password_button").click(function() {
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
                $("#twitter_setup_div").html(
                    `
                    <p>Please enter the code sent to your phone</p>
                    <input type=text id="twitter_code_input" placeholder="Code">
                    <button class="btn btn-success" id="twitter_code_button">Submit</button>
                    `
                );
                $("#twitter_code_button").click(function() {
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
            } else if (request.twitter_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#twitter_setup_div").html(`Finished setting up Twitter`);
                disable_injection("twitter");
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
    chrome.windows.create({
        url: "https://github.com/settings/two_factor_authentication/verify?",
        focused: false,
        state: "minimized"
    });

    chrome.runtime.onMessage.addListener(
        function(request, sender) {
            if (request.github_logged_in !== null) {
                if (request.github_logged_in) {
                    $("#github_setup_div").html(
                        `
                        <p>Please enter your phone number</p>
                        <input type=text id="github_phone_number_input" placeholder="Phone number">
                        <button class="btn btn-success" id="github_phone_number_button">Submit</button>
                        `
                    );
                    $("#github_phone_number_button").click(function() {
                        let number = $("#github_phone_number_input").val();
                        if (number) {
                            chrome.tabs.sendMessage(
                                sender.tab.id, {
                                    github_phone_number: true,
                                    number: number
                                }
                            );
                            $("#github_setup_div").html(`Please wait...`);
                        }
                    });
                } else {
                    $("#github_setup_div").html(
                        `
                        <p>Please enter your username and password</p>
                        <input type=text id="github_username_input" placeholder="Username">
                        <input type=password id="github_password_input" placeholder="Password">
                        <button class="btn btn-success" id="github_credentials_button">Submit</button>
                        `
                    );
                    $("#github_credentials_button").click(function() {
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
            }
            if (request.github_get_password) {
                $("#github_setup_div").html(
                    `
                    <p>Please enter your password</p>
                    <input type=password id="github_password_input">
                    <button class="btn btn-success" id="github_password_button">Submit</button>
                    `
                );
                $("#github_password_button").click(function() {
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
            }
            if (request.github_get_code) {
                $("#github_setup_div").html(
                    `
                    <p>Please enter the code sent to your phone</p>
                    <input type=text id="github_code_input" placeholder="Code">
                    <button class="btn btn-success" id="github_code_button">Submit</button>
                    `
                );
                $("#github_code_button").click(function() {
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
            if (request.github_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#github_setup_div").html(`Finished setting up Github`);
                disable_injection("github");
            }
        }
    );
}
// END GITHUB

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
    chrome.windows.create({
        url: "https://myaccount.google.com/signinoptions/two-step-verification/enroll-welcome",
        focused: false,
        state: "minimized"
    });


    chrome.runtime.onMessage.addListener(
        function(request, sender) {
            if (request.google_error) {
                $("#google_setup_div").html(
                    `
                    <p>${request.message}</p>
                    `
                );
            } else if (request.google_get_password) {
                $("#google_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your password</p>
                    <input type=password id="google_password_input">
                    <button class="btn btn-success" id="google_password_button">Submit</button>
                    `
                );
                $("#google_password_button").click(function() {
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
            } else if (request.google_get_phone_number) {
                $("#google_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your phone number</p>
                    <input type=text id="google_phone_number_input" placeholder="Phone number">
                    <button class="btn btn-success" id="google_phone_number_button">Submit</button>
                    `
                );
                $("#google_phone_number_button").click(function() {
                    let number = $("#google_phone_number_input").val();
                    if (number) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                google_phone_number: true,
                                number: number
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
                $("#google_code_button").click(function() {
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
            } else if (request.google_get_username) {
                $("#google_setup_div").html(
                    `
                    <p>Please enter your username</p>
                    <input type=text id="google_username_input" placeholder="Username">
                    <button class="btn btn-success" id="google_username_button">Submit</button>
                    `
                );
                $("#google_username_button").click(function() {
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
                $("#google_setup_div").html(`Finished setting up Google`);
                disable_injection("google");
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
    chrome.windows.create({
        url: "https://www.facebook.com/security/2fac/setup/intro",
        focused: false,
        state: "minimized"
    });


    chrome.runtime.onMessage.addListener(
        function(request, sender) {
            if (request.facebook_error) {
                $("#facebook_setup_div").html(
                    `
                    <p>${request.message}</p>
                    `
                );
            } else if (request.facebook_get_password) {
                $("#facebook_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your password</p>
                    <input type=password id="facebook_password_input" placeholder="Password">
                    <button class="btn btn-success" id="facebook_password_button">Submit</button>
                    `
                );
                $("#facebook_password_button").click(function() {
                    let password = $("#facebook_password_input").val();
                    if (password) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                facebook_password: true,
                                password: password
                            }
                        );
                    }
                    $("#facebook_setup_div").html(`Please wait...`);
                });
            } else if (request.facebook_get_phone_number) {
                $("#facebook_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your phone number</p>
                    <input type=text id="facebook_phone_number_input" placeholder="Phone number">
                    <button class="btn btn-success" id="facebook_phone_number_button">Submit</button>
                    `
                );
                $("#facebook_phone_number_button").click(function() {
                    let number = $("#facebook_phone_number_input").val();
                    if (number) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                facebook_phone_number: true,
                                number: number
                            }
                        );
                        $("#facebook_setup_div").html(`Please wait...`);
                    }
                });
            } else if (request.facebook_get_code) {
                $("#facebook_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter the code sent to your phone</p>
                    <input type=text id="facebook_code_input" placeholder="Code">
                    <button class="btn btn-success" id="facebook_code_button">Submit</button>
                    `
                );
                $("#facebook_code_button").click(function() {
                    let code = $("#facebook_code_input").val();
                    if (code) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                facebook_code: true,
                                code: code
                            }
                        );
                    }
                    $("#facebook_setup_div").html(`Please wait...`);
                });
            } else if (request.facebook_get_credentials) {
                $("#facebook_setup_div").html(
                    `
                    <p>Please enter your email and password</p>
                    <input type=text id="facebook_email_input" placeholder="Email">
                    <input type=password id="facebook_password_input" placeholder="Password">
                    <button class="btn btn-success" id="facebook_credentials_button">Submit</button>
                    `
                );
                $("#facebook_credentials_button").click(function() {
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
                $("#facebook_setup_div").html(`Finished setting up Facebook`);
                disable_injection("facebook");
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
    chrome.windows.create({
        url: "https://www.amazon.com/a/settings/approval/setup/register",
        focused: false,
        // state: "minimized"
    });


    chrome.runtime.onMessage.addListener(
        function(request, sender) {
            if (request.amazon_error) {
                $("#amazon_setup_div").html(
                    `
                    <p>${request.message}</p>
                    `
                );
            } else if (request.amazon_get_password) {
                $("#amazon_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your password</p>
                    <input type=password id="amazon_password_input" placeholder="Password">
                    <button class="btn btn-success" id="amazon_password_button">Submit</button>
                    `
                );
                $("#amazon_password_button").click(function() {
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
            } else if (request.amazon_approve_login) {
                $("#amazon_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please approve the request sent to your email and/or phone</p>
                    `
                );
            } else if (request.amazon_get_phone_number) {
                $("#amazon_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your phone number</p>
                    <input type=text id="amazon_phone_number_input" placeholder="Phone number">
                    <button class="btn btn-success" id="amazon_phone_number_button">Submit</button>
                    `
                );
                $("#amazon_phone_number_button").click(function() {
                    let phone_number = $("#amazon_phone_number_input").val();
                    if (phone_number) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                amazon_phone_number: true,
                                phone_number: phone_number
                            }
                        );
                        $("#amazon_setup_div").html(`Please wait...`);
                    }
                });
            } else if (request.amazon_get_email) {
                $("#amazon_setup_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your email address</p>
                    <input type=text id="amazon_email_input" placeholder="Email">
                    <button class="btn btn-success" id="amazon_email_button">Submit</button>
                    `
                );
                $("#amazon_email_button").click(function() {
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
                if (request.totp_url) {
                    $("#amazon_setup_div").html(
                        `
                        ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                        <p>Download Google Authenticator, scan this barcode, and enter the generated code</p>
                        <img src="${request.totp_url}">
                        <input type=text id="amazon_code_input" placeholder="Code">
                        <button class="btn btn-success" id="amazon_code_button">Submit</button>
                        `
                    );
                    $("#amazon_code_button").click(function() {
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
                    $("#amazon_code_button").click(function() {
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
                $("#amazon_credentials_button").click(function() {
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
                $("#amazon_setup_div").html(`Finished setting up amazon`);
                disable_injection("amazon");
            }
        }
    );
}
// END AMAZON