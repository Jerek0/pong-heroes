(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var pageManager = require('./pages/PageManager');

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        // LAUNCH PAGE MANAGER
    }
};

app.initialize();
},{"./pages/PageManager":2}],2:[function(require,module,exports){
/**
 * Created by jerek0 on 08/02/2015.
 */

var homePage = require('./homepage');

var pageManager = function() {
    this.currentPage = new homePage();
}

pageManager.prototype.changePage = function(newPage) {
    this.currentPage = newPage;
}

module.exports = pageManager;
},{"./homepage":3}],3:[function(require,module,exports){
/**
 * Created by jerek0 on 08/02/2015.
 */

var homePage = function() {
    this.templateUrl = '/templates/home.html'
}

module.exports = homePage;
},{}]},{},[1]);
