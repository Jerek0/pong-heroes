/**
 * Created by jerek0 on 08/02/2015.
 */
    

var pageManager = function() {
    
    this.currentPage = "";
    
}

pageManager.prototype.changePage(newPage) {
    this.currentPage = newPage;
}

module.exports = pageManager;