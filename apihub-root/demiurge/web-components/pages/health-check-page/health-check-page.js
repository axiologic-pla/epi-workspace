export class HealthCheckPage {
    constructor(element, invalidate) {
        this.element = element;
        this.invalidate = invalidate;
        this.setPaginationDefaultValues = ()=>{
            this.logsNumber = 16;
            this.disableNextBtn = true;
            this.firstElementTimestamp = 0;
            this.lastElementTimestamp = undefined;
            this.previousPageFirstElements = [];
        };
        this.setPaginationDefaultValues();
        this.loadRuns = (query) => {
            this.invalidate(async () => {
                //this.logs = await $$.promisify(webSkel.client.filterAuditLogs)(constants.AUDIT_LOG_TYPES.USER_ACCESS, undefined, this.logsNumber, query, "desc");
                this.healthChecks = [];
                for(let i = 0; i < 16; i++){
                    this.healthChecks.push({
                        username: i,
                        userDID: "did:demo:123",
                        userGroup: "Admin",
                        action: "Access Wallet",
                        __timestamp: Date.now()
                    });
                }

                if (this.healthChecks && this.healthChecks.length > 0) {
                    if (this.healthChecks.length === this.logsNumber) {
                        this.healthChecks.pop();
                        this.disableNextBtn = false;
                    } else if (this.healthChecks.length < this.logsNumber) {
                        this.disableNextBtn = true;
                    }
                    this.lastElementTimestamp = this.healthChecks[this.healthChecks.length - 1].__timestamp;
                    this.firstElementTimestamp = this.healthChecks[0].__timestamp;
                }
            });
        };
        this.loadRuns(["__timestamp > 0"]);
    }

    beforeRender() {
        let string = "";
        for (let item of this.healthChecks) {
            string += ` <div class="data-item">${item.date}</div>
                        <div class="data-item">${item.status}</div>
                        <div class="data-item view-details" data-local-action="navigateToHealthCheckRun ${item.id}">View Details</div>`;
        }
        this.items = string;
    }
    afterRender() {
        let table = this.element.querySelector(".table");
        if(this.healthChecks.length === 0){
            table.style.display = "none";
            let noData = `<div class="no-data">No Data ...</div>`;
            this.element.insertAdjacentHTML("beforeend", noData)
        }
        let previousBtn = this.element.querySelector("#previous");
        let nextBtn = this.element.querySelector("#next");
        if (this.previousPageFirstElements.length === 0 && previousBtn) {
            previousBtn.classList.add("disabled");
        }
        if (this.disableNextBtn && nextBtn) {
            nextBtn.classList.add("disabled");
        }
    }
    previousTablePage(_target) {
        if (!_target.classList.contains("disabled") && this.previousPageFirstElements.length > 0) {
            this.firstElementTimestamp = this.previousPageFirstElements.pop();
            this.lastElementTimestamp = undefined;
            let query = [`__timestamp <= ${this.firstElementTimestamp}`];
            this.loadRuns(query);
        }
    }

    nextTablePage(_target) {
        if (!_target.classList.contains("disabled")) {
            this.previousPageFirstElements.push(this.firstElementTimestamp);
            this.firstElementTimestamp = this.lastElementTimestamp;
            this.lastElementTimestamp = undefined;
            let query = [`__timestamp < ${this.firstElementTimestamp}`];
            this.loadRuns(query);
        }
    }
    async navigateToHealthCheckRun(_target, id){
        await webSkel.changeToDynamicPage("run-results-page", `run-results-page/${id}`);
    }
}