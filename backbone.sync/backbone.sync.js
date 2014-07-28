/**
 * Backbone.sync override for Titanium using jXHR.js (https://github.com/jpntex/jXHR)
 * @author João Teixeira
 * www.jpntex.com
 * 
 */

Backbone.sync = (function() {

	// REST - CRUD
	var methodMap = {
		'create': 'POST',
		'read': 'GET',
		'update': 'PUT',
		'delete': 'DELETE'
	};

	var getModelUrl = function(object) {
		if (!(object && object.url)) return null;
		return _.isFunction(object.url) ? object.url() : object.url;
	};

	return function(method, model, options) {
		var type = methodMap[method],
			params = {
				type: type,
				contentType: 'application/json',
				dataType: 'json'
			};

		params = _.extend({}, options, params);

		// set url in the params
		params.url = params.url ? params.url : getModelUrl(model);
		if (!params.url) {
			Ti.API.debug('ERROR: NO URL DEFINED');
		}

		return $$.ajax(params);
	};
})();