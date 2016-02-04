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
	var $allModules = $.isFunction(this) ? $(window) : $(this);
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
		var ajaxSettings = settings.ajaxSettings;

		var $module = $(this);
		var $context;
		var $tabs;

		var instance = $module.data(moduleNamespace);

		var element = this;
		var module;

		module = {
			initialize: function() {
				if (settings.context == 'parent') {
					if ($module.closest(selector.navsWrap).length > 0) {
						$context = $module.closest(selector.navsWrap).parent();
					} else {
						$context = $module.parent();
					}
				} else if (settings.context) {
					$context = $(settings.context);
				} else {
					$context = $('body');
				}

				$tabs = $context.find(selector.tabs);

				if ($module.index() == 0 && !module.has.siblingActive($module)) {
					module.activate.all($module.data(dataName.tab));
				}
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
					if (!$.isWindow(element)) {
						$module.on('click' + eventNamespace, module.event.click);
					}
				}
			},

			event: {
				click: function(event) {
					module.changeTab($module.data(dataName.tab));
					return false;
				}
			},

			changeTab: function(tabPath) {
				var insideDefaultPath = module.get.defaultPath(tabPath);

				module.activate.all(tabPath);

				if (insideDefaultPath) {
					module.changeTab(insideDefaultPath);
				}
			},

			has: {
				siblingActive: function(obj) {
					return obj.siblings().hasClass(className.active);
				}
			},

			get: {
				defaultPath: function(tabPath) {
					var $defaultNav = $allModules.filter('[data-'+dataName.tab+'^="'+tabPath+'/"]').eq(0);
					
					return $defaultNav.data(dataName.tab);
				},
				tabElement: function(tabPath) {
					return $tabs.filter('[data-'+dataName.tab+'="'+tabPath+'"]');
				},
				navElement: function(tabPath) {
					return $allModules.filter('[data-'+dataName.tab+'="'+tabPath+'"]');
				}
			},

			ajax: {
				content: function(tabPath) {
					var url = ajaxSettings.urlTemplate;
					var keys = url.match(/\{\$*[A-z0-9]+\}/g);
					var targetTab = module.get.tabElement(tabPath);

					if (!targetTab.data('isLoaded') || ajaxSettings.refresh) {
						$.each(keys, function(index, key) {
							 url = url.replace(key, $module.data(key.substr(1, key.length - 2)));
						});

						targetTab.addClass(className.loading);
						$.ajax({
							url: url,
							cache: ajaxSettings.cache,
							success: function(data) {
								targetTab.data('isLoaded', true)
										 .removeClass(className.loading)
										 .html(data);
								settings.onAjaxSuccess.call(this, tabPath);
							},
							error: function() {
								settings.onAjaxError.call(this, tabPath);
							},
							complete: function() {
								settings.onAjaxComplete.call(this, tabPath);
							}
						});
					}
				}
			},

			activate: {
				all: function(tabPath) {
					module.activate.tab(tabPath);
					module.activate.nav(tabPath);

					if (ajaxSettings.active) {
						module.ajax.content(tabPath);
					}
				},
				tab: function(tabPath) {
					var $tab = module.get.tabElement(tabPath);
					var isActive = $tab.hasClass(className.active);
					if (!isActive) {
						$tab.addClass(className.active).siblings().removeClass(className.active);
						settings.onActive.call($tab[0], tabPath);
					}
				},
				nav: function(tabPath) {
					var $nav = module.get.navElement(tabPath);
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

$.tab = function() {
	$(window).tab.apply(this, arguments);
};

$.fn.tab.settings = {
	name: 'Tab',
	namespace: 'tab',

	context: false,	

	onActive: function(tabPath) {},	// called on tab active
	onAjaxSuccess: function(tabPath) {},
	onAjaxError: function(tabPath) {},
	onAjaxComplete: function(tabPath) {},

	ajaxSettings: {
		active: false,
		urlTemplate: '{url}',
		cache: true,
		refresh: false
	},

	selector: {
		navsWrap: '.tab-menu',
		tabs: '.tab-content'
	},
	className: {
		active: 'active',
		loading: 'loading'
	},
	dataName: {
		tab: 'tab'
	}
}

})( jQuery, window, document );

