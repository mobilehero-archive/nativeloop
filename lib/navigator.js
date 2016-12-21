"use strict";

var Alloy = require("/alloy");

var events = require("events");

var apm = require("/node_modules/nativeloop/apm");

var __modulename = __filename;

var Navigator = function() {
    this._isInNavigatorStack = false;
    this.nav_controller = null;
    this._navStack = [];
};

module.exports = Navigator;

var navigatorStack = [];

var resolvePayload = function(payload, params) {
    var __prefix = __modulename + ".resolvePayload: ";
    apm.leaveBreadcrumb(__prefix + "entering");
    _.isNil(payload) ? payload = {} : _.isString(payload) && (payload = {
        moduleName: payload
    });
    _.isObject(params) && _.defaults(payload, params);
    _.defaults(payload, {
        animated: true
    });
    apm.leaveBreadcrumb(__prefix + "exiting");
    __prefix = null;
    return payload;
};

var parseEventHorizon = function(event) {
    var __prefix = __modulename + ".parseEventHorizon: ";
    apm.leaveBreadcrumb(__prefix + "entering");
    console.info("event = " + event);
    var params = event.split("::");
    var response = [];
    _.forEach(params, function(param) {
        if (_.includes(param, ":")) {
            var obj = {};
            _.forEach(param.split(","), function(prop) {
                var a = prop.split(":");
                a.length > 1 && _.set(obj, a[0], a[1]);
            });
            response.push(obj);
        } else response.push(param);
    });
    apm.leaveBreadcrumb(__prefix + "exiting");
    __prefix = null;
    return response;
};

Navigator.prototype.canGoBack = function() {
    var __prefix = __modulename + ".canGoBack: ";
    apm.leaveBreadcrumb(__prefix + "entering");
    return this._navStack.length > 0;
};

Navigator.prototype.goBack = function() {
    var __prefix = __modulename + ".goBack: ";
    apm.leaveBreadcrumb(__prefix + "entering");
    if (!this.canGoBack()) {
        apm.leaveBreadcrumb(__prefix + "exiting");
        return;
    }
    var previous_window = this._navStack.pop();
    this.nav_controller && this.nav_controller.goBack({
        window: previous_window,
        options: {}
    });
    apm.leaveBreadcrumb(__prefix + "exiting");
    __prefix = null;
};

Navigator.prototype.goHome = function() {
    var __prefix = __modulename + ".goHome: ";
    apm.leaveBreadcrumb(__prefix + "entering");
    if (!this.canGoBack()) {
        apm.leaveBreadcrumb(__prefix + "exiting");
        __prefix = null;
        return;
    }
    this._navStack.pop();
    this.nav_controller && this.nav_controller.goHome({
        options: {}
    });
    apm.leaveBreadcrumb(__prefix + "exiting");
    __prefix = null;
};

Navigator.prototype.go = function(payload, params) {
    var __prefix = __modulename + ".go: ";
    apm.leaveBreadcrumb(__prefix + "entering");
    apm.leaveBreadcrumb(__prefix + "payload: " + JSON.stringify(payload, params));
    if (!this._isInNavigatorStack) {
        navigatorStack.push(this);
        this._isInNavigatorStack = true;
    }
    this.performNavigation(resolvePayload(payload, params));
    apm.leaveBreadcrumb(__prefix + ".exiting");
    __prefix = null;
};

Navigator.prototype.performNavigation = function(payload) {
    var __prefix = __modulename + ".performNavigation: ";
    apm.leaveBreadcrumb(__prefix + "entering");
    this._navStack.push(payload);
    if (this.nav_controller) this.nav_controller.navigate(payload); else {
        this.nav_controller = Alloy.createWidget("nativeloop", "navigator", {
            root: payload
        });
        this.nav_controller.getView().open();
    }
    apm.leaveBreadcrumb(__prefix + "exiting");
    __prefix = null;
};

Navigator.topmost = function() {
    var __prefix = __modulename + ".topmost: ";
    apm.leaveBreadcrumb(__prefix + "entering");
    if (navigatorStack.length > 0) {
        apm.leaveBreadcrumb(__prefix + "exiting - returning topmost navigator");
        return navigatorStack[navigatorStack.length - 1];
    }
    apm.leaveBreadcrumb(__prefix + "exiting - no navigators found");
    __prefix = null;
    return void 0;
};

events.on("nav::open::**", function(e, args) {
    var __prefix = __modulename + "nav::open::** ";
    apm.leaveBreadcrumb(__prefix + "entering");
    var commands = parseEventHorizon(this.event, args);
    if (commands.length < 3) {
        console.error("[frame] Attempted to call nav::open with no target");
        apm.leaveBreadcrumb(__prefix + "exiting");
        __prefix = null;
        return;
    }
    Navigator.topmost().navigate(commands[2], commands[3] || args);
    apm.leaveBreadcrumb(__prefix + "exiting");
    __prefix = null;
});

events.on("nav::open::*", function() {
    var __prefix = __modulename + "nav::open::* ";
    apm.leaveBreadcrumb(__prefix + "entering");
    console.info("event = " + this.event);
    var split = this.event.split("::");
    split.length > 2 && Navigator.topmost().go(split[2]);
    apm.leaveBreadcrumb(__prefix + "exiting");
    __prefix = null;
});

events.on("nav::back", function() {
    var __prefix = __modulename + "nav::back ";
    apm.leaveBreadcrumb(__prefix + "entering");
    console.info("event = " + this.event);
    Navigator.topmost().goBack();
    apm.leaveBreadcrumb(__prefix + "exiting");
    __prefix = null;
});

events.on("nav::*", function() {
    var __prefix = __modulename + "nav::* ";
    apm.leaveBreadcrumb(__prefix + "entering");
    console.info("nav event = " + this.event);
    apm.leaveBreadcrumb(__prefix + "exiting");
    __prefix = null;
});