/* pmxdr host v0.0.6
* postMessage Cross-Domain Requester host library
* http://code.eligrey.com/pmxdr/host/
*
* By Elijah Grey, http://eligrey.com
*
* Simple cross-site HTTP requesting using the postMessage API
*
* License: GPL v3 and X11/MIT Licence
*          http://eligrey.com/about/licence/
*/

/* example alwaysTrustedOrigins settings:

var alwaysTrustedOrigins = [
    /^[\w-]+:(?:\/\/)?(?:[\w\.-]+\.)?eligrey\.com(?::\d+)?$/, // any origin on any protocol that has a domain that ends in eligrey.com
    "http://www.google.com", // only http://www.google.com is allowed, not http://foo.google.com:30 or http://google.com
    /^https?:\/\/([\w\.-]+\.)?example\.com$/ // these will all be allowed: https://example.com, http://example.com, https://*.example.com, http://*.example.com
  ];

*/

/* the following code block is the json2.js JSON API for if the browser does not natively support it
	 This code block may look suspicious to you. That's because it's minified and packed.
	 If you don't trust this code block, replace this block with your own minified http://www.json.org/json2.js
*/
if (!this.JSON)
	JSON = {};

if (this.JSON && (!JSON.stringify || !JSON.parse))
	eval(function(p,a,c,k,e,r){e=function(c){return(c<62?'':e(parseInt(c/62)))+((c=c%62)<36?c.toString(36):String.fromCharCode(c+29))};if('0'.replace(0,e)==0){while(c--)r[e(c)]=k[c];k=[function(e){return r[e]||e}];e=function(){return'\\w{1,2}'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('(3(){3 f(n){6 n<10?"0"+n:n}2(5 1b.w.7!=="3"){1b.w.7=3(a){6 8.getUTCFullYear()+"-"+f(8.getUTCMonth()+1)+"-"+f(8.getUTCDate())+"T"+f(8.getUTCHours())+":"+f(8.getUTCMinutes())+":"+f(8.getUTCSeconds())+"Z"};O.w.7=Number.w.7=Boolean.w.7=3(a){6 8.valueOf()}}y g=/[\\u0000\\R\\Q-\\1i\\1f\\1e\\1c\\1a-\\19\\18-\\17\\15-\\14\\13\\12-\\11]/g,h=/[\\\\\\"\\x00-\\x1f\\x7f-\\x9f\\R\\Q-\\1i\\1f\\1e\\1c\\1a-\\19\\18-\\17\\15-\\14\\13\\12-\\11]/g,l,m,o={"\\b":"\\\\b","\\t":"\\\\t","\\n":"\\\\n","\\f":"\\\\f","\\r":"\\\\r",\'"\':\'\\\\"\',"\\\\":"\\\\\\\\"},p;3 q(b){h.S=0;6 h.I(b)?\'"\'+b.z(h,3(a){y c=o[a];6 5 c==="G"?c:"\\\\u"+("1h"+a.1g(0).P(16)).1d(-4)})+\'"\':\'"\'+b+\'"\'}3 r(a,b){y i,k,v,c,d=l,e,f=b[a];2(f&&5 f==="x"&&5 f.7==="3"){f=f.7(a)}2(5 p==="3"){f=p.H(b,a,f)}switch(5 f){D"G":6 q(f);D"N":6 isFinite(f)?O(f):"C";D"boolean":D"C":6 O(f);D"x":2(!f){6"C"}l+=m;e=[];2(M.w.P.apply(f)==="[x Array]"){c=f.B;A(i=0;i<c;i+=1){e[i]=r(i,f)||"C"}v=e.B===0?"[]":l?"[\\n"+l+e.E(",\\n"+l)+"\\n"+d+"]":"["+e.E(",")+"]";l=d;6 v}2(p&&5 p==="x"){c=p.B;A(i=0;i<c;i+=1){k=p[i];2(5 k==="G"){v=r(k,f);2(v){e.Y(q(k)+(l?": ":":")+v)}}}}J{A(k X f){2(M.W.H(f,k)){v=r(k,f);2(v){e.Y(q(k)+(l?": ":":")+v)}}}}v=e.B===0?"{}":l?"{\\n"+l+e.E(",\\n"+l)+"\\n"+d+"}":"{"+e.E(",")+"}";l=d;6 v}}2(5 9.K!=="3"){9.K=3(a,b,c){y i;l="";m="";2(5 c==="N"){A(i=0;i<c;i+=1){m+=" "}}J{2(5 c==="G"){m=c}}p=b;2(b&&5 b!=="3"&&(5 b!=="x"||5 b.B!=="N")){V U Error("9.K")}6 r("",{"":a})}}2(5 9.L!=="3"){9.L=3(d,e){y j;3 f(a,b){y k,v,c=a[b];2(c&&5 c==="x"){A(k X c){2(M.W.H(c,k)){v=f(c,k);2(v!==undefined){c[k]=v}J{delete c[k]}}}}6 e.H(a,b,c)}g.S=0;2(g.I(d)){d=d.z(g,3(a){6"\\\\u"+("1h"+a.1g(0).P(16)).1d(-4)})}2(/^[\\],:{}\\s]*$/.I(d.z(/\\\\(?:["\\\\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").z(/"[^"\\\\\\n\\r]*"|true|false|C|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?/g,"]").z(/(?:^|:|,)(?:\\s*\\[)+/g,""))){j=eval("("+d+")");6 5 e==="3"?f({"":j},""):j}V U SyntaxError("9.L")}}})();',[],81,'||if|function||typeof|return|toJSON|this|JSON|||||||||||||||||||||||prototype|object|var|replace|for|length|null|case|join||string|call|test|else|stringify|parse|Object|number|String|toString|u0600|u00ad|lastIndex||new|throw|hasOwnProperty|in|push|||uffff|ufff0|ufeff|u206f|u2060||u202f|u2028|u200f|u200c|Date|u17b5|slice|u17b4|u070f|charCodeAt|0000|u0604'.split('|'),0,{}));

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
          if (this.status == 200) {
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
                  statusText : req.statusText || null,
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
