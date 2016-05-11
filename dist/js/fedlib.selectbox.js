/*!
 * # UI - Selectbox
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

$.fn.selectbox = function(parameters) {
	var $allModules = $.isFunction(this) ? $(window) : $(this);
	var moduleSelector = $allModules.selector || '';

	var query = arguments[0];
	var methodInvoked = (typeof query == 'string');
	var queryArguments = [].slice.call(arguments, 1);

	var returnedValue;

	$allModules.each(function(){
		var settings = ($.isPlainObject(parameters)) 
			? $.extend(true, {}, $.fn.selectbox.settings, parameters) 
			: $.extend({}, $.fn.selectbox.settings);

		var namespace = settings.namespace;

		var eventNamespace = '.' + namespace;
		var moduleNamespace = 'module-' + namespace;

		var selector = settings.selector;

		var template = settings.template;

		var $module = $(this);

		var $module_option = $module.find('option');

		var $ui;
		var $ui_selectButton;
		var $ui_selectedText;
		var $ui_optionContainer;
		var $ui_optionButton;

		var instance = $module.data(moduleNamespace);

		var element = this;
		var module;

		module = {
			initialize: function() {
				module.ui.build();
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
					$ui_selectButton.on('click' + eventNamespace, module.event.select_click);
					$ui_optionButton.on('click' + eventNamespace, module.event.option_click);
				}
			},

			event: {
				select_click: function(event) {
					module.ui.options.toggle();
					return false;
				},
				option_click: function(event) {
					var opt = $(this);
					var text = opt.text();
					var index = opt.index();
					
					$ui_selectedText.text(text);
					$module_option.eq(index).prop('selected',true);

					module.ui.options.close();
					return false;	
				}
			},

			ui: {
				build: function() {
					$module.after(template.ui);

					$ui = $module.next();
					$ui_selectButton = $ui.find(selector.selectBtn);
					$ui_selectedText = $ui.find(selector.selectedText);
					$ui_optionContainer = $ui.find(selector.optionContainer);

					$module.find('option').each(function(idx) {
						var text = $(this).text();
						$ui_optionContainer.append(template.option.replace('{{text}}',text));
					});

					$ui_optionButton = $ui.find(selector.optionBtn);

					$ui_selectedText.text($module.find(':selected').text());
				},
				options: {
					open: function() {
						$ui_optionContainer.show();
					},
					close: function() {
						$ui_optionContainer.hide();
					},
					toggle: function() {
						$ui_optionContainer.toggle();
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

$.fn.selectbox.settings = {
	name: 'Selectbox',
	namespace: 'selectbox',

	selector: {
		selectBtn: 'button.select',
		optionBtn: 'button.option',
		selectedText: 'span.selected-text',
		optionContainer: 'div.options'
	}
	template: {
		ui: '<div class="ui-selectbox"><button class="select"><span class="selected-text"></span></button><div class="options"></div></div>',
		option: '<button class="option">{{text}}</button>'
	}	
}

})( jQuery, window, document );

