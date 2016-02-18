/*!
 * # UI - Accordion
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

$.fn.accordion = function(parameters) {
	var $allModules = $.isFunction(this) ? $(window) : $(this);
	var moduleSelector = $allModules.selector || '';

	var query = arguments[0];
	var methodInvoked = (typeof query == 'string');
	var queryArguments = [].slice.call(arguments, 1);

	var returnedValue;

	$allModules.each(function(){
		var settings = ($.isPlainObject(parameters)) 
			? $.extend(true, {}, $.fn.accordion.settings, parameters) 
			: $.extend({}, $.fn.accordion.settings);

		var namespace = settings.namespace;

		var eventNamespace = '.' + namespace;
		var moduleNamespace = 'module-' + namespace;

		var selector = settings.selector;
		var className = settings.className;
		var ajaxSettings = settings.ajaxSettings;

		var $module = $(this);
		var $title = $module.find(selector.title);
		var $content = $module.find(selector.content);

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
				$module.removeData(moduleNamespace).off(eventNamespace);
			},

			bind: {
				events: function() {
					$module.on('click' + eventNamespace, selector.trigger, module.event.click);
				}
			},

			event: {
				click: function(event) {
					module.toggle.call(this);
					return false;
				}
			},

			toggle: function(target) {
				var $targetTitle = module.get.targetTitle.call(this, target);
				var isActive = $targetTitle.hasClass(className.active);

				if (isActive) {
					module.close($targetTitle);
				} else {
					module.open($targetTitle);
				}
			},

			open: function(target) {
				var $targetTitle = module.get.targetTitle.call(this, target);
				var $targetContent = $targetTitle.nextUntil(selector.title, selector.content);

				$targetTitle.addClass(className.active);
				$targetContent.addClass(className.active);

				if (settings.alone) module.closeOthers(target);

				if (ajaxSettings.active) {
					module.ajax.content($targetTitle, $targetContent);
				}
			},

			close: function(target) {
				var $targetTitle = module.get.targetTitle.call(this, target);
				var $targetContent = $targetTitle.nextUntil(selector.title, selector.content);

				$targetTitle.removeClass(className.active);
				$targetContent.removeClass(className.active);
			},

			closeOthers: function(target) {
				var $targetTitle = module.get.targetTitle.call(this, target);
				var $targetParent = $targetTitle.parents(selector.accordion).eq(0);

				$targetParent.find('> ' + selector.title).not($targetTitle).each(function(){
					module.close($(this));
				});
			},

			openAll: function() {
				$title.addClass(className.active);
				$content.addClass(className.active);

				if (ajaxSettings.active) {
					$title.each(function(idx){
						module.ajax.content($title.eq(idx), $content.eq(idx));
					});
				}
			},

			closeAll: function() {
				$title.removeClass(className.active);
				$content.removeClass(className.active);
			},

			get: {
				targetTitle: function(target) {
					var $returnTitle;

					if (target === undefined) {
						$returnTitle = $(this).closest(selector.title);
					} else if (typeof(target) === 'number') {
						$returnTitle = $title.eq(target);
					} else {
						$returnTitle = target;
					}

					return $returnTitle;
				}
			},

			ajax: {
				content: function($targetTitle, $targetContent) {
					var url = ajaxSettings.urlTemplate;
					var keys = url.match(/\{\$*[A-z0-9]+\}/g);

					if (!$targetContent.data('isLoaded') || ajaxSettings.refresh) {
						$.each(keys, function(index, key) {
							 url = url.replace(key, $targetTitle.data(key.substr(1, key.length - 2)));
						});

						$targetContent.addClass(className.loading);
						$.ajax({
							url: url,
							cache: ajaxSettings.cache,
							success: function(response) {
								$targetContent.data('isLoaded', true)
										.removeClass(className.loading)
										.html(response);
								settings.onAjaxSuccess.call(this, $targetTitle, $targetContent);
							},
							error: function() {
								settings.onAjaxError.call(this, $targetTitle, $targetContent);
							},
							complete: function() {
								settings.onAjaxComplete.call(this, $targetTitle, $targetContent);
							}
						});
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

$.fn.accordion.settings = {
	name: 'Accordion',
	namespace: 'accordion',

	alone: true,

	onAjaxSuccess: function($title, $content) {},
	onAjaxError: function($title, $content) {},
	onAjaxComplete: function($title, $content) {},

	ajaxSettings: {
		active: false,
		urlTemplate: '{url}',
		cache: true,
		refresh: false
	},

	selector: {
		accordion: '.accordion',
		title: '.title',
		trigger: '.title',
		content: '.content',
	},
	className: {
		active: 'active',
		loading: 'loading'
	}
}

})( jQuery, window, document );

