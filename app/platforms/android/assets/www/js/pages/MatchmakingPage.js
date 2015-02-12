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
    this.onNewBridgeHandler = this.onNewBridge.bind(this);

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
        
        // We listen now for a Room choosing
        this.registerRoomChoosing();
    } 
    // We see no room ... :'(
    else {
        document.getElementById('rooms-list').innerHTML = '<li>No room available for now ...</li>';
    }
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

MatchmakingPage.prototype.askForRooms = function() {
    // GET THE ROOMS
    global.serverDialer.askForRooms();
    global.serverDialer.addEventListener('receivedRooms', this.populateRoomsHandler);
};

/**
 * On click to a room, we join it *
 * @param e
 */
MatchmakingPage.prototype.joinRoom = function(e) {
    global.serverDialer.joinRoom(e.currentTarget.dataset.roomid);
    global.serverDialer.addEventListener('newBridge', this.onNewBridgeHandler);
};

MatchmakingPage.prototype.onNewBridge = function () {
    global.serverDialer.removeEventListener('newBridge', this.onNewBridgeHandler);
    this.dispatchEvent({ type: 'changePage', newPage: 'ChooseCharacterPage' });
    this.unbindUiActions();
}

/**
 * On click on the new host button, we notify the server *
 */
MatchmakingPage.prototype.hostRoom = function() {
    global.serverDialer.hostRoom();
    this.dispatchEvent({ type: 'changePage', newPage: 'ChooseCharacterPage' });
    this.unbindUiActions();
};

module.exports = MatchmakingPage;