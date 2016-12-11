var ux = require("nativeloop/ux");

ux.fixFontAttributes($.args);
ux.fixLines($.args);

var view = Ti.UI.createLabel(params);
$.addTopLevelView(view);