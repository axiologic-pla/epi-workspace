import WebSkel from "./WebSkel/webSkel.js";
const openDSU = require("opendsu");
(async ()=>{
    window.webSkel = await WebSkel.initialise("./webskel-configs.json");
    let pageContent = document.querySelector("#page-content");
    pageContent.insertAdjacentHTML("beforebegin", `<sidebar-menu data-presenter="left-sidebar"></sidebar-menu>`)
    webSkel.setDomElementForPages(pageContent);
    let currentPage = window.location.hash.slice(1);
    let presenterName = currentPage.split("/")[0];
    if(currentPage === ""){
        currentPage = "groups-page";
        presenterName = "groups-page";
    }
    webSkel.notificationHandler = openDSU.loadAPI("error");
    await webSkel.changeToDynamicPage(presenterName, currentPage);
})();

