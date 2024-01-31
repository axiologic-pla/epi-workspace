export class MarketsManagementModal{
    constructor(element, invalidate) {
        this.element = element;
        this.invalidate = invalidate;
        this.id = this.element.getAttribute("data-modal-id");
        this.invalidate();
    }
    beforeRender(){
        this.countryNames = ["Romania"];
        let stringHTML = "";
        for(let country of this.countryNames){
            stringHTML += `<option>${country}</option>`;
        }
        this.countries = stringHTML;
    }
    afterRender(){

    }
    closeModal(_target) {
        webSkel.UtilsService.closeModal(_target);
    }

    switchModalView(){
        let modal = webSkel.UtilsService.getClosestParentElement(this.element,"dialog");
        if(!modal.getAttribute("data-expanded")){
            modal.setAttribute("data-expanded", "true")
            modal.style.width = "95%";
            modal.style.maxWidth = "95vw";
            this.element.style.marginLeft = "0";
        }else {
            modal.removeAttribute("data-expanded");
            modal.style.width = "75%";
            modal.style.maxWidth = "75vw";
            this.element.style.marginLeft = "240px";
        }
    }
    async addMarketplace(_target){
        let formData = await webSkel.UtilsService.extractFormInformation(this.element.querySelector("form"));
        if(formData.isValid){
            webSkel.UtilsService.closeModal(_target, this.id, formData);
        }
    }
}