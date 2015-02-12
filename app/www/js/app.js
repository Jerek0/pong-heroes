var PageManager = require('./pages/PageManager');
var ServerDialer = require('./network/ServerDialer');

var app = {
    initialize: function() {
        //this.bindEvents();
        this.onDeviceReady();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function() {
        if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
            document.body.classList.add('mobile');
        } else {
            document.body.classList.add('desktop');
        }

        app.connectToServer();
        app.pageManager = new PageManager(document.getElementById('ui'));
    },
    
    connectToServer: function() {
        if(!global.serverDialer) {
            global.serverDialer = new ServerDialer();
        }
    }
};

app.initialize();