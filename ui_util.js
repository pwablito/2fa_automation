class AutomationSiteUI {
    constructor(name, identity_prefix, parent_id, logo_file) {
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
                        <div id="${this.identity_prefix}_setup_div" class="row" style="text-align: left;"></div>
                    </div>
                </div>
            </div>
            `
        );
        this.start_action();
    }

    loading() {
        $(`#${this.identity_prefix}_setup_div`).html(
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
        throw "Not implemented";
    }

    start_action() {
        chrome.runtime.onMessage.addListener(
            function listener(request, sender) {
                if (request[`${this.identity_prefix}_get_credentials`]) {
                    this.get_credentials();
                }
            }
        );
    }

    get_credentials() {
        throw "Not implemented";
    }
    get_password() {
        throw "Not implemented";
    }
    get_email() {
        throw "Not implemented";
    }
    get_phone() {
        throw "Not implemented";
    }
    get_code() {
        throw "Not implemented";
    }
    get_method() {
        throw "Not implemented";
    }
}