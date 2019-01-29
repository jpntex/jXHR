/**
 * XHR with Deferreds (based on jQuery's $.ajax) for Titanium Alloy
 * @author João Teixeira
 * @version  1.1
 * 
 * TODO:
 * - image methods (get in blob and save to file (cache))
 *
 * PERFORMANCE:
 * - implement ETags
 * - cache them all!!!!
 * - change q.js for a perf wise deferred lib
 */

var Q = Q || require('q');

var jXHR = {
	// regex helpers
	regex: {
		xml: /xml/,
		json: /json/,
		text: /text/,
		blob: /(image|audio|video)/,
		param: /\?/,
		r20: /%20/g
	},
	accepts: {
		'*': '*/'.concat('*'),
		all: '*/'.concat('*'),
		text: 'text/plain',
		html: 'text/html',
		xml: 'application/xml, text/xml',
		json: 'application/json'
		//json: 'application/json, text/javascript'
	},
	responseFields: {
		blob: 'responseData',
		xml: 'responseXML',
		text: 'responseText',
		json: 'responseText'
	},
	// 'json': text to json, etc
	converters: {
		'text': String,
		'json': JSON.parse,
		'xml': Ti.XML.parseString
	},
	// Cache locations (to be implemented)
	/*paths: {
		image: '/img/'
	},*/
	defaults: {
		url: '',
		type: 'GET',
		contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
		success: function() {},
		error: function() {},
		complete: function() {},
		//data: null,
		headers: {},
		async: true,
		timeout: 10000,
		parse: true
		//username: null,
		//password: null,
	},
	createXHR: function(timeout) {
		return Ti.Network.createHTTPClient({
			enableKeepAlive: false,
			timeout: timeout
		});
	},
	ajax: function(url, options) {
		if (typeof url === "object") {
			options = url;
			url = undefined;
		}

		options = options || {};

		//opt = _.extend({}, XHR.defaults, options)
		var dfd = Q.defer(),
			// merge options with defaults
			o = _.extend({}, jXHR.defaults, options),

			// real xhr
			xhr = jXHR.createXHR(o.timeout),

			// xhr functions we want to expose
			_xhr = {
				//readyState: xhr.readyState,

				abort: function() {
					if (xhr.status !== 0) {
						xhr.abort();
					}

					o.error(_xhr, 'aborted', 'aborted');
					dfd.reject('Aborted');
				}
			},

			// check the method to know what to do with data
			hasContent = (o.type === 'POST' || o.type === 'PUT') && o.data;


		// define callbacks
		o.success = _.isFunction(o.success) ? o.success : function() {};
		o.error = _.isFunction(o.error) ? o.error : function() {};
		o.complete = _.isFunction(o.complete) ? o.complete : function() {};

		// set url
		o.url = url || o.url;

		// handle data
		if (!hasContent) {
			if (o.data) o.url = jXHR.setURLParams(o.url, o.data);
		} else {
			if (o.contentType === 'application/json') {
				try {
					o.data = JSON.stringify(o.data);
				} catch (e) {
					logger('[jXHR]', 'PARSE ERROR', e.message);
					logger('[jXHR]', 'PARSE ERROR', o.data);
				}
			} else {
				o.data = jXHR.serializeData(o.data);
			}
		}

		// Result object
		var response = {};

		xhr.onload = function(e) {
			var error,
				status = this.status,
				statusText = this.statusText,
				// Determine if successful
				isSuccess = status >= 200 && status < 300 || status === 304;


			if (isSuccess) {

				// if no content
				if (status === 204 || o.type === 'HEAD') {
					statusText = 'nocontent';

					// if not modified
				} else if (status === 304) {
					statusText = 'notmodified';

					// if we have data
				} else {
					var contentType = (o.dataType && jXHR.responseFields[o.dataType]) ? o.dataType : jXHR.getContentType(xhr);
					response.data = this[jXHR.responseFields[contentType]];

					// Parse the content if not blob
					if (contentType !== 'blob' && o.parse) {
						try {
							response.data = jXHR.converters[contentType](response.data);
						} catch (e) {
							logger('[jXHR]', 'PARSE ERROR', e.message);
							logger('[jXHR]', 'PARSE ERROR', response.data);
						}
					}
				}
			} else {
				error = statusText;
				if (status || !statusText) {
					statusText = "error";
				}
			}

			_xhr.status = status;
			_xhr.statusText = (this.statusText || statusText) + "";

			// Success/Error
			if (isSuccess) {
				o.success({
					data: response.data,
					status: status,
					xhr: _xhr
				});
				dfd.resolve({
					data: response.data,
					status: status,
					xhr: _xhr
				});
			} else {
				o.error({
					xhr: _xhr,
					status: status,
					error: error
				});
				dfd.reject({
					xhr: _xhr,
					status: status,
					error: error
				});
			}
			o.complete();
		};

		xhr.onerror = function(e) {
			logger('[jXHR]', 'ERROR: ' + e.error, this);

			var statusText = e.error,
				status = this.status,
				error = this.responseText;

			_xhr.status = status;
			_xhr.statusText = statusText;
			error = error || statusText;

			o.error({
				xhr: _xhr,
				status: status,
				error: error
			});
			dfd.reject({
				xhr: _xhr,
				status: status,
				error: error
			});
			o.complete();
		};

		xhr.ondatastream = function(e) {
			// function called as data is downloaded	
			// value from 0.0 - 1.0
			_xhr.progress = e.progress;
			dfd.notify(e.progress);
		};

		xhr.onsendstream = function(e) {
			// function called as data is uploaded
			_xhr.progress = e.progress;
			dfd.notify(e.progress);
		};

		// set xhr variables
		xhr.open(o.type, o.url, o.async);

		// Convert data if not already a string
		if (o.data && o.data !== 'string') {}

		// Uppercase the type
		o.type = o.type.toUpperCase();

		// Only set ContentType if there is anything to send
		if (o.data && hasContent && o.contentType) {
			xhr.setRequestHeader("Content-Type", o.contentType);
		}

		// Set the Accept Header
		// TODO: accept multiple dataTypes
		if (o.dataType && jXHR.accepts[o.dataType]) {
			if (jXHR.accepts[o.dataType]) {
				xhr.setRequestHeader('Accept', jXHR.accepts[o.dataType]);
			} else {
				xhr.setRequestHeader('Accept', o.dataType);
			}
		} else {
			xhr.setRequestHeader('Accept', jXHR.accepts['*']);
		}

		// Set all headers from options
		for (var i in o.headers) {
			xhr.setRequestHeader(i, _.isFunction(o.headers[i]) ? o.headers[i]() : o.headers[i]);
		}

		// Send data for methods that support message body
		if (hasContent) {
			xhr.send(o.data);
		} else {
			xhr.send();
		}

		// Attach Fake jXHR to Deferred
		return _.extend(dfd.promise, _xhr);
	},
	get: function(url, data, callback, type) {
		if (_.isFunction(data)) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jXHR.ajax({
			url: url,
			type: 'GET',
			data: data,
			success: callback,
			dataType: type
		});
	},
	post: function(url, data, callback, type) {
		if (_.isFunction(data)) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jXHR.ajax({
			url: url,
			type: 'POST',
			data: data,
			success: callback,
			dataType: type
		});
	},
	getJSON: function(url, data, callback) {
		return jXHR.get(url, data, callback, 'json');
	},
	put: function(url, data, callback) {
		if (_.isFunction(data)) {
			callback = data;
			data = undefined;
		}

		return jXHR.ajax({
			url: url,
			type: 'PUT',
			data: data,
			success: callback
		});
	},
	destroy: function(url, data, callback) {
		if (_.isFunction(data)) {
			callback = data;
			data = undefined;
		}

		return jXHR.ajax({
			url: url,
			type: 'DELETE',
			data: data,
			success: callback
		});
	},
	// helpers
	getContentType: function(xhr) {
		var contentType = xhr.getResponseHeader("Content-Type");

		if (jXHR.regex.json.test(contentType)) return 'json';
		if (jXHR.regex.xml.test(contentType)) return 'xml';
		if (jXHR.regex.text.test(contentType)) return 'text';
		return 'blob';
	},
	setURLParams: function(url, params) {
		var valid = true;

		if (typeof params !== 'object') {
			try {
				params = JSON.parse(params);
			} catch (e) {
				valid = false;
				logger('[jXHR]' + 'PARAMS PARSE ERROR', e.message);
				logger('[jXHR]' + 'PARAMS PARSE ERROR', params);
			}
		}

		if (valid) {
			var sep = '?';
			if (jXHR.regex.param.test(url)) sep = '&';

			for (var i in params) {
				url = url + sep + Ti.Network.encodeURIComponent(i) + '=' + Ti.Network.encodeURIComponent(params[i]);
				sep = '&';
			}
		}

		return url.replace(jXHR.regex.r20, "+");
	},
	serializeData: function(data) {
		var s = [];

		if (typeof data === 'object') {
			for (var key in data) {
				s[s.length] = Ti.Network.encodeURIComponent(key) + '=' + Ti.Network.encodeURIComponent(data[key]);
			}
		} else {
			return data;
		}

		return s.join('&').replace(jXHR.regex.r20, "+");
	}
};

// Log All the Errors!!!
function logger(header, message, data) {
	Ti.API.debug(header + " " + message);
	if (data) {
		Ti.API.debug(typeof data === 'object' ? JSON.stringify(data, null, '\t') : data);
	}
}

module.exports = jXHR;
