var PageManager = require('./pages/PageManager');

var app = {
    initialize: function() {
        this.bindEvents();
        //this.onDeviceReady();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        app.pageManager = new PageManager(document.getElementById('ui'));
    }
};

app.initialize();