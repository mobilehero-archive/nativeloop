var events = require('events');

var ui = {};
module.exports = ui;

ui.createLabel = function ( params ) {
	params = createDefaultParams( params );
	fixFontAttributes( params );
	fixLines( params );
	var view = Ti.UI.createLabel( params );
	addEventListeners( params, view );	
	return view;
}



var fixFontAttributes = function(params) {
	// find any font attributes and create proper font object
	if(params && (params.fontSize || params.fontStyle || params.fontFamily || params.fontWeight || params.textStyle)) {

		params.font = params.font || {};
		params.font.fontSize = params.fontSize || params.font.fontSize;
		params.font.fontStyle = params.fontStyle || params.font.fontStyle;
		params.font.fontFamily = params.fontFamily || params.font.fontFamily;
		params.font.fontWeight = params.fontWeight || params.font.fontWeight;
		params.font.textStyle = params.textStyle || params.font.textStyle;

		delete params['fontSize'];
		delete params['fontStyle'];
		delete params['fontFamily'];
		delete params['fontWeight'];
		delete params['textStyle'];
	}
}


var fixLines = function(params) {
	if(!OS_ANDROID) {
		if(params.lines) {
			_.defaults(params.font, {
				fontSize: "15sp"
			});
			if(!!parseInt(params.font.fontSize)) {
				params.height = (Math.floor(parseInt(params.lines)) * Math.floor(parseInt(params.font.fontSize)) * 1.333) + 1;
				// console.trace("setting height height to: " + params.height);
			}
		}
	}

	return params;
}


var createDefaultParams = function(params) {
	params = _.defaults(params, {});
	return params;
}

var known_events = ["click", "dblclick", "doubletap", "focus", "keypressed", "longclick", "longpress", "pinch", "postlayout", "singletap", "swipe", "touchcancel", "touchend", "touchmove", "touchstart", "twofingertap", "return", "change", "blur", "focus"];

var addEventListeners = function(params, view) {

	var found = _.intersection(_.keys(params), known_events);
	_.forEach(found, function(event) {
		if(params[event]) {
			var actions = params[event].split("||");
			_.forEach(actions, function(action) {
				Ti.API.trace("Adding Event Listener -- " + event + ":" + action);
				view.addEventListener(event, function(e) {
					Ti.API.trace("Triggering event action -- " + action);
					events.emit(action, e);
				});

			});
		}
	});

	return view;

}
