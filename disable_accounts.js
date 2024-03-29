var disable_processes = [];
var automationUI = new DisableUI("disable_processes_list");

$("#disable_accounts_button").click(() => {
    if (!$("#disable_accounts_button").hasClass("disabled")) {
        $("#select_accounts_div").hide();
        $("#disable_accounts_header_div").show();
        $("#disable_accounts_div").show();
        $("#disable_accounts_footer_div").show();
        let boxes = $(".checkbox");
        boxes.each((index) => {
            if (boxes[index].checked) {
                service_name = $(boxes[index]).data("service");
                if (service_name === "twitter") {
                    automationUI.add_site(new AutomationSiteUI("Twitter", "twitter", "logos/twitter.svg", automationUI, "https://twitter.com/settings/account/login_verification/enrollment", true));
                } else if (service_name === "reddit") {
                    automationUI.add_site(new AutomationSiteUI("Reddit", "reddit", "logos/reddit.svg", automationUI, "https://www.reddit.com/login", true));
                } else if (service_name === "github") {
                    automationUI.add_site(new AutomationSiteUI("GitHub", "github", "logos/github.svg", automationUI, "https://github.com/login", true));
                } else if (service_name === "google") {
                    automationUI.add_site(new AutomationSiteUI("Google", "google", "logos/google.svg", automationUI, "https://accounts.google.com/signin", true));
                } else if (service_name === "pinterest") {
                    automationUI.add_site(new AutomationSiteUI("Pinterest", "pinterest", "logos/pinterest.svg", automationUI, "https://www.pinterest.com/settings/security", true));
                } else if (service_name === "facebook") {
                    automationUI.add_site(new AutomationSiteUI("Facebook", "facebook", "logos/facebook.svg", automationUI, "https://www.facebook.com", true));
                } else if (service_name === "amazon") {
                    automationUI.add_site(new AmazonUI("Amazon", "amazon", "logos/amazon.svg", automationUI, "https://www.amazon.com/a/settings/approval/setup/register", true));
                } else if (service_name === "yahoo") {
                    automationUI.add_site(new AutomationSiteUI("Yahoo", "yahoo", "logos/yahoo.svg", automationUI, "https://login.yahoo.com/myaccount/security/two-step-verification", true));
                } else if (service_name === "dropbox") {
                    automationUI.add_site(new AutomationSiteUI("Dropbox", "dropbox", "logos/dropbox.svg", automationUI, "https://www.dropbox.com/login", true));
                } else if (service_name === "linkedin") {
                    automationUI.add_site(new AutomationSiteUI("Linkedin", "linkedin", "logos/linkedin.svg", automationUI, "https://www.linkedin.com/psettings/two-step-verification", true));
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