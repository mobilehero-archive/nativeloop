declare module Alloy {
	export var CFG : any;
	export var Collections : any;
	export var Globals : any;
	export var Models : any;
	export var isHandheld : boolean;
	export var isTablet : boolean;
	export function createCollection (name: string, args?: any) : Backbone.Collection;
	export function createController (name: string, args?: any) : Alloy.Controller;
	export function createModel (name: string, args?: any) : Backbone.Model;
	export function createWidget (id: string, name?: string, args?: any) : Alloy.Controller;
	export module Controller {
		export function addClass (proxy: any, classes: Array<String>/String, opts?: Dictionary<Object>) : void;
		export function addListener (proxy?: any, type?: string, callback?: Function) : void;
		export function createStyle (opts: AlloyStyleDict) : Dictionary<Object>;
		export function destroy () : void;
		export function getListener (proxy?: any, type?: string) : void;
		export function getTopLevelViews () : Array.<(Titanium.UI.View|Alloy.Controller)>;
		export function getView (id?: string) : Titanium.UI.View/Alloy.Controller;
		export function getViews () : Array.<(Titanium.UI.View|Alloy.Controller)>;
		export function removeClass (proxy: any, classes: Array<String>/String, opts?: Dictionary<Object>) : void;
		export function removeListener (proxy?: any, type?: string, callback?: Function) : Alloy.Controller;
		export function resetClass (proxy: any, classes?: Array<String>/String, opts?: Dictionary<Object>) : void;
		export function updateViews (args: any) : Alloy.Controller;
		export interface UI  {
			create (apiName: string, opts: AlloyStyleDict) : Titanium.UI.View/Alloy.Controller;
		}
	}
	export module builtins {

		export interface moment  {

		}
	}
	export interface Collections  {
		instance (name: string) : Backbone.Collection;
	}
	export interface Models  {
		instance (name: string) : Backbone.Model;
	}
	export interface Widget  {
		createCollection (name: string, args?: any) : Backbone.Collection;
		createController (name: string, args?: any) : Alloy.Controller;
		createModel (name: string, args?: any) : Backbone.Model;
		createWidget (id: string, name?: string, args?: any) : Alloy.Controller;
	}
	export interface widgets  {

	}
}

declare class Dictionary<Object> extends undefined {

}

declare module Backbone {

	export interface Events extends undefined {

	}
}

declare class AlloyStyleDict  {
	apiName : string;
	classes : Array<String>;
	id : string;
}

