/*!
 * # UI - Tab
 * http://github.com/.../.../
 *
 *
 * Copyright 2015 Contributors
 * Released under the MIT license
 * http://opensource.org/licenses/MIT
 *
 */

;(function ( $, window, document, undefined ) {

"use strict";

$.fn.tab = function(parameters) {
	
	var $allModules = $(this);
	var moduleSelector = $allModules.selector || '';

	var query = arguments[0];
	var methodInvoked = (typeof query == 'string');
	var queryArguments = [].slice.call(arguments, 1);

	var returnedValue;

	$allModules.each(function(){
		var settings = ($.isPlainObject(parameters)) 
			? $.extend(true, {}, $.fn.tab.settings, parameters) 
			: $.extend({}, $.fn.tab.settings);

		var namespace = settings.namespace;

		var eventNamespace = '.' + namespace;
		var moduleNamespace = 'module-' + namespace;

		var selector = settings.selector;
		var className = settings.className;
		var dataName = settings.dataName;

		var $module = $(this);

		var instance = $module.data(moduleNamespace);

		var element = this;
		var module;

		module = {
			initialize: function() {
				module.bind.events();
				module.instantiate();
			},

			instantiate: function() {
				instance = module;
				$module.data(moduleNamespace, module);
			},

			destroy: function() {

			},

			bind: {
				events: function() {
					$module.on('click' + eventNamespace, module.event.click);
				}
			},

			event: {
				click: function(event) {
					module.changeTab();
				}
			},

			changeTab: function() {
				module.activate.all();
			},

			activate: {
				all: function() {
					module.activate.tab();
					module.activate.nav();
				},
				tab: function() {
					var $tab = $(selector.tabs).filter('[data-'+dataName.tab+'='+$module.data(dataName.tab)+']');
					var isActive = $tab.hasClass(className.active);
					if (!isActive) {
						$tab.addClass(className.active).siblings().removeClass(className.active);
					}
				},
				nav: function() {
					var $nav = $module;
					var isActive = $nav.hasClass(className.active);
					if (!isActive) {
						$nav.addClass(className.active).siblings().removeClass(className.active);
					}
				}
			},

			invoke: function(query, passedArguments, context) {
				var object = instance;
				var maxDepth;
				var found;
				var response;

				passedArguments = passedArguments || queryArguments;
				context = element || context;

				if (typeof query == 'string' && object !== undefined) {
					query = query.split(/[\. ]/);
					maxDepth = query.length - 1;
					$.each(query, function(depth, value) {
						var camelCaseValue = (depth != maxDepth)
							? value + query[depth + 1].charAt(0).toUpperCase() + query[depth + 1].slice(1)
							: query;

						if ($.isPlainObject(object[camelCaseValue]) && (depth != maxDepth)) {
							object = object[camelCaseValue];
						} else if (object[camelCaseValue] !== undefined) {
							found = object[camelCaseValue];
							return false;
						} else if ($.isPlainObject(object[value]) && (depth != maxDepth)) {
							object = object[value];
						} else if (object[value] !== undefined) {
							found = object[value];
							return false;
						} else {
							return false;
						}
					});
				}
				if ($.isFunction(found)) {
					response = found.apply(context, passedArguments);
				} else if (found !== undefined) {
					response = found;
				}
				if ($.isArray(returnedValue)) {
					returnedValue.push(response);
				} else if (returnedValue !== undefined) {
					returnedValue = [returnedValue, response];
				} else if (response !== undefined) {
					returnedValue = response;
				}
				return found;
			}
		};

		if (methodInvoked) {
			if (instance === undefined) {
				module.initialize();
			}
			module.invoke(query);
		} else {
			if (instance !== undefined) {
				instance.invoke('destroy');
			}
			module.initialize();
		}

	});
	return (returnedValue !== undefined) ? returnedValue : this;
};

$.fn.tab.settings = {
	name: 'Tab',
	namespace: 'tab',

	selector: {
		tabs: '.tab-content'
	},
	className: {
		active: 'active'
	},
	dataName: {
		tab: 'tab'
	}
}

})( jQuery, window, document );

