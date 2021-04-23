$("#setup_accounts_button").click(() => {
    $("#select_accounts_div").hide();
    $("#setup_accounts_div").show();

    let boxes = $(".checkbox");
    boxes.each((index) => {
        if (boxes[index].checked) {
            initiate_setup($(boxes[index]).data("service"));
        }
    });
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
        <li class="gray">This is the Twitter setup section</li>
        `
    );
}

function initiate_reddit_setup() {
    console.log("Setting up reddit");
    $("#setup_processes_list").append(
        `
        <li class="gray">This is the Reddit setup section</li>
        `
    );
}

function initiate_github_setup() {
    console.log("Setting up github");
    $("#setup_processes_list").append(
        `
        <li class="gray">This is the Github setup section</li>
        `
    );
}

function initiate_google_setup() {
    console.log("Setting up google");
    $("#setup_processes_list").append(
        `
        <li class="gray">This is the Google setup section</li>
        `
    );
}

function initiate_pinterest_setup() {
    console.log("Setting up pinterest");
    $("#setup_processes_list").append(
        `
        <li>This is the Pinterest setup section</li>
        `
    );
}