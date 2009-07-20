/* pmxdr: postMessage Cross-Domain Requester
@version 0.0.6
@archive http://code.eligrey.com/pmxdr/client/
@desc Cross-domain HTTP requesting using the postMessage API
@license GPL v3 and X11/MIT License
				 http://eligrey.com/about/license/
@author Elijah Grey, http://eligrey.com
*/

(function() {
	
	var window = this;

	if (typeof window.opera != "undefined" && parseInt(window.opera.version()) == 9) // Opera 9.x MessageEvent.origin fix (only for http:, not https:)
			Event.prototype.__defineGetter__("origin", function(){
				return "http://" + this.domain;
			});
	
	function pmxdr(host, onload) {
		var instance = this; // for YUI compressor
		instance.iFrame	= document.createElement("iframe"); // interface frame
		instance.iFrame.style.display = "none";
		instance.origin = host.replace(pmxdr.originRegex, "$1");
		
		function onloadHandler() {
			if (typeof instance.onload == "function")
				instance.onload();
		}
		
		if (instance.iFrame.addEventListener)
			instance.iFrame.addEventListener("load", onloadHandler, false);
		else if (instance.iFrame.attachEvent)
			instance.iFrame.attachEvent("onload", onloadHandler);

		instance.iFrame.src = instance.origin + "/pmxdr/api";
		if (typeof onload == "function") {
			instance.onload = onload;
			instance.init();
		}
	}
	
	pmxdr.originRegex = /^([\w-]+:\/*\[?[\w\.:-]+\]?(?::\d+)?).*/; // RegExp.$1 = protocol+host+port (the square brackets are for ipv6)
	pmxdr.request = function(req) {
		if (typeof req == "string")
			return pmxdr.request({uri: req});
		else if (Object.prototype.toString.call(req) == "[object Array]") { // handle array of requests
			var requests = [];
			for (var i=0; i<req.length; i++)
				requests.push(pmxdr.request(req[i]));
			return requests;
		}
		
		var pmxdrInstance = new pmxdr(req.uri),
		callback = req.callback;
		req.id = pmxdr.getSafeID();
		
		req.callback = function(response) {
			if (typeof callback == "function") callback.call(this, response);
			this.unload();
		}
		
		pmxdrInstance.onload = function() {
			this.request(req);
		}

		pmxdrInstance.init()
		return {
			abort: function() {
				pmxdr.requests.aborted[req.id] = true;
			}
		}
	}
	// parent for interface frames
	pmxdr.interfaceFrameParent = document.documentElement||document.getElementsByTagName("head")[0]||document.body||document.getElementsByTagName("body")[0];
		
	pmxdr.getSafeID = function() { // generate a random key that doesn't collide with any existing keys
				var randID = Math.random().toString().substr(2); // Generate a random number, make it a string, and cut off the "0." to make it look nice
				if (typeof pmxdr.requests[randID] == "undefined") return randID; // key doesn't collide
				else return safeRandID();
	}
	pmxdr.prototype = {
	
		init: function(onload) { // load or reload iframe
			if (typeof onload == "function")
				this.onload = onload;
			if (this.iFrame.parentNode) this.unload(); // in case init is being called to re-init
			pmxdr.interfaceFrameParent.appendChild(this.iFrame);
		},
		
		unload: function() { // remove iframe
			pmxdr.interfaceFrameParent.removeChild(this.iFrame);
		},
		
		defaultRequestMethod: "GET", // default request method
		//defaultContentType: "application/x-www-form-urlencoded", default content-type header (ie. POST requests, ect.)
		//defaultTimeout: 60000, // optional default timeout at which the request recives a TIMEOUT error (60000 ms = 1 minute)
		
		request: function(req) { // send a request to a pmxdr host
			var requests = [], instance = this;
			
			if (Object.prototype.toString.call(req) == "[object Array]") { // handle array of requests
				for (var i=0; i<req.length; i++)
					requests.push(instance.request(req[i]));
				return requests;
			}
			var
			id          = (pmxdr.requests[req.id] ? false : req.id) || pmxdr.getSafeID(),
			method      = req.method      || instance.defaultRequestMethod,
			timeout     = req.timeout     || instance.defaultTimeout,
			contentType = req.contentType || instance.defaultContentType;
			
			method = method.toUpperCase();
			
			pmxdr.requests[id] = {
				origin: instance.origin,
				remove: function() {
					delete pmxdr.requests[id];
				},
				callback: function(response) {
					if (typeof req.callback == "function") req.callback.call(instance, response);
					pmxdr.requests[id].remove();
				}
			};
	
			function timeoutCallback() { // give callback a TIMEOUT error
				if (pmxdr.requests[id] && pmxdr.requests[id].callback)
					pmxdr.requests[id].callback({
						pmxdr	: true,
						id		 : id,
						error	: "TIMEOUT"
					})
			};
			
			if (contentType) {
				if (!req.headers)
					req.headers = {};
				req.headers["Content-Type"] = contentType.toString();
			}
			
			instance.iFrame.contentWindow.postMessage(JSON.stringify({
				pmxdr   : true,
				method  : method,
				uri     : req.uri,
				data    : req.data,
				headers : req.headers,
				id      : id
			}), instance.origin);
			if (timeout) setTimeout(timeoutCallback, timeout)
	
			return {
				abort: pmxdr.requests[id].remove
			};
		}
	}

	pmxdr.requests = { // requests cache
		aborted : {},
		clear   : function() {
			pmxdr.requests = {
				aborted : {},
				clear   : this.clear
			};
		},
	};

	function pmxdrResponseHandler(evt) {
		var data = JSON.parse(evt.data);
		if (data.pmxdr == true) { // only handle pmxdr requests
			if (
				pmxdr.requests[data.id]
				&& pmxdr.requests[data.id].origin == evt.origin
				&& typeof pmxdr.requests[data.id].callback == "function"
				&& !pmxdr.requests.aborted[data.id]
			) pmxdr.requests[data.id].callback(data);
			else if (pmxdr.requests.aborted[data.id]) {
				delete pmxdr.requests.aborted[data.id];
				if (data.id in pmxdr.requests)
					delete pmxdr.requests[data.id];
			}
		}
	}

	if (window.addEventListener) window.addEventListener("message", pmxdrResponseHandler, false);
	else if (window.attachEvent) window.attachEvent("onmessage", pmxdrResponseHandler);

	pmxdr.destruct = function() {
		if (window.removeEventListener)
			window.removeEventListener("message", pmxdrResponseHandler, false);
		else if (window.detachEvent)
			window.detachEvent("onmessage", pmxdrResponseHandler);
		
		delete window.pmxdr;
		delete pmxdrResponseHandler;
	}

	window.pmxdr = pmxdr;
})();


/* the following code block is the json2.js JSON API for if the browser does not natively support it
	 This code block may look suspicious to you. That's because it's minified and packed.
	 If you don't trust this code block, replace this block with your own minified http://www.json.org/json2.js
*/
if (!this.JSON)
	JSON = {};

if (this.JSON && (!JSON.stringify || !JSON.parse))
	eval(function(p,a,c,k,e,r){e=function(c){return(c<62?'':e(parseInt(c/62)))+((c=c%62)<36?c.toString(36):String.fromCharCode(c+29))};if('0'.replace(0,e)==0){while(c--)r[e(c)]=k[c];k=[function(e){return r[e]||e}];e=function(){return'\\w{1,2}'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('(3(){3 f(n){6 n<10?"0"+n:n}2(5 1b.w.7!=="3"){1b.w.7=3(a){6 8.getUTCFullYear()+"-"+f(8.getUTCMonth()+1)+"-"+f(8.getUTCDate())+"T"+f(8.getUTCHours())+":"+f(8.getUTCMinutes())+":"+f(8.getUTCSeconds())+"Z"};O.w.7=Number.w.7=Boolean.w.7=3(a){6 8.valueOf()}}y g=/[\\u0000\\R\\Q-\\1i\\1f\\1e\\1c\\1a-\\19\\18-\\17\\15-\\14\\13\\12-\\11]/g,h=/[\\\\\\"\\x00-\\x1f\\x7f-\\x9f\\R\\Q-\\1i\\1f\\1e\\1c\\1a-\\19\\18-\\17\\15-\\14\\13\\12-\\11]/g,l,m,o={"\\b":"\\\\b","\\t":"\\\\t","\\n":"\\\\n","\\f":"\\\\f","\\r":"\\\\r",\'"\':\'\\\\"\',"\\\\":"\\\\\\\\"},p;3 q(b){h.S=0;6 h.I(b)?\'"\'+b.z(h,3(a){y c=o[a];6 5 c==="G"?c:"\\\\u"+("1h"+a.1g(0).P(16)).1d(-4)})+\'"\':\'"\'+b+\'"\'}3 r(a,b){y i,k,v,c,d=l,e,f=b[a];2(f&&5 f==="x"&&5 f.7==="3"){f=f.7(a)}2(5 p==="3"){f=p.H(b,a,f)}switch(5 f){D"G":6 q(f);D"N":6 isFinite(f)?O(f):"C";D"boolean":D"C":6 O(f);D"x":2(!f){6"C"}l+=m;e=[];2(M.w.P.apply(f)==="[x Array]"){c=f.B;A(i=0;i<c;i+=1){e[i]=r(i,f)||"C"}v=e.B===0?"[]":l?"[\\n"+l+e.E(",\\n"+l)+"\\n"+d+"]":"["+e.E(",")+"]";l=d;6 v}2(p&&5 p==="x"){c=p.B;A(i=0;i<c;i+=1){k=p[i];2(5 k==="G"){v=r(k,f);2(v){e.Y(q(k)+(l?": ":":")+v)}}}}J{A(k X f){2(M.W.H(f,k)){v=r(k,f);2(v){e.Y(q(k)+(l?": ":":")+v)}}}}v=e.B===0?"{}":l?"{\\n"+l+e.E(",\\n"+l)+"\\n"+d+"}":"{"+e.E(",")+"}";l=d;6 v}}2(5 9.K!=="3"){9.K=3(a,b,c){y i;l="";m="";2(5 c==="N"){A(i=0;i<c;i+=1){m+=" "}}J{2(5 c==="G"){m=c}}p=b;2(b&&5 b!=="3"&&(5 b!=="x"||5 b.B!=="N")){V U Error("9.K")}6 r("",{"":a})}}2(5 9.L!=="3"){9.L=3(d,e){y j;3 f(a,b){y k,v,c=a[b];2(c&&5 c==="x"){A(k X c){2(M.W.H(c,k)){v=f(c,k);2(v!==undefined){c[k]=v}J{delete c[k]}}}}6 e.H(a,b,c)}g.S=0;2(g.I(d)){d=d.z(g,3(a){6"\\\\u"+("1h"+a.1g(0).P(16)).1d(-4)})}2(/^[\\],:{}\\s]*$/.I(d.z(/\\\\(?:["\\\\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").z(/"[^"\\\\\\n\\r]*"|true|false|C|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?/g,"]").z(/(?:^|:|,)(?:\\s*\\[)+/g,""))){j=eval("("+d+")");6 5 e==="3"?f({"":j},""):j}V U SyntaxError("9.L")}}})();',[],81,'||if|function||typeof|return|toJSON|this|JSON|||||||||||||||||||||||prototype|object|var|replace|for|length|null|case|join||string|call|test|else|stringify|parse|Object|number|String|toString|u0600|u00ad|lastIndex||new|throw|hasOwnProperty|in|push|||uffff|ufff0|ufeff|u206f|u2060||u202f|u2028|u200f|u200c|Date|u17b5|slice|u17b4|u070f|charCodeAt|0000|u0604'.split('|'),0,{}));
