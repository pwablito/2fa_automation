function timer(ms) { return new Promise(res => setTimeout(res, ms)); }

var setup_processes = [];
var automationUI = new SetupUI("setup_processes_list");
$("#setup_accounts_button").click(() => {
    if (!$("#setup_accounts_button").hasClass("disabled")) {
        $("#select_accounts_div").hide();
        $("#setup_accounts_div").show();
        let boxes = $(".checkbox");
        boxes.each((index) => {
            if (boxes[index].checked) {
                service_name = $(boxes[index]).data("service");
                if (service_name === "twitter") {
                    automationUI.add_site(new AutomationSiteUI("Twitter", "twitter", "logos/twitter.svg", automationUI, "https://twitter.com/settings/account/login_verification/enrollment"));
                } else if (service_name === "reddit") {
                    automationUI.add_site(new AutomationSiteUI("Reddit", "reddit", "logos/reddit.svg", automationUI, "https://www.reddit.com/login"));
                } else if (service_name === "github") {
                    automationUI.add_site(new AutomationSiteUI("GitHub", "github", "logos/github.svg", automationUI, "https://github.com/login"));
                } else if (service_name === "google") {
                    automationUI.add_site(new AutomationSiteUI("Google", "google", "logos/google.svg", automationUI, "https://accounts.google.com/signin"));
                } else if (service_name === "pinterest") {
                    automationUI.add_site(new AutomationSiteUI("Pinterest", "pinterest", "logos/pinterest.svg", automationUI, "https://www.pinterest.com/settings/security"));
                } else if (service_name === "facebook") {
                    automationUI.add_site(new AutomationSiteUI("Facebook", "facebook", "logos/facebook.svg", automationUI, "https://www.facebook.com"));
                } else if (service_name === "amazon") {
                    automationUI.add_site(new AmazonUI("Amazon", "amazon", "logos/amazon.svg", automationUI, "https://www.amazon.com/a/settings/approval/setup/register"));
                } else if (service_name === "yahoo") {
                    automationUI.add_site(new YahooUI("Yahoo", "yahoo", "logos/yahoo.svg", automationUI, "https://login.yahoo.com/myaccount/security/two-step-verification"));
                } else if (service_name === "dropbox") {
                    automationUI.add_site(new AutomationSiteUI("Dropbox", "dropbox", "logos/dropbox.svg", automationUI, "https://www.dropbox.com/login"));
                } else if (service_name === "linkedin") {
                    automationUI.add_site(new AutomationSiteUI("Linkedin", "linkedin", "logos/linkedin.svg", automationUI, "https://www.linkedin.com/psettings/two-step-verification"));
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