$("#setup_accounts_button").click(() => {
    if (!$("#setup_accounts_button").hasClass("disabled")) {
        $("#select_accounts_div").hide();
        $("#setup_accounts_div").show();
        let boxes = $(".checkbox");
        boxes.each((index) => {
            if (boxes[index].checked) {
                service_name = $(boxes[index]).data("service");
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
                } else {
                    console.log("Undefined service: '" + service_name + "'");
                }
            }
        });
    }
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
        state: "minimized"
    });

    chrome.runtime.onMessage.addListener(
        function(request, sender) {
            console.log(request, sender);
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
            console.log(request, sender);
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
                    <div id="facebook_setup_div" class="row">
                        Not supported
                    </div>
                </div>
            </div>
        </div>
        `
    );
}
// END FACEBOOK