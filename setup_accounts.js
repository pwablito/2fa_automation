$("#setup_accounts_button").click(() => {
    if (!$("#setup_accounts_button").hasClass("disabled")) {
        $("#select_accounts_div").hide();
        $("#setup_accounts_div").show();
        let boxes = $(".checkbox");
        boxes.each((index) => {
            if (boxes[index].checked) {
                initiate_setup($(boxes[index]).data("service"));
            }
        });
    }
});

// Dispatcher
function initiate_setup(service_name) {
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
        console.log("Facebook is not yet supported");
    } else {
        console.log("Undefined service: '" + service_name + "'");
    }
}

function initiate_twitter_setup() {
    console.log("Setting up twitter");
    $("#setup_processes_list").append(
        `
        <div class="gray">This is the Twitter setup section</div>
        `
    );
}

function initiate_reddit_setup() {
    console.log("Setting up reddit");
    $("#setup_processes_list").append(
        `
        <div class="gray">This is the Reddit setup section</div>
        `
    );
}

function initiate_github_setup() {
    console.log("Setting up github");
    $("#setup_processes_list").append(
        `
        <div class="gray">
            <div class="row">
                <div class="col-3">Github</div>
                <div class="col-9">
                    <div id="github_setup_div" class="row"></div>
                </div>
            </div>
        </div>
        `
    );
    $("#github_setup_div").append(
        `
        <input type=text id="github_phone_number_input" placeholder="Phone number">
        <button class="btn btn-success" id="github_phone_number_button">Submit</button>
        `
    );
    $("#github_phone_number_button").click(function() {
        let number = $("#github_phone_number_input").val();
        if (number) {
            // Send to backend, proceed
            $("#github_setup_div").empty();
            $("#github_setup_div").append(
                `
                <input type=text id="github_code_input" placeholder="Code from SMS">
                <button class="btn btn-success" id="github_code_button">Submit</button>
                `
            );
            $("#github_code_button").click(function() {

                let code = $("#github_code_input").val();
                if (code) {
                    // send to backend, proceed
                    $("#github_setup_div").empty();
                    $("#github_setup_div").append(
                        `
                        Finished!
                        `
                    );
                }
            });
        }
    });
}

function initiate_google_setup() {
    console.log("Setting up google");
    $("#setup_processes_list").append(
        `
        <div class="gray">This is the Google setup section</div>
        `
    );
}

function initiate_pinterest_setup() {
    console.log("Setting up pinterest");
    $("#setup_processes_list").append(
        `
        <div class="gray">This is the Pinterest setup section</div>
        `
    );
}