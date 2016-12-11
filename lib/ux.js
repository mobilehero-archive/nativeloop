var ux = {};
module.exports = ux;

ux.fixFontAttributes = function(params) {
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


ux.fixLines = function(params) {
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


ux.createDefaultParams = function(params) {
	params = _.defaults(params, {});
	return params;
}