/**
 * Created by jerek0 on 08/02/2015.
 */

/**
 * CUSTOM EVENT DISPATCHER *
 * 
 * This is a custom events managing system allowing to use events
 * with JS Objects and not only with DOM elements
 * 
 * It works with classical 'addEventListeners', 'removeEventListeners', etc. 
 *
 * @constructor
 */
function CustomEventDispatcher() { this._init(); }

CustomEventDispatcher.prototype._init= function() {
    this._registrations= {};
};

/**
 * Get all the listeners of a certain type *
 * @param type - The event name
 * @param useCapture
 * @returns {*}
 * @private
 */
CustomEventDispatcher.prototype._getListeners= function(type, useCapture) {
    var captype= (useCapture? '1' : '0')+type;
    if (!(captype in this._registrations))
        this._registrations[captype]= [];
    return this._registrations[captype];
};

/**
 * Add a listener of a certain type with a callback function *
 * @param type - The event name
 * @param listener - The callback function
 * @param useCapture
 */
CustomEventDispatcher.prototype.addEventListener= function(type, listener, useCapture) {
    var listeners= this._getListeners(type, useCapture);
    var ix= listeners.indexOf(listener);
    if (ix===-1)
        listeners.push(listener);
};

/**
 * Removes a listener of a certain type and with a certain callback function *
 * @param type - The event name
 * @param listener - The callback function
 * @param useCapture
 */
CustomEventDispatcher.prototype.removeEventListener= function(type, listener, useCapture) {
    var listeners= this._getListeners(type, useCapture);
    var ix= listeners.indexOf(listener);
    if (ix!==-1)
        listeners.splice(ix, 1);
};

/**
 * Dispatch an event which will be receivable by all the object's listeners *
 * @param evt
 * @returns {boolean}
 */
CustomEventDispatcher.prototype.dispatchEvent= function(evt) {
    var listeners= this._getListeners(evt.type, false).slice();
    for (var i= 0; i<listeners.length; i++)
        listeners[i].call(this, evt);
    return !evt.defaultPrevented;
};

module.exports = CustomEventDispatcher;