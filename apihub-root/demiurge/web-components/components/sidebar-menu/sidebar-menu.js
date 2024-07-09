export class SidebarMenu {
    constructor(element,invalidate) {
        this.element = element;
        this.invalidate = invalidate;
        this.invalidate();
    }
    beforeRender(){
        if(window.location.hash.slice(1).split("/")[0] === "booting-identity-page"){
            this.element.classList.add("no-identity");
            this.hasIdentity = false;
        }
    }
    afterRender(){
        if(this.hasIdentity){
            this.highlightCurrentSelection(window.location.hash.slice(1));
        }
    }
    async changePage(_target, page){
        await webSkel.changeToDynamicPage(page, `${page}`);
        this.highlightCurrentSelection(page);
    }
    highlightCurrentSelection(page){
        let element = this.element.querySelector(`#active`);
        if(element){
            element.removeAttribute("id");
        }
        page = page.split("/")[0];
        let currentElement = this.element.querySelector(`.${page}`);
        currentElement.setAttribute("id", "active");
        currentElement.scrollIntoView({behavior: "smooth", block: "center", inline: "center"});
    }
}