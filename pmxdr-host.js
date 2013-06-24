/**
 * pmxdr host v0.0.6
 * postMessage Cross-Domain Requester host library
 * http://code.eligrey.com/pmxdr/host/
 *
 * By Eli Grey, http://eligrey.com
 *
 * Simple cross-site HTTP requesting using the postMessage API
 *
 * License: X11/MIT Licence
 */

/*! @source http://purl.eligrey.com/github/pmxdr/blob/master/pmxdr-host.js*/

/* example alwaysTrustedOrigins settings:

var alwaysTrustedOrigins = [
    // any origin on any protocol that has a domain that ends in eligrey.com
    /^[\w-]+:(?:\/\/)?(?:[\w\.-]+\.)?eligrey\.com(?::\d+)?$/,

    // only http://www.google.com is allowed,
	// not http://foo.google.com:30 or http://google.com
    "http://www.google.com",

    // Allow http and https from example.com and *.example.com
    /^https?:\/\/([\w\.-]+\.)?example\.com$/
];

*/

/* The following code blocks implement JSON.parse as pulled from 
 *     https://code.google.com/p/json-sans-eval/
 * because it's safer than using eval() and JSON.stringify from json2.js in
 *     https://github.com/douglascrockford/JSON-js
 * The code's been minified.  If you don't trust these sections of code,
 * replace them with your own JSON.parse and JSON.stringify.
 */
if (typeof JSON !== 'object') {
	this.JSON = {};
}

/*jslint evil:true*/  // Get around jslint's warning about eval
if (!JSON.parse) {
	eval('JSON.parse=function(){function e(e,r,t){return r?i[r]:String.fromCharCode(parseInt(t,16))}var r="(?:-?\\\\b(?:0|[1-9][0-9]*)(?:\\\\.[0-9]+)?(?:[eE][+-]?[0-9]+)?\\\\b)",t=\'(?:[^\\\\0-\\\\x08\\\\x0a-\\\\x1f"\\\\\\\\]|\\\\\\\\(?:["/\\\\\\\\bfnrt]|u[0-9A-Fa-f]{4}))\';t=\'(?:"\'+t+\'*")\';var a=RegExp("(?:false|true|null|[\\\\{\\\\}\\\\[\\\\]]|"+r+"|"+t+")","g"),n=RegExp("\\\\\\\\(?:([^u])|u(.{4}))","g"),i={\'"\':\'"\',"/":"/","\\\\":"\\\\",b:"\\b",f:"\\f",n:"\\n",r:"\\r",t:"	"},f=new String(""),l=Object.hasOwnProperty;return function(r,t){r=r.match(a);var i,o=r[0],h=!1;"{"===o?i={}:"["===o?i=[]:(i=[],h=!0);for(var s,c=[i],u=1-h,g=r.length;g>u;++u){o=r[u];var v;switch(o.charCodeAt(0)){default:v=c[0],v[s||v.length]=+o,s=void 0;break;case 34:if(o=o.substring(1,o.length-1),-1!==o.indexOf("\\\\")&&(o=o.replace(n,e)),v=c[0],!s){if(!(v instanceof Array)){s=o||f;break}s=v.length}v[s]=o,s=void 0;break;case 91:v=c[0],c.unshift(v[s||v.length]=[]),s=void 0;break;case 93:c.shift();break;case 102:v=c[0],v[s||v.length]=!1,s=void 0;break;case 110:v=c[0],v[s||v.length]=null,s=void 0;break;case 116:v=c[0],v[s||v.length]=!0,s=void 0;break;case 123:v=c[0],c.unshift(v[s||v.length]={}),s=void 0;break;case 125:c.shift()}}if(h){if(1!==c.length)throw Error();i=i[0]}else if(c.length)throw Error();if(t){var b=function(e,r){var a=e[r];if(a&&"object"==typeof a){var n=null;for(var i in a)if(l.call(a,i)&&a!==e){var f=b(a,i);void 0!==f?a[i]=f:(n||(n=[]),n.push(i))}if(n)for(i=n.length;--i>=0;)delete a[n[i]]}return t.call(e,r,a)};i=b({"":i},"")}return i}}();');
}
if (!JSON.stringify) {
	eval('(function(){function t(t){return 10>t?"0"+t:t}function e(t){return u.lastIndex=0,u.test(t)?\'"\'+t.replace(u,function(t){var e=i[t];return"string"==typeof e?e:"\\\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})+\'"\':\'"\'+t+\'"\'}function n(t,u){var i,p,s,c,l,a=o,y=u[t];switch(y&&"object"==typeof y&&"function"==typeof y.toJSON&&(y=y.toJSON(t)),"function"==typeof f&&(y=f.call(u,t,y)),typeof y){case"string":return e(y);case"number":return isFinite(y)?y+"":"null";case"boolean":case"null":return y+"";case"object":if(!y)return"null";if(o+=r,l=[],"[object Array]"===Object.prototype.toString.apply(y)){for(c=y.length,i=0;c>i;i+=1)l[i]=n(i,y)||"null";return s=0===l.length?"[]":o?"[\\n"+o+l.join(",\\n"+o)+"\\n"+a+"]":"["+l.join(",")+"]",o=a,s}if(f&&"object"==typeof f)for(c=f.length,i=0;c>i;i+=1)"string"==typeof f[i]&&(p=f[i],s=n(p,y),s&&l.push(e(p)+(o?": ":":")+s));else for(p in y)Object.prototype.hasOwnProperty.call(y,p)&&(s=n(p,y),s&&l.push(e(p)+(o?": ":":")+s));return s=0===l.length?"{}":o?"{\\n"+o+l.join(",\\n"+o)+"\\n"+a+"}":"{"+l.join(",")+"}",o=a,s}}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+t(this.getUTCMonth()+1)+"-"+t(this.getUTCDate())+"T"+t(this.getUTCHours())+":"+t(this.getUTCMinutes())+":"+t(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()});var o,r,f,u=/[\\\\\\"\\x00-\\x1f\\x7f-\\x9f\\u00ad\\u0600-\\u0604\\u070f\\u17b4\\u17b5\\u200c-\\u200f\\u2028-\\u202f\\u2060-\\u206f\\ufeff\\ufff0-\\uffff]/g,i={"\\b":"\\\\b","	":"\\\\t","\\n":"\\\\n","\\f":"\\\\f","\\r":"\\\\r",\'"\':\'\\\\"\',"\\\\":"\\\\\\\\"};JSON.stringify=function(t,e,u){var i;if(o="",r="","number"==typeof u)for(i=0;u>i;i+=1)r+=" ";else"string"==typeof u&&(r=u);if(f=e,e&&"function"!=typeof e&&("object"!=typeof e||"number"!=typeof e.length))throw Error("JSON.stringify");return n("",{"":t})}})();');
}
/*jslint evil:false*/

/*global Event, window, XMLHttpRequest*/
(function (undef) {
	'use strict';

	var alwaysTrustedOrigins;

	alwaysTrustedOrigins = [
		// Add any origins here that are always trusted.
		// Can be exact strings or regular expressions.
	];


	/**
	 * Clean a header response
	 *
	 * Trim and remove ALL whitespace.  This is because either we want
	 * one value or we want a list separated by commas and optional
	 * whitespace.
	 *
	 * @param string dirty
	 * @return string clean
	 */
	function cleanHeader(dirty) {
		var clean;
		clean = dirty.replace(/[ \n\r\t]/g, '').toUpperCase();
		return clean;
	}


	/**
	 * Return an object of all headers
	 *
	 * @param XMLHttpRequest request
	 * @return Object
	 */
	function getAllHeaders(request) {
		var headers, header, i, responseHeaders;
		headers = {};
		responseHeaders = request.getAllResponseHeaders().split(/\r?\n/);

		for (i = 0; i < responseHeaders.length; i += 1) {
			header = responseHeaders[i].split(": ");
			headers[header[0].toLowerCase()] = header[1];
		}

		return headers;
	}


	/**
	 * Gets a single header from a response
	 *
	 * This can throw in rare instances, thus the try/catch block
	 *
	 * @param XMLHttpRequest request
	 * @return object
	 */
	function getHeader(request, name) {
		try {
			return request.getResponseHeader(name);
		} catch (e) {
			return '';
		}
	}


	/**
	 * Gets headers that are related to CORS checks
	 *
	 * @param XMLHttpRequest request
	 * @return object
	 */
	function getCorsHeaders(request) {
		return {
			origin: getHeader(request, 'Access-Control-Allow-Origin'),
			methods: getHeader(request, 'Access-Control-Allow-Methods')
		};
	}


	/**
	 * Determine if a given method is allowed
	 *
	 * @param string method
	 * @param string headerValue What the server allows
	 * @return boolean
	 */
	function isAllowedMethod(method, headerValue) {
		headerValue = cleanHeader(headerValue);

		if (!headerValue || headerValue === '*') {
			return true;
		}

		// Make the list start and end with commas as delimiters
		headerValue = ',' + headerValue + ',';

		// Try to match ,METHOD, in our list of ,ALLOWED,METHODS,
		if (headerValue.indexOf(',' + method + ',') !== -1) {
			return true;
		}

		return false;
	}


	/**
	 * See if an origin is whitelisted by this library
	 *
	 * @param string origin
	 * @return boolean
	 */
	function isAlwaysTrusted(origin) {
		var i, isTrusted;

		for (i = 0; i < alwaysTrustedOrigins.length; i += 1) {
			if (alwaysTrustedOrigins[i] instanceof RegExp) {
				// Match the regular expression
				isTrusted = alwaysTrustedOrigins[i].test(origin);
			} else if (typeof alwaysTrustedOrigins[i] === "string") {
				// Exact string matching
				isTrusted = (origin === alwaysTrustedOrigins[i]);
			}

			if (isTrusted) {
				return true;
			}
		}

		return false;
	}


	/**
	 * Checks if the origin is always trusted or if it matches the
	 * response header's allowed origin.
	 *
	 * @param string origin
	 * @param string headerValue
	 * @return boolean
	 */
	function isTrustedOrigin(origin, headerValue) {
		origin = origin.toUpperCase();

		if (isAlwaysTrusted(origin)) {
			return true;
		}

		headerValue = cleanHeader(headerValue);

		if (headerValue === '*' || headerValue === origin) {
			return true;
		}

		return false;
	}


	/**
	 * Make a request to the server
	 *
	 * @param string method
	 * @param string uri
	 * @param Object headers
	 * @param string data Optional data to send
	 * @param Function callback Callback to call when done, callback(request)
	 * @return XMLHttpRequest
	 */
	function makeRequest(method, uri, headers, data, callback) {
		var header, request;

		request = new XMLHttpRequest();
		request.open(method, uri, true);

		if (headers) {
			for (header in headers) {
				if (headers.hasOwnProperty(header)) {
					request.setRequestHeader(header, headers[header]);
				}
			}
		}

		if (typeof data === "string") {
			request.send(data);
		} else {
			request.send(null);
		}

		if (callback) {
			request.onreadystatechange = function () {
				if (request.readyState !== 4) {
					return;
				}

				callback(request);
			};
		}

		return request;
	}

	// Opera 9.x postMessage fix (only for http:, not https:)
	if (window.opera !== undef) {
		if (parseInt(window.opera.version(), 10) === 9) {
			/*jslint nomen:true*/
			Event.prototype.__defineGetter__("origin", function () {
				return "http://" + this.domain;
			});
			/*jslint nomen:false*/
		}
	}

	function pmxdrRequestHandler(evt) {
		var data, optionsCorsHeaders, origin, source, reply;

		function sendReply(response) {
			source.postMessage(JSON.stringify(response), origin);
		}

		function replyError(code) {
			reply.error = code;
			sendReply(reply);
		}

		function handleResponse(request) {
			var corsHeaders;

			if (request.readyState !== 4) {
				return;
			}

			reply.status = request.status;
			reply.statusText = request.statusText;

			if (!request.status) {
				// Error loading the requested resource
				replyError('LOAD_ERROR');
				return;
			}

			// Handle IE's status code 1223 - see note below
			if (request.status === 1223) {
				reply.status = 204;
				reply.statusText = 'No Content';
				corsHeaders = optionsCorsHeaders;
			} else {
				corsHeaders = getCorsHeaders(request);
			}

			if (!isTrustedOrigin(origin, corsHeaders.origin)) {
				// The host was not allowed to request the resource
				replyError('DISALLOWED_ORIGIN');
				return;
			}

			if (!isAllowedMethod(data.method, corsHeaders.methods)) {
				// The request method was not allowed
				replyError('DISALLOWED_REQUEST_METHOD');
				return;
			}

			reply.data = request.responseText;
			reply.headers = getAllHeaders(request);
			sendReply(reply);
		}

		// evt gets removed by IE quickly.  We lose its information
		// unless we copy it to local variables.
		source = evt.source;
		origin = evt.origin;

		// Decode the JSON data from the event
		try {
			data = JSON.parse(evt.data);
		} catch (e) {
			return;
		}

		// Only handle pmxdr requests
		if (typeof data !== 'object' || data.pmxdr !== true) {
			return;
		}

		reply = {
			pmxdr: true
		};

		if (data.id !== undef) {
			reply.id = data.id;
		}

		if (typeof data.method === "string") {
			data.method = data.method.toUpperCase();
		}

		/* Internet Explorer <= 9 may report a status code of 1223 when
		 * there is a 204 No Content reply.  When that happens, the headers
		 * are not accessible and thus we can not check to see if the
		 * request is allowed via CORS.
		 *
		 * To combat this problem we issue an OPTIONS call.  If we use OPTIONS
		 * after our request, we may get the wrong results.  If a resource
		 * was deleted and we use OPTIONS on the deleted resource, we should
		 * properly get a 404 error or similar.  So the OPTIONS call must
		 * happen first.
		 *
		 * Issue an OPTIONS request first.  Then issue our real request.
		 * If that returns with a status code of 1223, handle IE's quirk
		 * and use the headers from the OPTIONS call for CORS.
		 */
		makeRequest('OPTIONS', data.uri, data.headers, null, function (optionsRequest) {
			optionsCorsHeaders = getCorsHeaders(optionsRequest);

			if (data.method === 'OPTIONS') {
				handleResponse(optionsRequest);
				return;
			}

			makeRequest(data.method, data.uri, data.headers, data.data, handleResponse);
		});
	}

	if (window.addEventListener) {
		window.addEventListener("message", pmxdrRequestHandler, false); // normal browsers
	} else if (window.attachEvent) {
		window.attachEvent("onmessage", pmxdrRequestHandler); // IE
	}

	// Expose to browser for testing
	window.pmxdrRequestHandler = pmxdrRequestHandler;
}());
