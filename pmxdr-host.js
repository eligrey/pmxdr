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

(function() {
  var alwaysTrustedOrigins = [ // always trusted origins, can be exact strings or regular expressions
    
  ];

  if (typeof window.opera != "undefined") { // Opera 9.x postMessage fix (only for http:, not https:)
    if (parseInt(window.opera.version()) == 9) Event.prototype.__defineGetter__("origin", function() {
      return "http://" + this.domain;
    })
  }

  function pmxdrRequestHandler(evt) {
    var alwaysTrusted = false, data = JSON.parse(evt.data), origin = evt.origin, sourceWindow = evt.source;
    
    if (data.pmxdr == true) { // only handle pmxdr requests
    // accept anything value that is == to true
    
      for (var i=0; i<alwaysTrustedOrigins.length; i++) {
        if (alwaysTrustedOrigins[i] instanceof RegExp)
          alwaysTrusted = alwaysTrustedOrigins[i].test(origin);
        else if (typeof alwaysTrustedOrigins[i] == "string")
          alwaysTrusted = (origin === alwaysTrustedOrigins[i]);
      }
      
      if (typeof data.method == "string") data.method = data.method.toUpperCase();
      
      var req = new XMLHttpRequest();
      req.open(data.method, data.uri, true);
      
      if (data.headers)
        for (var header in data.headers)
          if (data.headers.hasOwnProperty(header))
            req.setRequestHeader(header, data.headers[header]);
      
      if (typeof data.data == "string") req.send(data.data)
      else req.send(null);

      function err(errorCode) {
        var errorResponse = {
          pmxdr      : true,
          error      : errorCode,
          status     : (typeof req.status == "number") ? req.status : null, // possible 0, check for type
          statusText : req.statusText || null,
          id         : data.id
        };

        sourceWindow.postMessage(JSON.stringify(errorResponse), origin);
      }

      req.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status) {
            function getResponseHeader(header) {
              return req.getResponseHeader(header)
            }
        
            var ac = { // access controls
              origin : (getResponseHeader("Access-Control-Allow-Origin")||"").replace(/\s/g, ""),
              methods: (getResponseHeader("Access-Control-Allow-Methods")||"").replace(/\s/g, "")
              //,headers: (getResponseHeader("Access-Control-Allow-Headers")||"").replace(/\s/g, "")
            };
        
            if ( // determine if origin is trusted
                 alwaysTrusted == true
                 || ac.origin == "*"
                 || ac.origin.indexOf(origin) != -1 )
            {
              if ( // determine if request method was allowed
                  !ac.methods
                  || ac.methods == "*"
                  || (typeof ac.methods == "string" && ac.methods.indexOf(data.method) != -1) )
              {

                var response = {
                  pmxdr      : true, // signify that this is the response of a pmxdr request
                  data       : this.responseText,
                  headers    : {}, // populated with headers below
                  status     : (typeof req.status == "number") ? req.status : null, // possible 0, check for type
                  statusText : req.statusText || null
                }; if (typeof data.id != "undefined") response.id = data.id;
            
                var responseHeaders = this.getAllResponseHeaders().split(/\r?\n/);
                for (var i=0; i<responseHeaders.length; i++) {
                  var header = responseHeaders[i].split(": ");
                  response.headers[header[0].toLowerCase()] = header[1];
                }
                
                return sourceWindow.postMessage(JSON.stringify(response), origin)
              } else return err("DISALLOWED_REQUEST_METHOD"); // The request method was not allowed
            } else return err("DISALLOWED_ORIGIN"); // The host was not allowed to request the resource
          } else return err("LOAD_ERROR"); // Error loading the requested resource
        }
      }
    }
  }
  
  if (window.addEventListener) window.addEventListener("message", pmxdrRequestHandler, false); // normal browsers
  else if (window.attachEvent) window.attachEvent("onmessage", pmxdrRequestHandler); // IE
})();

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
