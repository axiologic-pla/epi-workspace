export class BatchesPage {
    constructor(element,invalidate){
        this.element=element;
        this.invalidate=invalidate;
        this.invalidate(async ()=>{
            this.batches = await $$.promisify(webSkel.client.listBatches)(undefined);
            this.products = await $$.promisify(webSkel.client.listProducts)(undefined);
        });

    }

    beforeRender(){
        let string = "";
        for(let item of this.batches){
            let product = this.products.find(prodObj => prodObj.productCode === item.productCode)
            string += `
                        <div>${product.inventedName}</div>
                        <div>${product.nameMedicinalProduct}</div>
                        <div>${item.productCode}</div>
                        <div>${item.batch}</div>
                        <div>${item.expiryDate}</div>
                        <div class="view-details pointer" data-local-action="openDataMatrixModal ${item.productCode}">View</div>
                        <div>-</div>
                        <div class="view-details pointer" data-local-action="navigateToEditBatch ${item.productCode}">Edit</div>
                      `;
        }
        this.items = string;
    }
    afterRender(){
        let pageBody = this.element.querySelector(".page-body");
        let products = this.element.querySelector(".products-section");
        if(this.products.length === 0){
            products.style.display = "none";
            let noData = `<div>
                                    <div class="no-data-label">
                                        There are no data on any previous batch
                                    </div>
                                    <div class="no-data-instructions">
                                        Start by using one of the right side actions (import or add).
                                    </div>
                                </div>`;
            pageBody.insertAdjacentHTML("beforeend", noData)
        }
        this.searchInput = this.element.querySelector("#productCode");
        this.searchInput.value = this.inputValue || "";
        let xMark = this.element.querySelector(".x-mark");

        if(this.boundFnKeypress){
            this.searchInput.removeEventListener("keypress", this.boundFnKeypress);
        }
        this.boundFnKeypress= this.searchBatch.bind(this);
        this.searchInput.addEventListener("keypress", this.boundFnKeypress);

        if(this.boundFnMouseLeave){
            this.searchInput.removeEventListener("mouseleave", this.boundFnMouseLeave);
        }
        this.boundFnMouseLeave = this.hideXMark.bind(this, xMark);
        this.searchInput.addEventListener("mouseleave", this.boundFnMouseLeave);

        if(this.boundFnMouseEnter){
            this.searchInput.removeEventListener("mouseenter", this.boundFnMouseEnter);
        }
        this.boundFnMouseEnter = this.showXMark.bind(this, xMark);
        this.searchInput.addEventListener("mouseenter", this.boundFnMouseEnter);

        if(this.boundFnFocusout){
            this.searchInput.removeEventListener("focusout", this.boundFnFocusout);
        }
        this.boundFnFocusout = this.removeFocus.bind(this, xMark);
        this.searchInput.addEventListener("focusout", this.boundFnFocusout);

        if(this.boundFnInput){
            this.searchInput.removeEventListener("input", this.boundFnInput);
        }
        this.boundFnInput = this.toggleSearchIcons.bind(this, xMark);
        this.searchInput.addEventListener("input", this.boundFnInput);

        if(this.focusInput){
            this.searchInput.focus();
            xMark.style.display = "block";
            this.focusInput = false;
        }
    }
    toggleSearchIcons(xMark, event){
        if(this.searchInput.value === ""){
            xMark.style.display = "none";
        }else {
            xMark.style.display = "block";
        }
    }
    removeFocus(xMark, event){
        xMark.style.display = "none";
    }
    showXMark(xMark, event){
        if(this.searchInput.value !== ""){
            xMark.style.display = "block";
        }
    }
    hideXMark(xMark, event){
        if(document.activeElement !== this.searchInput){
            xMark.style.display = "none";
        }
    }
    async searchBatch(event){
        if(event.key === "Enter"){
            event.preventDefault();
            let formData = await webSkel.UtilsService.extractFormInformation(this.searchInput);
            if(formData.isValid){
                this.inputValue = formData.data.productCode;
                let products = await $$.promisify(webSkel.client.listProducts)(undefined, undefined, [`productCode == ${this.inputValue}`]);
                if(products.length > 0){
                    this.products = products;
                    this.batches = await $$.promisify(webSkel.client.listProducts)(undefined, undefined, [`productCode == ${this.inputValue}`]);
                    this.searchResultIcon = "<img class='result-icon' src='./assets/icons/check.svg' alt='check'>";
                }else {
                    this.searchResultIcon = "<img class='result-icon rotate' src='./assets/icons/ban.svg' alt='ban'>";
                }
                this.focusInput = true;
                this.invalidate();
            }
        }
    }
    async deleteInput(xMark){
        this.searchResultIcon = "";
        delete this.inputValue;
        this.invalidate(async ()=>{
            this.products = await $$.promisify(webSkel.client.listProducts)(undefined);
            this.batches = await $$.promisify(webSkel.client.listBatches)(undefined);
        });
    }
    async navigateToEditBatchPage(){
        await webSkel.changeToDynamicPage("edit-batch-page", "edit-batch-page");
    }

    async openDataMatrixModal(_target, productCode){
        await webSkel.UtilsService.showModal(document.querySelector("body"), "data-matrix-modal", { presenter: "data-matrix-modal", ["product-code"]: productCode});
    }
}