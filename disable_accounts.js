var disable_processes = [];
var automationUI = new DisableUI();

$("#disable_accounts_button").click(() => {
    if (!$("#disable_accounts_button").hasClass("disabled")) {
        $("#select_accounts_div").hide();
        $("#disable_accounts_div").show();
        let boxes = $(".checkbox");
        boxes.each((index) => {
            if (boxes[index].checked) {
                service_name = $(boxes[index]).data("service");
                if (service_name === "twitter") {
                    automationUI.add_site(new AutomationSiteUI("Twitter", "twitter", "disable_processes_list", "logos/twitter.svg", automationUI, "https://twitter.com/settings/account/login_verification/enrollment", true));
                } else if (service_name === "reddit") {
                    automationUI.add_site(new AutomationSiteUI("Reddit", "reddit", "disable_processes_list", "logos/reddit.svg", automationUI, "https://www.reddit.com/login"));
                } else if (service_name === "github") {
                    automationUI.add_site(new AutomationSiteUI("GitHub", "github", "disable_processes_list", "logos/github.svg", automationUI, "https://github.com/login"));
                } else if (service_name === "google") {
                    automationUI.add_site(new AutomationSiteUI("Google", "google", "disable_processes_list", "logos/google.svg", automationUI, "https://accounts.google.com/signin"));
                } else if (service_name === "pinterest") {
                    automationUI.add_site(new AutomationSiteUI("Pinterest", "pinterest", "disable_processes_list", "logos/pinterest.svg", automationUI, "https://www.pinterest.com/settings/security"));
                } else if (service_name === "facebook") {
                    automationUI.add_site(new AutomationSiteUI("Facebook", "facebook", "disable_processes_list", "logos/facebook.svg", automationUI, "https://www.facebook.com/security/2fac/setup/intro"));
                } else if (service_name === "amazon") {
                    automationUI.add_site(new AutomationSiteUI("Amazon", "amazon", "disable_processes_list", "logos/amazon.svg", automationUI, "https://www.amazon.com/a/settings/approval/setup/register"));
                } else if (service_name === "yahoo") {
                    automationUI.add_site(new AutomationSiteUI("Yahoo", "yahoo", "disable_processes_list", "logos/yahoo.svg", automationUI, "https://login.yahoo.com/myaccount/security/two-step-verification"));
                } else if (service_name === "dropbox") {
                    automationUI.add_site(new AutomationSiteUI("Dropbox", "dropbox", "disable_processes_list", "logos/dropbox.svg", automationUI, "https://www.dropbox.com/login"));
                } else if (service_name === "linkedin") {
                    automationUI.add_site(new AutomationSiteUI("Linkedin", "linkedin", "disable_processes_list", "logos/linkedin.svg", automationUI, "https://www.linkedin.com/psettings/two-step-verification"));
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
    // chrome.windows.create({
    //         url: "https://twitter.com/settings/account/login_verification/enrollment",
    //         focused: true,
    //         // state: "minimized",
    //         incognito: true
    //     },
    // (window) => {
    //     chrome.windows.update(window.id, { state: "minimized" });
    // }
    //);
    chrome.runtime.onMessage.addListener(
        function twitter__listener(request, sender) {
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
                console.log("Get code")
                if (request.totp_otpauth_url) {
                    // $("#twitter_disable_div").html(
                    //     `
                    //     ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    //     <p>Enter the generated code on your authenticator app</p>
                    //     <div class="row">
                    //         <div class="col-6">
                    //             <input type=text id="twitter_code_input" placeholder="Code">
                    //             <button class="btn btn-success" id="twitter_code_button">Submit</button>
                    //         </div>
                    //         <div class="col-6">
                    //             <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${request.totp_otpauth_url}" style="width: 100%;">
                    //         </div>
                    //     </div>
                    //     `
                    // );
                    // $("#twitter_code_button").click(() => {
                    //     let code = $("#twitter_code_input").val();
                    //     if (code) {
                    //         chrome.tabs.sendMessage(
                    //             sender.tab.id, {
                    //                 twitter_code: true,
                    //                 code: code
                    //             }
                    //         );
                    //     }
                    //     $("#twitter_setup_div").html(`Please wait...`);
                    // });
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
            } else if (request.twitter_totp_disabled) {
                chrome.tabs.remove(sender.tab.id);
                $("#twitter_disable_div").html(`Finished disabling Twitter`);
                disable_injection("twitter", "disable");
                chrome.runtime.onMessage.removeListener(twitter_listener);
            } else if (request.twitter_totp_not_enabled) {
                chrome.tabs.remove(sender.tab.id);
                $("#twitter_disable_div").html(`TOTP has already been removed from your account`);
                disable_injection("twitter", "disable");
                chrome.runtime.onMessage.removeListener(twitter__listener);
            }
        }
    );
}
// END TWITTER

//     chrome.runtime.onMessage.addListener(function twitter_listener(
//         request,
//         sender
//     ) {
//         if (request.twitter_error) {
//             $("#twitter_disable_div").html(request.message);
//             disable_injection("twitter", "disable");
//             chrome.runtime.onMessage.removeListener(twitter_listener);
//         } else if (request.twitter_get_password) {
//             $("#twitter_disable_div").html(
//                 `
//                     ${
//                       request.message != null
//                         ? "<p>" + request.message + "</p>"
//                         : ""
//                     }
//                     <p>Please enter your password</p>
//                     <input type=password id="twitter_password_input">
//                     <button class="btn btn-success" id="twitter_password_button">Submit</button>
//                     `
//             );
//             $("#twitter_password_button").click(() => {
//                 let password = $("#twitter_password_input").val();
//                 if (password) {
//                     chrome.tabs.sendMessage(sender.tab.id, {
//                         twitter_password: true,
//                         password: password,
//                     });
//                 }
//                 $("#twitter_disable_div").html(`Please wait...`);
//             });
//         } else if (request.twitter_finished) {
//             chrome.tabs.remove(sender.tab.id);
//             $("#twitter_disable_div").html(`Finished disabling Twitter`);
//             disable_injection("twitter", "disable");
//             chrome.runtime.onMessage.removeListener(twitter_listener);
//         }
//     });
// }
// // END TWITTER

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
    // chrome.windows.create({
    //         url: "https://www.reddit.com/2fa/enable",
    //         focused: false,
    //         state: "minimized",
    //     },
    //     (window) => {
    //         chrome.windows.update(window.id, { state: "minimized" });
    //     }
    // );

    chrome.runtime.onMessage.addListener(function reddit_listener(
        request,
        sender
    ) {
        if (request.reddit_error) {
            $("#reddit_disable_div").html(request.message);
            disable_injection("reddit", "disable");
            chrome.runtime.onMessage.removeListener(reddit_listener);
        } else if (request.reddit_get_password) {
            $("#reddit_disable_div").html(
                `
                    ${
                      request.message != null
                        ? "<p>" + request.message + "</p>"
                        : ""
                    }
                    <p>Please enter your password</p>
                    <input type=password id="reddit_password_input">
                    <button class="btn btn-success" id="reddit_password_button">Submit</button>
                    `
            );
            $("#reddit_password_button").click(() => {
                let password = $("#reddit_password_input").val();
                if (password) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        reddit_password: true,
                        password: password,
                    });
                }
                $("#reddit_disable_div").html(`Please wait...`);
            });
        } else if (request.reddit_finished) {
            chrome.tabs.remove(sender.tab.id);
            $("#reddit_disable_div").html(`Finished disabling reddit`);
            disable_injection("reddit", "disable");
            chrome.runtime.onMessage.removeListener(reddit_listener);
        }
    });
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
    // chrome.windows.create({
    //         url: "https://github.com/login",
    //         focused: false,
    //         state: "minimized",
    //     },
    //     (window) => {
    //         chrome.windows.update(window.id, { state: "minimized" });
    //     }
    // );

    chrome.runtime.onMessage.addListener(function github_listener(
        request,
        sender
    ) {
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
        } else if (request.github_get_credentials) {
            $("#github_disable_div").html(
                `
                    ${
                      request.message != null
                        ? "<p>" + request.message + "</p>"
                        : ""
                    }
                    <p>Please enter your username and password</p>
                    <input type=text id="github_username_input" placeholder="Username">
                    <input type=password id="github_password_input" placeholder="Password">
                    <button class="btn btn-success" id="github_credentials_button">Submit</button>
                    `
            );
            $("#github_credentials_button").click(() => {
                let username = $("#github_username_input").val();
                let password = $("#github_password_input").val();
                if (password && username) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        github_credentials: true,
                        username: username,
                        password: password,
                    });
                }
                $("#github_disable_div").html(`Please wait...`);
            });
        } else if (request.github_error) {
            chrome.tabs.remove(sender.tab.id);
            $("#github_disable_div").html(request.message);
            disable_injection("github", "disable");
            chrome.runtime.onMessage.removeListener(github_listener);

        } else if (request.github_finished) {
            chrome.tabs.remove(sender.tab.id);
            $("#github_disable_div").html(`Finished disabling GitHub`);
            disable_injection("github", "disable");
            chrome.runtime.onMessage.removeListener(github_listener);
        }
    });
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
    // chrome.windows.create({
    //         url: "https://myaccount.google.com/security",
    //         focused: false,
    //         state: "minimized",
    //     },
    //     (window) => {
    //         chrome.windows.update(window.id, { state: "minimized" });
    //     }
    // );

    chrome.runtime.onMessage.addListener(function google_listener(
        request,
        sender
    ) {
        if (request.google_error) {
            $("#google_disable_div").html(request.message);
            disable_injection("google", "disable");
            chrome.runtime.onMessage.removeListener(google_listener);
        } else if (request.google_get_password) {
            $("#google_disable_div").html(
                `
                    ${
                      request.message != null
                        ? "<p>" + request.message + "</p>"
                        : ""
                    }
                    <p>Please enter your password</p>
                    <input type=password id="google_password_input">
                    <button class="btn btn-success" id="google_password_button">Submit</button>
                    `
            );
            $("#google_password_button").click(() => {
                let password = $("#google_password_input").val();
                if (password) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        google_password: true,
                        password: password,
                    });
                }
                $("#google_disable_div").html(`Please wait...`);
            });
        } else if (request.google_finished) {
            chrome.tabs.remove(sender.tab.id);
            $("#google_disable_div").html(`Finished disabling google`);
            disable_injection("google", "disable");
            chrome.runtime.onMessage.removeListener(google_listener);
        }
    });
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
    // chrome.windows.create({
    //         url: "https://www.facebook.com/security/2fac/settings",
    //         focused: false,
    //         state: "minimized",
    //     },
    //     (window) => {
    //         chrome.windows.update(window.id, { state: "minimized" });
    //     }
    // );

    chrome.runtime.onMessage.addListener(function facebook_listener(
        request,
        sender
    ) {
        console.log("in disable_accountjs", request);
        if (request.facebook_error) {
            $("#facebook_disable_div").html(request.message);
            disable_injection("facebook", "disable");
            chrome.runtime.onMessage.removeListener(facebook_listener);
        } else if (request.facebook_get_password) {
            $("#facebook_disable_div").html(
                `
                    ${
                      request.message != null
                        ? "<p>" + request.message + "</p>"
                        : ""
                    }
                    <p>Please enter your password</p>
                    <input type=password id="facebook_password_input">
                    <button class="btn btn-success" id="facebook_password_button">Submit</button>
                    `
            );
            $("#facebook_password_button").click(() => {
                let password = $("#facebook_password_input").val();
                if (password) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        facebook_password: true,
                        password: password,
                    });
                }
                $("#facebook_disable_div").html(`Please wait...`);
            });
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
        } else if (request.facebook_get_code) {
            $("#facebook_disable_div").html(
                `
                ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                <p>Enter your 2FA code</p>
                <input type=text id="facebook_code_input" placeholder="Code">
                <button class="btn btn-success" id="facebook_code_button">Submit</button>
                `
            );
            $("#facebook_code_button").click(() => {
                let code = $("#facebook_code_input").val();
                if (code) {
                    chrome.tabs.sendMessage(
                        sender.tab.id, {
                            facebook_code: true,
                            code: code
                        }
                    );
                }
                $("#facebook_disable_div").html(`Please wait...`);
            });
        } else if (request.facebook_finished) {
            chrome.tabs.remove(sender.tab.id);
            $("#facebook_disable_div").html(`Finished disabling facebook`);
            disable_injection("facebook", "disable");
            chrome.runtime.onMessage.removeListener(facebook_listener);
        }
    });
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
    // chrome.windows.create({
    //         url: "https://www.amazon.com/a/settings/approval",
    //         focused: false,
    //         state: "minimized",
    //     },
    //     (window) => {
    //         chrome.windows.update(window.id, { state: "minimized" });
    //     }
    // );

    chrome.runtime.onMessage.addListener(function amazon_listener(
        request,
        sender
    ) {
        console.log(request);
        if (request.amazon_disable_error) {
            $("#amazon_disable_div").html(request.message);
            disable_injection("amazon", "disable");
            chrome.runtime.onMessage.removeListener(amazon_listener);
            chrome.tabs.remove(sender.tab.id);
        } else if (request.amazon_get_code) {
            $("#amazon_disable_div").html(
                `
                    ${
                      request.message != null
                        ? "<p>" + request.message + "</p>"
                        : ""
                    }
                    <p>Please enter your 2FA code (either from Google Authenticator or SMS)</p>
                    <input type=text id="amazon_code_input">
                    <button class="btn btn-success" id="amazon_code_button">Submit</button>
                    `
            );
            $("#amazon_code_button").click(() => {
                let code = $("#amazon_code_input").val();
                if (code) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        amazon_code: true,
                        code: code,
                    });
                }
                $("#amazon_disable_div").html(`Please wait...`);
            });
        } else if (request.amazon_get_credentials) {
            $("#amazon_disable_div").html(
                `
                    ${
                      request.message != null
                        ? "<p>" + request.message + "</p>"
                        : ""
                    }
                    <p>Please enter your email and password</p>
                    <input type=text id="amazon_username_input" placeholder="Email">
                    <input type=password id="amazon_password_input" placeholder="Password">
                    <button class="btn btn-success" id="amazon_credentials_button">Submit</button>
                    `
            );
            $("#amazon_credentials_button").click(() => {
                let username = $("#amazon_username_input").val();
                let password = $("#amazon_password_input").val();
                if (password && username) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        amazon_credentials: true,
                        username: username,
                        password: password,
                    });
                }
                $("#amazon_disable_div").html(`Please wait...`);
            });
        } else if (request.amazon_get_email) {
            $("#amazon_disable_div").html(
                `
                    ${
                      request.message != null
                        ? "<p>" + request.message + "</p>"
                        : ""
                    }
                    <p>Please enter your email</p>
                    <input type=text id="amazon_email_input" placeholder="Email">
                    <button class="btn btn-success" id="amazon_email_button">Submit</button>
                    `
            );
            $("#amazon_email_button").click(() => {
                let email = $("#amazon_email_input").val();
                if (email) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        amazon_email: true,
                        email: email,
                    });
                }
                $("#amazon_disable_div").html(`Please wait...`);
            });
        } else if (request.amazon_get_password) {
            if (request.amazon_password_incorrect) {
                console.log("wrong password")
                $("#amazon_disable_div").html(
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
                    $("#amazon_disable_div").html(`Please wait...`);
                });
            } else {
                $("#amazon_disable_div").html(
                    `
                        ${
                          request.message != null
                            ? "<p>" + request.message + "</p>"
                            : ""
                        }
                        <p>Please enter your password</p>
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
                    $("#amazon_disable_div").html(`Please wait...`);
                });
            }

        } else if (request.amazon_finished) {
            // chrome.tabs.remove(sender.tab.id);
            $("#amazon_disable_div").html(`Finished disabling amazon`);
            disable_injection("amazon", "disable");
            chrome.runtime.onMessage.removeListener(amazon_listener);
        } else if (request.amazon_approve_login) {
            console.log("Approve account please");
            $("#amazon_disable_div").html(
                `
                ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                <p>Please approve the request sent to your email and/or phone</p>
                `
            );
        }
    });
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
    // chrome.windows.create({
    //         url: "https://login.yahoo.com/myaccount/security/two-step-verification",
    //         focused: false,
    //         state: "minimized",
    //     },
    //     (window) => {
    //         chrome.windows.update(window.id, { state: "minimized" });
    //     }
    // );

    chrome.runtime.onMessage.addListener(function yahoo_listener(
        request,
        sender
    ) {
        if (request.yahoo_error) {
            if (request.error == "2FA not enabled") {
                $("#yahoo_disable_div").html(`You do not have 2FA enabled on this account`);
            } else {
                $("#yahoo_disable_div").html(request.message);
                disable_injection("yahoo", "disable");
                chrome.runtime.onMessage.removeListener(yahoo_listener);
            }
        } else if (request.yahoo_get_email) {
            $("#yahoo_disable_div").html(
                `
                    ${
                      request.message != null
                        ? "<p>" + request.message + "</p>"
                        : ""
                    }
                    <p>Please enter your email</p>
                    <input type=text id="yahoo_email_input">
                    <button class="btn btn-success" id="yahoo_email_button">Submit</button>
                    `
            );
            $("#yahoo_email_button").click(() => {
                let email = $("#yahoo_email_input").val();
                if (email) {
                    if (request.yahoo_logged_out) {
                        chrome.tabs.sendMessage(sender.tab.id, {
                            yahoo_email: true,
                            email: email,
                            yahoo_logged_out: true
                        });
                    } else {
                        chrome.tabs.sendMessage(sender.tab.id, {
                            yahoo_email: true,
                            email: email,
                        });
                    }
                }
                $("#yahoo_disable_div").html(`Please wait...`);
            });
        } else if (request.yahoo_get_password) {
            $("#yahoo_disable_div").html(
                `
                    ${
                      request.message != null
                        ? "<p>" + request.message + "</p>"
                        : ""
                    }
                    <p>Please enter your password</p>
                    <input type=password id="yahoo_password_input">
                    <button class="btn btn-success" id="yahoo_password_button">Submit</button>
                    `
            );
            $("#yahoo_password_button").click(() => {
                let password = $("#yahoo_password_input").val();
                if (password) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        yahoo_password: true,
                        password: password,
                    });
                }
                $("#yahoo_disable_div").html(`Please wait...`);
            });
        } else if (request.yahoo_get_SMS_code) {
            $("#yahoo_disable_div").html(
                `
                    ${
                      request.message != null
                        ? "<p>" + request.message + "</p>"
                        : ""
                    }
                    <p>Please enter the code sent to your phone</p>
                    <input type=text id="yahoo_SMScode_input">
                    <button class="btn btn-success" id="yahoo_SMScode_button">Submit</button>
                    `
            );
            $("#yahoo_SMScode_button").click(() => {
                let code = $("#yahoo_SMScode_input").val();
                if (code) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        yahoo_SMS_code: true,
                        code: code,
                    });
                }
                $("#yahoo_disable_div").html(`Please wait...`);
            });
        } else if (request.yahoo_get_TOTP_code) {
            $("#yahoo_disable_div").html(
                `
                    ${
                      request.message != null
                        ? "<p>" + request.message + "</p>"
                        : ""
                    }
                    <p>Please enter the code generated by your authenticator app</p>
                    <input type=text id="yahoo_TOTPcode_input">
                    <button class="btn btn-success" id="yahoo_TOTPcode_button">Submit</button>
                    `
            );
            $("#yahoo_TOTPcode_button").click(() => {
                let code = $("#yahoo_TOTPcode_input").val();
                if (code) {
                    chrome.tabs.sendMessage(sender.tab.id, {
                        yahoo_TOTP_code: true,
                        code: code,
                    });
                }
                $("#yahoo_disable_div").html(`Please wait...`);
            });
        } else if (request.yahoo_finished) {
            chrome.tabs.remove(sender.tab.id);
            $("#yahoo_disable_div").html(`Finished disabling yahoo`);
            disable_injection("yahoo", "disable");
            chrome.runtime.onMessage.removeListener(yahoo_listener);
        }
    });
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
    // chrome.windows.create({
    //         url: "https://www.dropbox.com/account/security",
    //         focused: false,
    //         state: "minimized",
    //     },
    //     (window) => {
    //         chrome.windows.update(window.id, { state: "minimized" });
    //     }
    // );

    chrome.runtime.onMessage.addListener(function dropbox_listener(
        request,
        sender
    ) {
        if (request.dropbox_error) {
            $("#dropbox_disable_div").html(
                `
                <p>${request.message}</p>
                `
            );
            chrome.tabs.remove(sender.tab.id);
            disable_injection("dropbox", "disable");
            chrome.runtime.onMessage.removeListener(dropbox_listener);
        } else if (request.dropbox_get_credentials) {
            $("#dropbox_disable_div").html(
                `
                ${request.message != null ? "<p>" + request.message + "</p>" : ""}
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
        } else if (request.dropbox_get_phone) {
            $("#dropbox_disable_div").html(
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
                    $("#dropbox_disable_div").html(`Please wait...`);
                }
            });
        } else if (request.dropbox_get_code) {
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
        } else if (request.dropbox_finished) {
            chrome.tabs.remove(sender.tab.id);
            $("#dropbox_disable_div").html(`Finished disabling Dropbox`);
            disable_injection("dropbox", "disable");
            chrome.runtime.onMessage.removeListener(dropbox_listener);
        }
    });
}
// END DROPBOX

// START LINKEDIN
function initiate_linkedin_disable() {
    $("#disable_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3"><img src="logos/linkedin.svg"></div>
                <div class="col-9">
                    <div id="linkedin_disable_div" class="row"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#linkedin_disable_div").html(`Please wait...`);
    // chrome.windows.create({
    //         url: "https://www.linkedin.com/psettings/two-step-verification",
    //         focused: false,
    //         state: "minimized",
    //     },
    //     (window) => {
    //         chrome.windows.update(window.id, { state: "minimized" });
    //     }
    // );

    chrome.runtime.onMessage.addListener(function linkedin_listener(request, sender) {
        if (request.linkedin_get_code) {
            if (request.linkedin_incorrect_SMS_code) {
                $("#linkedin_disable_div").html(
                    `
                ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                <p style='color:red'> The code you entered is incorrect. Please try again.</p>
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
                    $("#linkedin_disable_div").html(`Please wait...`);
                });
            } else {
                $("#linkedin_disable_div").html(
                    `
                ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                <p> Please enter the code generated by your authenticator app.</p>
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
                    $("#linkedin_disable_div").html(`Please wait...`);
                });
            }

        } else if (request.linkedin_error) {
            $("#linkedin_disable_div").html(
                `
                <p>${request.message}</p>
                `
            );
            chrome.tabs.remove(sender.tab.id);
            disable_injection("linkedin", "disable");
            chrome.runtime.onMessage.removeListener(linkedin_listener);
        } else if (request.linkedin_get_password) {
            $("#linkedin_disable_div").html(
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
                    $("#linkedin_disable_div").html(`Please wait...`);
                }
            });
        } else if (request.linkedin_get_credentials) {
            $("#linkedin_disable_div").html(
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
                    $("#linkedin_disable_div").html(`Please wait...`);
                }
            });
        } else if (request.linkedin_finished) {
            chrome.tabs.remove(sender.tab.id);
            $("#linkedin_disable_div").html(`Finished disabling LinkedIn`);
            disable_injection("linkedin", "disable");
            chrome.runtime.onMessage.removeListener(linkedin_listener);
        }
    });
}
// END LINKEDIN