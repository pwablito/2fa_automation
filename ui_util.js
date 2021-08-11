class AutomationSiteUI {
    constructor(name, identity_prefix, parent_id, logo_file) {
        /*
         * @param {string} name - Name of the site (i.e. "Google")
         * @param {string} identity_prefix - Prefix for UI elements (i.e. "google" would result in "google_ui_div"
         * @param {string} parent_id - ID of the parent element in which this will be placed
         * @param {string} logo_file - Path to the logo file to display on the side of the UI
         */
        this.name = name;
        this.identity_prefix = identity_prefix;
        this.parent_id = parent_id;
        this.logo_file = logo_file;
    }

    initialize() {
        $(`#${this.parent_id}`).append(
            `
            <div class="gray">
                <div class="row">
                    <div class="col-3"><img src="${this.logo_file}"></div>
                    <div class="col-9">
                        <div id="${this.identity_prefix}_ui_div" class="row" style="text-align: left;"></div>
                    </div>
                </div>
            </div>
            `
        );
        this.start_action();
    }

    loading() {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            <div class="row">
                <div class="col-8">
                Please wait...
                </div>
                <div class="col-4">
                    <div class="spinner-border" role="status">
                        <span class="sr-only">Loading...</span>
                    </div>
                </div>
            </div>
            `
        );
    }

    finished() {
        this.error("Not implemented");
    }
    error(message) {
        $(`#${this.identity_prefix}_ui_div`).html(
            `
            <p>${message}</p>
            `
        );
    }

    start_action() {
        chrome.runtime.onMessage.addListener(
            function listener(request, sender) {
                if (request[`${this.identity_prefix}_get_credentials`]) {
                    this.get_credentials();
                } else if (request[`${this.identity_prefix}_get_password`]) {
                    this.get_credentials();
                } else if (request[`${this.identity_prefix}_get_email`]) {
                    this.get_email();
                } else if (request[`${this.identity_prefix}_get_phone`]) {
                    this.get_phone();
                } else if (request[`${this.identity_prefix}_get_code`]) {
                    this.get_code();
                } else if (request[`${this.identity_prefix}_get_method`]) {
                    this.get_method();
                } else if (request[`${this.identity_prefix}_finished`]) {
                    this.finished();
                } else if (request[`${this.identity_prefix}_error`]) {
                    this.error();
                } else {
                    this.error(`Got invalid request: ${request}`);
                }
            }
        );
    }

    get_credentials() {
        this.error("Not implemented");
    }
    get_password() {
        this.error("Not implemented");
    }
    get_email() {
        this.error("Not implemented");
    }
    get_phone() {
        this.error("Not implemented");
    }
    get_code() {
        this.error("Not implemented");
    }
    get_method() {
        this.error("Not implemented");
    }
}