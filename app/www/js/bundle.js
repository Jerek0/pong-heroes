(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
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
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./network/ServerDialer":3,"./pages/PageManager":9}],2:[function(require,module,exports){
/**
 * Created by jerek0 on 08/02/2015.
 */
function CustomEventDispatcher() { this._init(); }

CustomEventDispatcher.prototype._init= function() {
    this._registrations= {};
};
CustomEventDispatcher.prototype._getListeners= function(type, useCapture) {
    var captype= (useCapture? '1' : '0')+type;
    if (!(captype in this._registrations))
        this._registrations[captype]= [];
    return this._registrations[captype];
};

CustomEventDispatcher.prototype.addEventListener= function(type, listener, useCapture) {
    var listeners= this._getListeners(type, useCapture);
    var ix= listeners.indexOf(listener);
    if (ix===-1)
        listeners.push(listener);
};

CustomEventDispatcher.prototype.removeEventListener= function(type, listener, useCapture) {
    var listeners= this._getListeners(type, useCapture);
    var ix= listeners.indexOf(listener);
    //console.log(listeners);
    //console.log(ix);
    if (ix!==-1)
        listeners.splice(ix, 1);
    //console.log(listeners);
    //console.log('######');
};

CustomEventDispatcher.prototype.dispatchEvent= function(evt) {
    var listeners= this._getListeners(evt.type, false).slice();
    for (var i= 0; i<listeners.length; i++)
        listeners[i].call(this, evt);
    return !evt.defaultPrevented;
};

module.exports = CustomEventDispatcher;
},{}],3:[function(require,module,exports){
/**
 * Created by jerek0 on 10/02/2015.
 */
    
var CustomEventDispatcher = require('../events/CustomEventDispatcher');
var serverConfig = require('./serverConfig');

var ServerDialer = function() {
    this.init();
}
// Héritage de CustomEventDispatcher
ServerDialer.prototype = new CustomEventDispatcher();
ServerDialer.prototype.constructor = ServerDialer;

/**
 * Allows to connect to the game server and start listening for events *
 */
ServerDialer.prototype.init =  function() {
    this.socket = io.connect('http://'+serverConfig.url+':'+serverConfig.port);
    
    var scope = this;
    this.socket
        .on('connect', function() {
            console.log(Date() + ' - connectedToServer');
            scope.dispatchEvent({ type: 'connectedToServer'});
            scope.disconnected = false;
        })
        .on('connect_error', function(data) {
            if(!scope.disconnected) { // This condition allows to throw only one error
                scope.disconnected = true;
                alert(JSON.stringify(data));
            }
            console.log(Date()+' - Reconnect failed');
        });
    
    this.bindServerEvents();
};

/* ########################################### *
 * ############ SERVER LISTENERS ############# *
 * ########################################### *
 */

/**
 * Server events listener and manager *
 */
ServerDialer.prototype.bindServerEvents = function() {
    var scope = this;
    this.socket.on('newGameID', function(data) {
        scope.onNewGameID(data);
    });
    this.socket.on('newBridge', function() {
        scope.onNewBridge();
    });
    this.socket.on('connected', function(data) {
        scope.onConnected(data);
    });
    this.socket.on('rooms', function(data) {
        scope.dispatchEvent({ type: 'receivedRooms', data: data.rooms});
    });
    this.socket.on('expulsed', function() {
        scope.dispatchEvent({ type: 'changePage', newPage: 'MatchmakingPage' });
        alert('We lost the host !');
        this.gameID=null;
    });
};

/**
 * Method called when the server answers positively to the room hosting request *
 * @param data
 */
ServerDialer.prototype.onNewGameID = function(data) {
    console.log('Received game id '+data.gameID);
    this.gameID = data.gameID;
};

/**
 * Method called when we've got a connection between a host and a client *
 */
ServerDialer.prototype.onNewBridge = function() {
    console.log('BRIDGE !');
};

/**
 * Method called when we've got a connection between a host and a client *
 */
ServerDialer.prototype.onConnected = function(data) {
    this.gameID = data.gameID;
    console.log('Connection with room '+this.gameID+' established');
    this.dispatchEvent({ type: 'changePage', newPage: 'ChooseCharacterPage' });
};

/* ########################################### *
 * ########### SERVER REQUESTS ############### *
 * ########################################### *
 * 
 * For each of these functions, the server's answer
 * will be catched in this.bindServerEvents()
 */

/**
 * Ask the server for the list of rooms *
 */
ServerDialer.prototype.askForRooms = function() {
    this.socket.emit('getRooms');
};

/**
 * Send the server a room hosting request *
 */
ServerDialer.prototype.hostRoom = function() {
    this.socket.emit('hostRoom');
};

/**
 * Ask the server to join an existing room *
 * @param id - The existing room id
 */
ServerDialer.prototype.joinRoom = function(id) {
    this.socket.emit('joinRoom', { gameID: id});
    console.log('Asked to join room '+id);
};

/**
 * Ask the server to leave an existing room *
 */
ServerDialer.prototype.leaveRoom = function() {
    this.socket.emit('leaveRoom');
    this.gameID = null;
}

module.exports = ServerDialer;
},{"../events/CustomEventDispatcher":2,"./serverConfig":4}],4:[function(require,module,exports){
/**
 * Created by jerek0 on 10/02/2015.
 */

var serverConfig = {
    url: "192.168.0.32",
    port: 9005
}

module.exports = serverConfig;
},{}],5:[function(require,module,exports){
(function (global){
/**
 * Created by jerek0 on 08/02/2015.
 */

var Page = require('./Page');

var ChooseCharacter = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);

    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/choose_character.html');
};

// Héritage de Page
ChooseCharacter.prototype = new Page();
ChooseCharacter.prototype.constructor = ChooseCharacter;

ChooseCharacter.prototype.onPageDisplayed = function() {
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);

    // TODO Show btn only when connected to server
    // TODO Watch Memory Here
    var scope = this;
    var btnBack = document.getElementById("btn-back");
    btnBack.addEventListener('click', function() {
        scope.dispatchEvent({ type: 'changePage', newPage: 'MatchmakingPage' });
        global.serverDialer.leaveRoom();
    });
};

module.exports = ChooseCharacter;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Page":8}],6:[function(require,module,exports){
/**
 * Created by jerek0 on 08/02/2015.
 */

var Page = require('./Page');

var HomePage = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);

    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/home.html');
};

// Héritage de Page
HomePage.prototype = new Page();
HomePage.prototype.constructor = HomePage;

HomePage.prototype.onPageDisplayed = function() {
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);
    
    // TODO Show btn only when connected to server
    // TODO Watch Memory Here
    var scope = this;
    var btnPlay = document.getElementById("btn-play");
    btnPlay.addEventListener('click', function() {
        scope.dispatchEvent({ type: 'changePage', newPage: 'TechnoPage' });
    });
};

module.exports = HomePage;
},{"./Page":8}],7:[function(require,module,exports){
(function (global){
/**
 * Created by jerek0 on 09/02/2015.
 */

var Page = require('./Page');

var MatchmakingPage = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);
    this.populateRoomsHandler = this.populateRooms.bind(this);
    this.joinRoomHandler = this.joinRoom.bind(this);
    this.newHostHandler = this.hostRoom.bind(this);
    this.askForRoomsHandler = this.askForRooms.bind(this);

    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/matchmaking.html');
};
// Héritage de Page
MatchmakingPage.prototype = new Page();
MatchmakingPage.prototype.constructor = MatchmakingPage;

/**
 * Function called when view is ready *
 */
MatchmakingPage.prototype.onPageDisplayed = function() {
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);

    var scope = this;
    var btnBack = document.getElementById("btn-back");
    btnBack.innerHTML = localStorage.getItem('PH-tech');
    btnBack.addEventListener('click', function() {
        scope.dispatchEvent({ type: 'changePage', newPage: 'TechnoPage' });
    });
    
    this.askForRooms();
    this.bindUiActions();
};

/**
 * Function managing UI actions *
 */
MatchmakingPage.prototype.bindUiActions = function () {
    this.btnHost = document.getElementById('btn-host');
    this.btnHost.addEventListener('click', this.newHostHandler);

    this.btnRefresh = document.getElementById('btn-refresh');
    this.btnRefresh.addEventListener('click', this.askForRoomsHandler);
};

MatchmakingPage.prototype.unbindUiActions = function() {
    this.btnHost.removeEventListener('click', this.newHostHandler);
    this.btnRefresh.removeEventListener('click', this.askForRoomsHandler);
    this.destroyRoomChoosing();
};

/**
 * Generates the markup of each room available *
 * @param e - The event containing rooms
 */
MatchmakingPage.prototype.populateRooms = function(e) {
    global.serverDialer.removeEventListener('receivedRooms', this.populateRoomsHandler);
    
    // We have rooms available ! YAY !
    if(e.data.length) {
        var numberOfRooms = e.data.length,
            i;

        document.getElementById('rooms-list').innerHTML = '';
        for(i = 0; i < numberOfRooms; i++) {
            document.getElementById('rooms-list').innerHTML += '<li data-roomId="'+ e.data[i] +'">Room '+ e.data[i] +'</li>';
        }
        
    } 
    // We see no room ... :'(
    else {
        document.getElementById('rooms-list').innerHTML = '<li>No room available for now ...</li>';
    }

    // We listen now for a Room choosing
    this.registerRoomChoosing();
};

/**
 * Listen all the rooms for a click *
 */
MatchmakingPage.prototype.registerRoomChoosing = function() {
    this.rooms = document.querySelectorAll('#rooms-list li');
    
    var i;
    for(i = 0; i < this.rooms.length; i++) {
        this.rooms[i].addEventListener('click', this.joinRoomHandler);
    }
};

/**
 * Destroy the rooms listeners *
 */
MatchmakingPage.prototype.destroyRoomChoosing = function() {
    var i;
    for(i = 0; i < this.rooms.length; i++) {
        this.rooms[i].removeEventListener('click', this.joinRoomHandler);
    }
};

/* ########################################### *
 * ############# SERVER REQUESTS ############# *
 * ########################################### *
 */

MatchmakingPage.prototype.askForRooms = function() {
    // GET THE ROOMS
    global.serverDialer.askForRooms();
    global.serverDialer.addEventListener('receivedRooms', this.populateRoomsHandler);
};

/**
 * On click to a room, we try to join it *
 * @param e
 */
MatchmakingPage.prototype.joinRoom = function(e) {
    global.serverDialer.joinRoom(e.currentTarget.dataset.roomid);
};

/**
 * On click on the new host button, we notify the server *
 */
MatchmakingPage.prototype.hostRoom = function() {
    global.serverDialer.hostRoom();
    this.dispatchEvent({ type: 'changePage', newPage: 'ChooseCharacterPage' });
    this.unbindUiActions();
};

module.exports = MatchmakingPage;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Page":8}],8:[function(require,module,exports){
/**
 * Created by jerek0 on 08/02/2015.
 */
var CustomEventDispatcher = require('../events/CustomEventDispatcher');

var Page = function() {
    this.templateUrl = '';
}
// Héritage de CustomEventDispatcher
Page.prototype = new CustomEventDispatcher();
Page.prototype.constructor = Page;

Page.prototype.setTemplateUrl = function(value) {
    this.templateUrl = value;
    this.loadTemplate();
}

// Chargement ajax du template de la page
Page.prototype.loadTemplate = function() {
    var scope = this;
    var xmlhttp;

    if(window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }

    xmlhttp.open('GET', this.templateUrl, true);
    xmlhttp.send();

    xmlhttp.onreadystatechange = function() {
        if(xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                scope.dispatchEvent({ type: 'templateLoaded', data: xmlhttp.response });
            } else if(xmlhttp.status == 404) {
                alert('404 : Template not found');
            } else {
                alert('Error : '+xmlhttp.status);
            }
        }
    }
};

Page.prototype.unbindUiActions = function() {
    // Function to override !
};

module.exports = Page;
},{"../events/CustomEventDispatcher":2}],9:[function(require,module,exports){
(function (global){
/**
 * Created by jerek0 on 08/02/2015.
 */

var HomePage = require('./HomePage');
var TechnoPage = require('./TechnoPage');
var MatchmakingPage = require('./MatchmakingPage');
var ChooseCharacterPage = require('./ChooseCharacterPage');

var PageManager = function(pageContainer) {
    this.pageContainer = pageContainer;
    this.changePage('HomePage');

    global.serverDialer.addEventListener('changePage', this.onChangePageHandler);
};

PageManager.prototype.changePage = function(newPage) {
    var scope = this;
    
    // Function handlers
    this.onTemplateLoadedHandler = this.onTemplateLoaded.bind(this);
    this.onChangePageHandler = this.onChangePage.bind(this);
    
    if(this.currentPage) this.currentPage.unbindUiActions();

    switch (newPage) {
        case "HomePage":
            this.currentPage = new HomePage();
            break;
        case "TechnoPage":
            this.currentPage = new TechnoPage();
            break;
        case "MatchmakingPage":
            this.currentPage = new MatchmakingPage();
            break;
        case "ChooseCharacterPage":
            this.currentPage = new ChooseCharacterPage();
            break;
        default:
            this.currentPage = new HomePage();
    }
    
    this.currentPage.addEventListener('templateLoaded', this.onTemplateLoadedHandler);
    this.currentPage.addEventListener('changePage', this.onChangePageHandler);
};

PageManager.prototype.onChangePage = function (e) {
    this.changePage(e.newPage);
    //console.log('changingpage');
    this.currentPage.removeEventListener('changePage', this.onChangePageHandler);
};

PageManager.prototype.onTemplateLoaded = function(e) {
    this.updateView(e.data);
    this.currentPage.removeEventListener('templateLoaded', this.onTemplateLoadedHandler);
};

PageManager.prototype.updateView = function(template) {
    this.pageContainer.classList.remove('bounceIn');
    
    var scope = this;
    setTimeout(function() {
        scope.pageContainer.innerHTML = template;
        scope.pageContainer.classList.add('bounceIn');
        scope.currentPage.dispatchEvent({ type: 'pageDisplayed' });
    }, 50);
};

module.exports = PageManager;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ChooseCharacterPage":5,"./HomePage":6,"./MatchmakingPage":7,"./TechnoPage":10}],10:[function(require,module,exports){
/**
 * Created by jerek0 on 08/02/2015.
 */

var Page = require('./Page');

var TechnoPage = function() {
    // Functions handlers
    this.onPageDisplayedHandler = this.onPageDisplayed.bind(this);
    
    this.addEventListener('pageDisplayed', this.onPageDisplayedHandler);
    this.setTemplateUrl('templates/techno.html');
};

// Héritage de Page
TechnoPage.prototype = new Page();
TechnoPage.prototype.constructor = TechnoPage;

TechnoPage.prototype.onPageDisplayed = function() {
    this.removeEventListener('pageDisplayed', this.onPageDisplayedHandler);
    
    this.bindUiEvents();
};

TechnoPage.prototype.bindUiEvents = function() {
    var scope = this;
    var btnBack = document.getElementById("btn-back");
    btnBack.addEventListener('click', function() {
        scope.dispatchEvent({ type: 'changePage', newPage: 'HomePage' });
    });
    
    this.registerTechnoChoosing();
};

TechnoPage.prototype.registerTechnoChoosing = function() {
    this.chooseTechnoHandler = this.chooseTechno.bind(this);
    
    // Listen to every technoChooser
    this.technoChoosers = document.querySelectorAll('.techno-chooser');
    var numberOfTechnos = this.technoChoosers.length;
    var i;
    for(i = 0; i < numberOfTechnos; i++) {
        this.technoChoosers[i].addEventListener('click', this.chooseTechnoHandler);
    }
};

TechnoPage.prototype.destroyTechnoChoosing = function() {
    var numberOfTechnos = this.technoChoosers.length;
    var i;
    for(i = 0; i < numberOfTechnos; i++) {
        this.technoChoosers[i].removeEventListener('click', this.chooseTechnoHandler);
    }
};

TechnoPage.prototype.chooseTechno = function() {
    localStorage.setItem('PH-tech', event.target.dataset.tech);
    this.destroyTechnoChoosing();
    this.dispatchEvent({ type: 'changePage', newPage: 'MatchmakingPage' });
};

module.exports = TechnoPage;
},{"./Page":8}]},{},[1]);
