pmxdr is a cross-domain [XHR][1] JavaScript library standard that doesn't rely on any proprietary technologies like Flash, but instead uses the HTML5 postMessage API to make requests. pmxdr stands for postMessage cross-domain requester. It respects all applicable HTTP access control headers, even on browsers that don't support them but do support postMessage, like Firefox 3. There is one drawback though--it requires that a pmxdr host be on the target domain (at /pmxdr/api). If you would like to implement your own pmxdr client library or pmxdr host library, please refer to the [pmxdr standard][2]. 

## Supported Browsers

The following browsers support pmxdr. If you know of a browser that works but is not listed, comment on this page and tell me the browser. 

*   Gecko 1.9.x 
    *   Firefox 3
    *   Firefox 3.1/3.5
    *   Seamonkey 2
    *   Songbird 0.3+
    *   Flock 2
    *   Epiphany 2
*   Google Chrome 2
*   Opera 
    *   Opera 10
    *   Opera 9.5+ with `MessageEvent.origin` getter fix (http://-only, no https://)
*   Safari 4
*   IE 8

## Demo

You can try out a demo of it in action [here][3]. In two of the tests in the demo, code.eligrey.com requests some JSON data (which turns out not to just be some JSON, but some JavaScript code too) from eligrey.com without using the current insecure method of inserting a script tag and handing all control over to the other website. If the demo was done with conventional `<script>` tags, the page's title would have been sent to a (nonexistent) website that harvests page titles. 
 
## Reference Client Library

The reference client library uses the following object-oriented API. Pass a pmxdr instance's request method an object containing any of these properties or an array of such objects to do mutiple requests to utilize pmxdr. To create a pmxdr instance, create a variable as `new pmxdr(host)` where *host* is any URI from the website you want to request (pmxdr figures out where the API is located automatically). If you don't need a reusable pmxdr instance (ie. only plan on making one request), just use pmxdr.request. If you use an instance, the `uri` parameter can be a relative URI. The following doesn't apply to pmxdr.request, only reusable instances: Only call the `request` method on an instance once the interface iframe has loaded, which you can find out when instance calls it's `onload` method once it's loaded if you set it. To start loading the instance, you call it's `init` method. To remove the interface frame, you call it's `unload` method. The following are parameters supported in a request object. Passing a string instead of an object with parameters is the same as passing an object with only the `uri` parameter defined as the string. 

*   `method`: (Optional) Case-insensitive string representing the HTTP request method. Defaults to an instance's defaultRequestMethod (which defaults to pmxdr.prototype.defaultRequestMethod). (which is usually "GET" but can be changed)
*   `uri`: (Required) The full absolute URI to be requested.
*   `headers`: (Optional) An object with properties and values for headers to be sent. Example: `{"X-User": "eli", "X-Real-Referrer": location.href}`.
*   `data`: (Optional) Data to send in a request. This is where you put the body of a POST request.
*   `callback`: (Optional) Function to be called when request is complete.
*   `contentType`: (Optional) Equivalent to setting the "Content-Type" header in the headers field. Defaults to the instance's `defaultContentType` property. If you want to simulate a form POST request, don't forget to set this to `application/x-www-form-urlencoded`
*   `timeout`: (Optional) Time in milliseconds that the request has to finish. If the request does not finish before the timeout, the callback (if any) is sent a TIMEOUT error code. Defaults to an instance's defaultTimeout (which defaults to pmxdr.prototype.defaultTimeout).

pmxdr.prototype.defaultTimeout is not set by default in this client library but you can set it to have a global default timeout. To completely remove pmxdr, call its  `destruct` method, which removes all event listeners and deletes the pmxdr variable. This does not delete any still-existing interface frames so don't forget to `unload` them when you are done to save memory. 

## Reference Host Library

The reference host library fully supports the pmxdr standard. It needs no configuration and defaults to the most restrictive settings of always requiring `Access-Control-Allow-Origin` and not trusting any origin by default, including the same website itself. When you set up the host library, it must be accessible via http://your-domain***/pmxdr/api***.

## The Response Object

The response object will be in this format: 

    /* req == XMLHttpRequest response */
    {
        pmxdr      : true,
        data       : req.responseText,
        headers    : {}, // all HTTP headers (with header names lower-case)
        status     : req.status, // 200, 404, etc.
        statusText : req.statusText, // "OK", "Not Found", etc.
        id         : some_id // this will be the same as the id sent in the request object
    }

## Examples

    // requesting domain is eligrey.com
    // example.com/search is a fictional search service that supports pmxdr requests
    pmxdr.request({
      uri     : "http://example.com/search.json?q=foo",
      callback: handleResponse
    })
    
    function handleResponse(response) {
      if (!response.error) { // request successfull
          print(response.headers["content-type"]) // prints "application/json"
          print(response.data)
          // prints [{"name":"foo Inc","url":"http://foo.example/","description":"the world leader in foo"},{"name":"foo experts","url":"http://foobar.example/","description":"we are experts on foo!"}]
      } else print("Error: " + response.error);
    } This creates a temporary iframe which is deleted after the response is recieved with an src of "http://example.com/pmxdr/api" and sends the following JSON-encoded object to it using postMessage (the id is randomly generated with collision-detection): 

    {pmxdr: true, method: "GET", uri: "http://example.com/search.json?q=foo", id:"5832485502879199"} The pmxdr host (example.com/pmxdr/api) requests http://example.com/search.json?q=foo using XHR and the headers that it receives include the following: 

    Content-Type: application/json
    Access-Control-Allow-Origin: http://example.com, http://eligrey.com, http://an-example-com-affiliate.com
    Access-Control-Allow-Methods: GET, POST

**Note:** `Access-Control-Allow-Origin: *` would also work but would allow all requests The pmxdr host then checks to see if the original requesting window is permitted to get the data from the HTTP request. If the original requesting window is permitted to view this data, it sends back the following response: 
    {pmxdr: true, headers:{"content-type":"application/json" /*, ...the rest of the headers...*/}, status: 200, data: '[{"name":"foo Inc","url":"http://foo.example/","description":"the world leader in foo"},{"name":"foo experts","url":"http://foobar.example/","description":"we are experts on foo!"}]', id:"5832485502879199"} Now that you got the basics, let's do a little more advanced example which uses example.com's more advanced fictional "search2" interface using a pmxdr instance and then doing two requests.: 

    var pmxdrInstance = new pmxdr("http://example.com");
    pmxdrInstance.onload = function() {
        this.request([{
            method  : "post",
            uri     : "/search2.json",
            data    : "q=foo",
            callback: handleResponse,
            headers : {"X-Service-Key":".T95@3Ko)n(1|aKov7MLt1YPyw+JbdWntoGge=le1pPFIacpmDIvgWMon", "X-User": "eli"},
            timeout : 30000 /* == 30 seconds*/
        },{ // log real referrer, doesn't need callback
            uri     : "/log.json?real_ref="+encodeURIComponent(location.href),
      }]);
        //this.unload(); // this will delete the pmxdr instance, call this after every request if you don't need to handle a response
    }
    function handleResponse(response) {
        // do stuff with response
        pmxdrInstance.unload();
    }
    pmxdrInstance.init();

This creates a temporary iframe which is deleted after the response is recieved OR after the timeout (30000ms, 30 seconds) with an src of "http://example.com/pmxdr/api" and sends the following JSON-encoded object to it using postMessage: 

    {pmxdr: true, method: "post", uri: "http://example.com/search2.json", data: "q=foo", headers: {"X-Service-Key": ".T95@3Ko)n(1|aKov7MLt1YPyw+JbdWntoGge=le1pPFIacpmDIvgWMon", "X-User": "eli"}, id:"9130873488166656"}

The pmxdr host (example.com/pmxdr/api) requests http://example.com/search/ using an XHR 

`POST` request with the data, "q=foo". It also sends the headers, X-Service-Key and X-User. The Content-Type header. The headers that it receives include the following:
 
    Content-Type: application/json
    Access-Control-Allow-Origin: *
    Access-Control-Allow-Methods: POST

The pmxdr host then checks to see if the original requesting window is permitted to get the data and returns this if it is allowed: 

    {pmxdr: true, headers:{"content-type":"application/json" /*, ...the rest of the headers...*/}, data:'[{"name":"foo Inc","url":"http://foo.example/","description":"the world leader in foo"},{"name":"foo experts","url":"http://foobar.example/","description":"we are experts on foo!"}]', status:200, statusText:"OK" id:"9130873488166656"}

If the request is denied due to having a disallowed origin, it would return this: 

    {pmxdr: true, error: "DISALLOWED_ORIGIN", id:"9130873488166656", status:200, statusText:"OK"}

This example shows how to use the response headers: 

    pmxdr.request({ // Print the server of pmxdr host
      uri       : "http://pmxdr-host-enabled-website.example/",
      callback  : function(response){ print(response.headers.server) },
    })

## Standard Error Codes

*   `DISALLOWED_ORIGIN`: The host was not allowed to request the resource.
*   `DISALLOWED_REQUEST_METHOD`: Request method (ie. GET, POST, etc.) was not allowed.
*   `LOAD_ERROR`: The requested resource did not return a 2xx HTTP response.
*   `UNKNOWN`: Unknown error.
*   `TIMEOUT`: Request timed out. **Note:** This error is not normally sent from the pmxdr host but is usually sent to the callback directly on the client-side. A host may return this error if it wishes to have a timeout.

## Miscellaneous

At any point before the callback for a request is called, you may abort the request by calling it's  `abort` method. If you gave an array of requests, call the `abort` method on the appropriate indice: 

    var request = pmxdr.request("http://example.com/foo.html");
    request.abort();
    // or
    var requests = pmxdr.request([
        "http://example.com/foo.html",
        "http://example.com/bar.html"
    ]);
    for (let i=0; i<requests.length; i++) {
        requests[i].abort();
    }

This interface also includes a callback method, which you can call to call the callback and remove the request before receiving the response. 

## Configuration

The client library has the following public configuration variables: 

*   `pmxdr.originRegex`: The regular expression used to extract an HTML 5 "origin" from a URI. The default of `^([\w-]+:\/*\[?[\w\.:-]+\]?(?::\d+)?).*/` is very flexible and even works on IPv6 addresses. If you must edit it, make sure RegExp.$1 is the origin captured, as that's what the pmxdr client library uses.
*   `pmxdr.prototype.defaultTimeout`: Not defined initially. Define this to apply a timeout to all pmxdr calls that don't specify an explicit timeout.
*   `pmxdr.prototype.defaultRequestMethod`: Initially set to "GET". This is the default request method if a request method if not specified in a pmxdr call.
*   `pmxdr.prototype.defaultContentType`: Not defined initially. Define this to specify a default Content-Type header value to send all data with. (ie. `application/x-www-form-urlencoded` for POST form requests)
*   `pmxdr.interfaceFrameParent`: Parent node where interface frames are temporarily appended to. Initially set to `document.documentElement||document.getElementsByTagName("head")[0]||document.body||document.getElementsByTagName("body")[0]`
*   You can override defaults for a whole pmxdr instance by specifying the property under the instance. For example: `var foo=new pmxdr("http://example.com"); foo.defaultTimeout = 60000` The host library also has a private array named alwaysTrustedOrigins, which can be filled with protocol+host+non-standard port strings and regular expressions. Any website with an origin matching one of the strings or regular expressions in the array is allowed to skip the Access-Control-Allow-Origin header verification. This does not mean that the trusted host is also allowed to skip checks with the Access-Control-Allow-Methods and Access-Control-Allow-Headers headers.

The following is an example configuration of `alwaysTrustedOrigins`: 


    var alwaysTrustedOrigins = [ // change to always trusted origins
        /^[\w-]+:(?:\/\/)?([\w\.-]+\.)?eligrey\.com(?::\d+)?$/, // any origin on any protocol that has a domain that ends in eligrey.com
        "http://www.google.com", // only http://www.google.com is allowed, not http://foo.google.com:30/
        /\.example\.net$/, // *.example.net
        /^https?:\/\/([\w\.-]+\.)?example\.com$/ // these will all be allowed: https://example.com, http://example.com, https://*.example.com, http://*.example.com
    ];

 [1]: https://developer.mozilla.org/en/XMLHttpRequest "XMLHttpRequest"
 [2]: http://eligrey.com/blog/projects/pmxdr/standard/
 [3]: http://code.eligrey.com/pmxdr/demo.html
