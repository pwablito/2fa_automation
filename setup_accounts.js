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
}

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
        focused: false
    });
}

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
// END GITHUB

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