"use strict";

var apm;

var wrapper = {
    appid: Ti.App.Properties.getString("com-appcelerator-apm-id") || "unknown",
    username: "anonymous",
    optOutStatus: false,
    metadata: {},
    userUUID: Ti.App.guid,
    didCrash: false,
    debug: false,
    shouldCollectLogcat: false
};

wrapper.didCrashOnLastAppLoad = function() {
    if (apm) return apm.didCrashOnLastAppLoad();
    return wrapper.didCrash;
};

wrapper.getOptOutStatus = function() {
    if (apm) return apm.getOptOutStatus();
    return wrapper.optOutStatus;
};

wrapper.getUserUUID = function() {
    if (apm) return apm.getUserUUID();
    return wraper.userUUID;
};

wrapper.init = function(appid, config) {
    wrapper.appid = appid || Ti.App.Properties.getString("com-appcelerator-apm-id") || wrapper.appid;
    config = config || {};
    _.isUndefined(config.shouldCollectLogcat) || (wrapper.shouldCollectLogcat = config.shouldCollectLogcat);
    try {
        apm = require("com.appcelerator.apm");
        apm.init(wrapper.appid, config);
    } catch (error) {
        Ti.API.warn("com.appcelerator.apm module is not available");
    }
};

wrapper.leaveBreadcrumb = function(breadcrumb) {
    false;
    apm && apm.leaveBreadcrumb(breadcrumb);
};

wrapper.logHandledException = function(error) {
    false;
    try {
        apm && apm.logHandledException(error);
    } catch (ex) {
        Ti.API.error("[APM] Error calling apm.logHandledException() → " + ex);
    }
};

wrapper.setMetadata = function(key, value) {
    wrapper.metadata[key] = value;
    false;
    apm && wrapper.apm.setMetadata(key, value);
};

wrapper.setOptOutStatus = function(optOutStatus) {
    wrapper.optOutStatus = optOutStatus;
    false;
    apm && apm.setOptOutStatus(optOutStatus);
};

wrapper.setUsername = function(username) {
    wrapper.username = username;
    false;
    apm && apm.setUsername(username);
};

module.exports = wrapper;