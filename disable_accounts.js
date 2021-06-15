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
            if (request.twitter_error) {
                $('#twitter_disable_div').html(request.message);
            } else if (request.twitter_get_password) {
                $("#twitter_disable_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your password</p>
                    <input type=password id="twitter_password_input">
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
            } else if (request.twitter_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#twitter_disable_div").html(`Finished disabling Twitter`);
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

        }
    );
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
        url: "https://github.com/settings/security",
        focused: false,
        state: "minimized"
    }, (window) => {
        chrome.windows.update(window.id, { state: 'minimized' });
    });

    chrome.runtime.onMessage.addListener(
        (request, sender) => {
            if (request.github_error) {
                $('#github_disable_div').html(request.message);
                disable_injection("github", "disable");
            } else if (request.github_get_code) {
                $("#github_disable_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
                    <p>Please enter your 2FA code (either from Google Authenticator or SMS)</p>
                    <input type=text id="github_code_input">
                    <button class="btn btn-success" id="github_code_button">Submit</button>
                    `
                );
                $("#github_code_button").click(() => {
                    let code = $("#github_code_input").val();
                    if (code) {
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                github_code: true,
                                code: code,
                            }
                        );
                    }
                    $("#github_disable_div").html(`Please wait...`);
                });
            } else if (request.github_get_credentials) {
                $("#github_disable_div").html(
                    `
                    ${request.message != null ? "<p>" + request.message + "</p>" : ""}
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
                        chrome.tabs.sendMessage(
                            sender.tab.id, {
                                github_credentials: true,
                                username: username,
                                password: password,
                            }
                        );
                    }
                    $("#github_disable_div").html(`Please wait...`);
                });
            } else if (request.github_finished) {
                chrome.tabs.remove(sender.tab.id);
                $("#github_disable_div").html(`Finished disabling GitHub`);
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

        }
    );
}
// END ZOOM