import {
    createObservableObject,
} from "../../../utils/utils.js";
import {CommonPresenterClass} from "../../CommonPresenterClass.js";

export class ManageBatchPage extends CommonPresenterClass {

    constructor(element, invalidate) {
        super(element, invalidate);

        let params = webSkel.getHashParams();
        this.gtin = params.gtin;
        this.batchId = params.batchId;
        this.pageTitle = "";
        this.formFieldStateClass = "";
        this.inputState = "";
        this.inputStateDisabledClass = "";
        this.formActionButtonText = "";
        this.formActionButtonFunction = "";
        this.batch = {};
        this.batchNumber = "";
        this.batchVersion = 0;
        this.product = {};
        this.productCode = "";
        this.packagingSiteName = "";
        this.enableExpiryDate = "";
        this.enableExpiryDateCheck = true;
        this.productInventedName = "-";
        this.productMedicinalName = "-";
        this.productCodeInput = "";
        this.penImage = "";
        this.formActionButtonState = "";
        this.leafletsInfo = "[]";
        this.updatedBatch = {}
        this.pageMode = this.gtin ? "EDIT_BATCH" : "ADD_BATCH";
        this.invalidate(async () => {
            await this.initializePageMode(this.pageMode);
        });

    }

    async initializePageMode(pageMode) {
        const initPage = {
            ADD_BATCH: async () => {
                let {productOptions, products} = await webSkel.appServices.getProductsForSelect();
                this.pageTitle = "Add Batch";
                this.formActionButtonText = "Add Batch";
                this.formActionButtonFunction = "addBatch";
                this.products = products;
                this.enableExpiryDate = "on";
                this.enableExpiryDateCheck = "checked";
                this.productCodeInput = `<select name="productCode" id="productCode" data-condition="productCodeCondition">
                                            <option selected value="no-selection" id="placeholder-option">Select a product</option>
                                            ${productOptions}
                                        </select>`;
                this.penImage = `<img class="pen-square" src="./assets/icons/pen-square.svg" alt="pen-square">`;
                this.updatedBatch = webSkel.appServices.createNewBatch({}, []);
            },

            EDIT_BATCH: async () => {
                let {batch, product, EPIs} = await webSkel.appServices.getBatchData(this.gtin, this.batchId)
                let batchModel = webSkel.appServices.createNewBatch(batch, EPIs);
                let enableExpiryDayCheck = "";
                if (batchModel.enableExpiryDay === "on") {
                    enableExpiryDayCheck = "checked";
                }

                this.pageTitle = "Edit Batch";
                this.formFieldStateClass = "disabled-form-field";
                this.inputState = "disabled";
                this.inputStateDisabledClass = "text-input-disabled";
                this.formActionButtonText = "Update Batch";
                this.formActionButtonFunction = "updateBatch";
                this.batch = batchModel;
                this.batchNumber = batchModel.batchNumber;
                this.batchVersion = batch.version; //TODO use getBatchVersion API when it becomes available
                this.product = product;
                this.productCode = product.productCode;
                this.packagingSiteName = batchModel.packagingSiteName;
                this.enableExpiryDate = batchModel.enableExpiryDay;
                this.enableExpiryDateCheck = enableExpiryDayCheck;
                this.productInventedName = product.inventedName;
                this.productMedicinalName = product.nameMedicinalProduct;
                this.productCodeInput = `<input type="text" class="text-input" name="productCode" id="productCode" autocomplete="off" disabled
                                        value="${product.productCode}">`;
                this.penImage = "";
                this.formActionButtonState = "disabled";
                this.leafletsInfo = this.getEncodedEPIS(EPIs);
                this.updatedBatch = createObservableObject(webSkel.appServices.createNewBatch(batch, EPIs), this.onChange.bind(this));

            }
        }
        await initPage[pageMode]();
    }

    getEncodedEPIS(EPIs) {
        return encodeURIComponent(JSON.stringify(EPIs));
    }


    beforeRender() {
    }

    onChange() {
        this.element.querySelector("#formActionButton").disabled =
            JSON.stringify(this.batch) === JSON.stringify(this.updatedBatch, webSkel.appServices.removeEPIForDeletion);
    }

    detectInputChange(event) {
        let inputName = event.target.name;
        if (inputName === "expiryDate") {
            this.updatedBatch.expiryDate = webSkel.appServices.formatBatchExpiryDate(event.target.value);
        } else {
            if (inputName === "enableExpiryDay") {
                event.target.value = event.target.checked ? "on" : "off";
            }
            this.updatedBatch[inputName] = event.target.value;
        }
    }

    attachEventListeners() {
        this.element.querySelector('#enableExpiryDay').addEventListener('change', () => {
            const dateContainer = this.element.querySelector('#custom-date-icon');
            const enableDayCheckbox = this.element.querySelector('#enableExpiryDay');
            const svg1 = dateContainer.querySelector('#svg1');
            const svg2 = dateContainer.querySelector('#svg2');
            const oldDateInput = dateContainer.querySelector('#date');
            const isChecked = enableDayCheckbox.checked;
            svg1.style.display = isChecked ? 'none' : 'block';
            svg2.style.display = isChecked ? 'block' : 'none';
            let newDateInput;
            if (isChecked) {
                /* MM-YYYY -> DD-MM-YYYY */
                const [year, month] = oldDateInput.value.split('-');
                let assignValue = `${year}-${month}-${webSkel.appServices.getLastDayOfMonth(year, month)}`;
                assignValue = assignValue.split("-").join("/");
                newDateInput = webSkel.appServices.createDateInput('date', assignValue);
            } else {
                /* DD-MM-YYYY -> MM-YYYY */
                let assignValue = oldDateInput.value.slice(0, 7);
                assignValue = assignValue.split("-").join("/");
                newDateInput = webSkel.appServices.createDateInput('month', assignValue);
            }
            dateContainer.replaceChild(newDateInput, oldDateInput);
        });
        this.element.removeEventListener("input", this.boundDetectInputChange);
        this.boundDetectInputChange = this.detectInputChange.bind(this);
        this.element.addEventListener("input", this.boundDetectInputChange);
    }

    afterRender() {
        /*TODO dictionary for each key/attribute(classes,id,etc) and iterate over it */
        /*TODO replace webSkel.appServices.createDateInput with date web component if necessary */

        const dateContainer = this.element.querySelector('#custom-date-icon');


        const pageModes = {

            ADD_BATCH: () => {
                dateContainer.insertBefore(webSkel.appServices.createDateInput('date'), dateContainer.firstChild);
                this.element.querySelector('#productCode').addEventListener('change', async (event) => {
                    const {value: productCode} = event.target;
                    const {
                        inventedName,
                        nameMedicinalProduct: medicinalproductInventedName
                    } = this.products.find(product => product.productCode === productCode) || {};
                    this.element.querySelector('#nameMedicinalProduct').value = medicinalproductInventedName;
                    this.element.querySelector('#inventedName').value = inventedName;
                    this.element.querySelector('#placeholder-option').disabled = true;
                });
            },
            EDIT_BATCH: () => {
                const dateType = webSkel.appServices.getDateInputTypeFromDateString(this.batch.expiryDate);
                const expiryDateInput = webSkel.appServices.createDateInput(dateType, webSkel.appServices.reverseSeparatedDateString(webSkel.appServices.parseDateStringToDateInputValue(this.batch.expiryDate), "-"));
                dateContainer.insertBefore(expiryDateInput, dateContainer.firstChild);
            }

        }
        pageModes[this.pageMode]();
        this.attachEventListeners();
    }

    async navigateToBatchesPage() {
        await webSkel.changeToDynamicPage("batches-page", "batches-page");
    }

    async showAddEPIModal() {
        let modalData = await webSkel.showModal("add-epi-modal", true);
        if (modalData) {
            await this.handleEPIModalData(modalData);
        }
    }

    reloadLeafletTab(encodedEPIsData) {
        const leafletTab = this.element.querySelector('epis-tab')
        leafletTab.setAttribute('data-units', encodedEPIsData)
        leafletTab.webSkelPresenter.invalidate();
    }

    deleteEpi(_target) {
        let epiUnit = webSkel.appServices.deleteEPI(_target, this.updatedBatch.EPIs);
        //trigger on change for epis
        this.updatedBatch.EPIs = JSON.parse(JSON.stringify(this.updatedBatch.EPIs));
        this.reloadLeafletTab(this.getEncodedEPIS(this.updatedBatch.EPIs));
    }

    addOrUpdateEpi(EPIData) {
        const existingLeafletIndex = (this.updatedBatch.EPIs || []).findIndex(epi => epi.language === EPIData.language);
        if (existingLeafletIndex !== -1) {
            /* epi already exists */
            if (this.updatedBatch.EPIs[existingLeafletIndex].action === "add") {
                /* previously added epi */
                EPIData.action = "add"
            } else {
                /* previously existent epi */
                EPIData.action = "update"
            }
            this.updatedBatch.EPIs[existingLeafletIndex] = EPIData;
            console.log(`Updated epi, language: ${EPIData.language}`);
        } else {
            /* newly added epi */
            EPIData.action = "add";
            this.updatedBatch.EPIs.push(EPIData);
        }
    }

    async handleEPIModalData(EPIData) {
        EPIData.id = webSkel.appServices.generateID(16);
        this.addOrUpdateEpi(EPIData);
        this.onChange();
        this.reloadLeafletTab(this.getEncodedEPIS(this.updatedBatch.EPIs));
    }

    productCodeCondition(element, formData) {
        let inputContainer = webSkel.getClosestParentElement(element, "#productCode");
        return inputContainer.value !== "no-selection"
    }

    otherFieldsCondition(element, formData) {
        return !webSkel.appServices.hasCodeOrHTML(element.value);
    }

    async addBatch(_target) {
        const conditions = {
            "productCodeCondition": {
                fn: this.productCodeCondition,
                errorMessage: "Please select a product code! "
            },
            "otherFieldsCondition": {
                fn: this.otherFieldsCondition,
                errorMessage: "Invalid input!"
            }
        };

        let formData = await webSkel.extractFormInformation(_target, conditions);

        if (formData.isValid) {
            formData.data.expiryDate = webSkel.appServices.formatBatchExpiryDate(formData.data.expiryDate);
            if (webSkel.appServices.getDateInputTypeFromDateString(formData.data.expiryDate) === 'month') {
                formData.data.expiryDate = webSkel.appServices.prefixMonthDate(formData.data.expiryDate);
            }
            formData.data.EPIs = this.updatedBatch.EPIs;
            await webSkel.appServices.saveBatch(formData.data);
        }

    }

    async updateBatch() {
        const conditions = {
            "otherFieldsCondition": {
                fn: this.otherFieldsCondition,
                errorMessage: "Invalid input!"
            }
        };
        const formData = await webSkel.extractFormInformation(this.element.querySelector("form"), conditions);
        if (formData.isValid) {
            let expiryDate = webSkel.appServices.formatBatchExpiryDate(formData.data.expiryDate);
            if (webSkel.appServices.getDateInputTypeFromDateString(expiryDate) === 'month') {
                expiryDate = webSkel.appServices.prefixMonthDate(expiryDate);
            }
            this.updatedBatch.expiryDate = expiryDate;
            this.updatedBatch.enableExpiryDay = formData.data.enableExpiryDay;
            let diffs = webSkel.appServices.getBatchDiffs(this.batch, this.updatedBatch);
            let selectedProduct = {
                inventedName: this.batch.inventedName,
                nameMedicinalProduct: this.batch.nameMedicinalProduct
            }
            let confirmation = await webSkel.showModal("data-diffs-modal", {
                diffs: encodeURIComponent(JSON.stringify(diffs)),
                productData: encodeURIComponent(JSON.stringify(selectedProduct))
            }, true);
            if (confirmation) {
                await webSkel.appServices.saveBatch(this.updatedBatch, true);
            }
        }
    }

    async viewLeaflet(_target) {
        let epiObject = webSkel.appServices.getEpitUnit(_target, this.updatedBatch.EPIs);
        let selectedProduct = {
            inventedName: this.element.querySelector('#inventedName').value,
            nameMedicinalProduct: this.element.querySelector('#nameMedicinalProduct').value
        }

        let epiPreviewModel = webSkel.appServices.getEpiPreviewModel(epiObject, selectedProduct);
        await webSkel.showModal("preview-epi-modal", {epidata: encodeURIComponent(JSON.stringify(epiPreviewModel))});
    }


}
