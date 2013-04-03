pmxdr
=====

pmxdr is a cross-domain [XHR][2] JavaScript library standard that doesn't rely on any
proprietary technologies like Flash, but instead uses the HTML5 postMessage API to make
requests. pmxdr stands for postMessage cross-domain requester. It respects most applicable
HTTP access control headers, even on browsers that don't support them but do support
postMessage, like Firefox 3. There is one drawback though--it requires that a pmxdr host
be on the target domain (at /pmxdr/api). If you would like to implement your own pmxdr
client library or pmxdr host library, please refer to the pmxdr standard at the bottom
of this README.


Supported Browsers
------------------

The following browsers support pmxdr. If you know of a browser that works but is not
listed, comment on this page and tell me the browser. 

* Gecko 1.9.x 
    * Firefox 3
    * Firefox 3.1/3.5
    * Seamonkey 2
    * Songbird 0.3+
    * Flock 2
    * Epiphany 2
* Google Chrome 2
* Opera 
    * Opera 10
    * Opera 9.5+ with `MessageEvent.origin` getter fix (http://-only, no https://)
* Safari 4
* IE 8


Demo
----

You can try out a demo of it in action [here][3]. In two of the tests in the demo,
code.eligrey.com requests some JSON data (which turns out not to just be some JSON, but
some JavaScript code too) from eligrey.com without using the current insecure method of
inserting a script tag and handing all control over to the other website. If the demo
was done with conventional `<script>` tags, the page's title would have been sent to
a (nonexistent) website that harvests page titles. 

 
Reference Client Library
------------------------

The reference client library uses the following object-oriented API. Pass a pmxdr
instance's request method an object containing any of these properties or an array of
such objects to do mutiple requests to utilize pmxdr. To create a pmxdr instance, create
a variable as `new pmxdr(host)` where *host* is any URI from the website you want to
request (pmxdr figures out where the API is located automatically). If you don't need a
reusable pmxdr instance (ie. only plan on making one request), just use `pmxdr.request`.
If you use an instance, the `uri` parameter can be a relative URI. The following doesn't
apply to `pmxdr.request`, only reusable instances: Only call the `request` method on an
instance once the interface iframe has loaded, which you can find out when instance calls
it's `onload` method once it's loaded if you set it. To start loading the instance, you
call it's `init` method. To remove the interface frame, you call it's `unload` method.
The following are parameters supported in a request object. Passing a string instead of
an object with parameters is the same as passing an object with only the `uri` parameter
defined as the string. 

* `method`: (Optional) Case-insensitive string representing the HTTP request method.
  Defaults to an instance's `defaultRequestMethod` (which defaults to
  `pmxdr.prototype.defaultRequestMethod` and is usually `"GET"` but can be changed).
* `uri`: (Required) The full absolute URI to be requested.
* `headers`: (Optional) An object with properties and values for headers to be sent.
  Example: `{"X-User": "eli", "X-Real-Referrer": location.href}`.
* `data`: (Optional) Data to send in a request. This is where you put the body of a
  POST request.
* `callback`: (Optional) Function to be called when request is complete.
* `contentType`: (Optional) Equivalent to setting the "Content-Type" header in the
  headers field. Defaults to the instance's `defaultContentType` property. If you want
  to simulate a form POST request, don't forget to set this to
  `application/x-www-form-urlencoded`.
* `timeout`: (Optional) Time in milliseconds that the request has to finish. If the
  request does not finish before the timeout, the callback (if any) is sent a TIMEOUT
  error code. Defaults to an instance's defaultTimeout (which
  defaults to `pmxdr.prototype.defaultTimeout`).

`pmxdr.prototype.defaultTimeout` is not set by default in this client library but you
can set it to have a global default timeout. To completely remove pmxdr, call its
`destruct` method, which removes all event listeners and deletes the pmxdr variable.
This does not delete any still-existing interface frames so don't forget to `unload`
them when you are done to save memory. 


Reference Host Library
----------------------

The reference host library fully supports the pmxdr standard. It needs no configuration
and defaults to the most restrictive settings of always requiring
`Access-Control-Allow-Origin` and not trusting any origin by default, including the same
website itself. When you set up the host library, it must be accessible via
`http://your-domain`***`/pmxdr/api`***.


The Response Object
-------------------

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


### Examples

    // requesting domain is eligrey.com
    // example.com/search is a fictional search service that supports pmxdr requests
    pmxdr.request({
      uri     : "http://example.com/search.json?q=foo",
      callback: handleResponse
    });
    
    function handleResponse(response) {
      if (!response.error) { // request successfull
          print(response.headers["content-type"]) // prints "application/json"
          print(response.data)
          // prints [{"name":"foo Inc","url":"http://foo.example/","description":"the world leader in foo"},{"name":"foo experts","url":"http://foobar.example/","description":"we are experts on foo!"}]
      } else print("Error: " + response.error);
    }

This creates a temporary iframe which is deleted after the response is recieved with an
src of "http://example.com/pmxdr/api" and sends the following JSON-encoded object to it
using postMessage (the id is randomly generated with collision-detection): 

    {pmxdr: true, method: "GET", uri: "http://example.com/search.json?q=foo", id:"5832485502879199"} The pmxdr host (example.com/pmxdr/api) requests http://example.com/search.json?q=foo using XHR and the headers that it receives include the following: 

    Content-Type: application/json
    Access-Control-Allow-Origin: http://example.com, http://eligrey.com, http://an-example-com-affiliate.com
    Access-Control-Allow-Methods: GET, POST

**Note:** `Access-Control-Allow-Origin: *` would also work but would allow all requests.

The pmxdr host then checks to see if the original requesting window is permitted to get
the data from the HTTP request. If the original requesting window is permitted to view
this data, it sends back the following response: 

    {pmxdr: true, headers:{"content-type":"application/json" /*, ...the rest of the headers...*/}, status: 200, data: '[{"name":"foo Inc","url":"http://foo.example/","description":"the world leader in foo"},{"name":"foo experts","url":"http://foobar.example/","description":"we are experts on foo!"}]', id:"5832485502879199"} Now that you got the basics, let's do a little more advanced example which uses example.com's more advanced fictional "search2" interface using a pmxdr instance and then doing two requests.: 

#### Using instances

    var pmxdrInstance = new pmxdr("http://example.com");
    pmxdrInstance.onload = function() {
        this.request([{
            method  : "post",
            uri     : "/search2.json",
            data    : "q=foo",
            callback: handleResponse,
            headers : {"X-Service-Key": "hunter2", "X-User": "eli", "X-Real-Referrer": location.href},
            timeout : 30000 /* == 30 seconds*/
        }]);
    }
    function handleResponse(response) {
        // do stuff with response
        pmxdrInstance.unload();
    }
    pmxdrInstance.init();

This creates a temporary iframe which is deleted after the response is recieved OR after
the timeout (30000ms, 30 seconds) with an src of "http://example.com/pmxdr/api" and sends
the following JSON-encoded object to it using postMessage: 

    {pmxdr: true, method: "post", uri: "http://example.com/search2.json", data: "q=foo", headers: {"X-Service-Key": "hunter2", "X-User": "eli"}, id:"9130873488166656"}

The pmxdr host (example.com/pmxdr/api) requests http://example.com/search/ using an XHR
`POST` request with the data, "q=foo". It also sends the headers, X-Service-Key and
X-User. The Content-Type header. The headers that it receives include the following:

    Content-Type: application/json
    Access-Control-Allow-Origin: *
    Access-Control-Allow-Methods: POST

The pmxdr host then checks to see if the original requesting window is permitted to get
the data and returns this if it is allowed: 

    {pmxdr: true, headers:{"content-type":"application/json" /*, ...the rest of the headers...*/}, data:'[{"name":"foo Inc","url":"http://foo.example/","description":"the world leader in foo"},{"name":"foo experts","url":"http://foobar.example/","description":"we are experts on foo!"}]', status:200, statusText:"OK" id:"9130873488166656"}

If the request is denied due to having a disallowed origin, it would return this: 

    {pmxdr: true, error: "DISALLOWED_ORIGIN", id:"9130873488166656", status:200, statusText:"OK"}

This example shows how to use the response headers: 

    pmxdr.request({ // Print the server of pmxdr host
      uri       : "http://pmxdr-host-enabled-website.example/",
      callback  : function(response){ print(response.headers.server) },
    })


Standard Error Codes
--------------------

* `DISALLOWED_ORIGIN`: The host was not allowed to request the resource.
* `DISALLOWED_REQUEST_METHOD`: Request method (ie. GET, POST, etc.) was not allowed.
* `LOAD_ERROR`: The requested resource did not return a 2xx HTTP response.
* `UNKNOWN`: Unknown error.
* `TIMEOUT`: Request timed out. **Note:** This error is not normally sent from the pmxdr
  host but is usually sent to the callback directly on the client-side. A host may return
  this error if it wishes to have a timeout.


Miscellaneous
-------------

At any point before the callback for a request is called, you may abort the request by
calling it's  `abort` method. If you gave an array of requests, call the `abort` method
on the appropriate index: 

    var request = pmxdr.request("http://example.com/foo.html");
    request.abort();
    // or
    var requests = pmxdr.request([
        "http://example.com/foo.html",
        "http://example.com/bar.html"
    ]);
    for (var i=0; i<requests.length; i++) {
        requests[i].abort();
    }

This interface also includes a callback method, which you can call to call the callback
and remove the request before receiving the response. 


Configuration
-------------

The client library has the following public configuration variables: 

* `pmxdr.originRegex`: The regular expression used to extract an HTML 5 "origin" from a
  URI. The default of `^([\w-]+:\/*\[?[\w\.:-]+\]?(?::\d+)?).*/` is very flexible and
  even works on IPv6 addresses. If you must edit it, make sure RegExp.$1 is the origin
  captured, as that's what the pmxdr client library uses.
* `pmxdr.prototype.defaultTimeout`: Not defined initially. Define this to apply a timeout
  to all pmxdr calls that don't specify an explicit timeout.
* `pmxdr.prototype.defaultRequestMethod`: Initially set to "GET". This is the default
  request method if a request method if not specified in a pmxdr call.
* `pmxdr.prototype.defaultContentType`: Not defined initially. Define this to specify a
  default Content-Type header value to send all data with.
  (ie. `application/x-www-form-urlencoded` for POST form requests)
* `pmxdr.interfaceFrameParent`: Parent node where interface frames are temporarily
  appended to. Initially set to `document.documentElement
  || document.getElementsByTagName("head")[0] || document.body ||
  document.getElementsByTagName("body")[0]`.
* You can override defaults for a whole pmxdr instance by specifying the property under
  the instance. For example: `var foo=new pmxdr("http://example.com"); foo.defaultTimeout
  = 60000`.

The host library also has a private array named alwaysTrustedOrigins, which can be filled
with protocol+host+non-standard port strings and regular expressions. Any website with an
origin matching one of the strings or regular expressions in the array is allowed to skip
the Access-Control-Allow-Origin header verification. This does not mean that the trusted
host is also allowed to skip checks with the `Access-Control-Allow-Methods` and
`Access-Control-Allow-Headers` headers.

The following is an example configuration of `alwaysTrustedOrigins`: 

    var alwaysTrustedOrigins = [ // change to always trusted origins
        /^[\w-]+:(?:\/\/)?([\w\.-]+\.)?eligrey\.com(?::\d+)?$/, // any origin on any protocol that has a domain that ends in eligrey.com
        "http://www.google.com", // only http://www.google.com is allowed, not http://foo.google.com:30/
        /\.example\.net$/, // *.example.net
        /^https?:\/\/([\w\.-]+\.)?example\.com$/ // these will all be allowed: https://example.com, http://example.com, https://*.example.com, http://*.example.com
    ];



pmxdr standard
==============

The pmxdr (postMessage cross-domain requester) standard defines the standard
communication format used by pmxdr clients and hosts via the postMessage interface.
You may use this standard to implement your own pmxdr-compliant libraries. The key words
"must", "must not", "required", "shall", "shall not", "should", "should not",
"recommended", "may", and "optional" in this document are to be interpreted as described
in [RFC 2119][1]. pmxdr hosts must always be accessible through the following relative
location from a website and should not redirect to another location: `/pmxdr/api`.

**Note:** All requests and responses to hosts and clients must be valid JSON format.
The order of properties in request and response JSON objects must not affect any aspect
of communication between host and client. 


Request Format
--------------

Requests to pmxdr hosts must be in a valid JSON object. The requests must have all of
the following required properties in the root of the JSON object (ie. if "a" is required,
it must be at `{a}`, not `{foo:{a}}`). All properties must be treated as case-sensitive. 

* `pmxdr` 
    * Required property. Must be `true`.
* `id` 
    * Optional property. Should be a string. It is recommended to make this a unique
      identification that is not the same as the identification of a request still being
      processed by the pmxdr host. Must not be null or anything that can `== false` in
      JavaScript. If this property is specified in a request, the host must define an
      identical id property in it's response JSON object.
* `uri` 
    * Required property. Should be an absolute or relative location accessible by the
      pmxdr host. The host must attempt to request this location using an
      [XMLHttpRequest][2] and should parse the following response headers and the origin
      of the requesting client and determine if the client is allowed to access the
      resource. Other methods may be used like the `alwaysTrustedOrigins` array used in
      the pmxdr host library reference implementation. 
        * `Access-Control-Allow-Origin`
        * `Access-Control-Allow-Methods`
* `method` 
    * Required property. It must be a string and must be treated as case-insensitive and
      converted to upper-case by the host. This must be used as the method for the
      XMLHttpRequest used to request `uri`.
* `data` 
    * Optional property. It must be a string and it should be sent as the body of an HTTP
      request if specified in a request.
* `headers` 
    * Optional property. It must be an object. All of it's properties should be strings.


Successful Response Format
--------------------------

A JSON object in this format must be sent if no errors occurred and the requesting origin
is allowed to view the response. 

* `pmxdr` 
    * Required property. Must be `true`.
* `id` 
    * If the request object specifies an id property, this property must be identical to
      that property.
* `status` 
    * This property must be identical to the `XMLHttpRequest` request's `status` property.
* `statusText` 
    * This property must be identical to the `XMLHttpRequest` request's `statusText`
      property.
* `data` 
    * Required property. Must be the value of the responseText property of the
      XMLHttpRequest.
* `headers` 
    * Required property. For every response header, the header name must be converted to
      lower-case and put as a property in this object with the header's value as the
      property's value.


Unsuccessful response format
----------------------------

A JSON object in this format must be sent if an error occurred or the requesting origin
is allowed to view the response. 

* `pmxdr` 
    * Required property. Must be `true`.
* `id` 
    * If the request object specifies an id property, this property must be identical
      to that property.
* `status` 
    * This property must be identical to the `XMLHttpRequest` request's `status` property.
* `statusText` 
    * This property must be identical to the `XMLHttpRequest` request's `statusText`
      property.
* `error` 
    * Required property. Should be a valid error code from the list of standard error
      codes below but may be any message. This must be a string and must be upper-case.
    * Standard error codes 
        * `DISALLOWED_ORIGIN`: The request origin was not allowed to request the resource.
        * `DISALLOWED_REQUEST_METHOD`: Request method (ie. GET, POST, ect.) was not
          allowed.
        * `LOAD_ERROR`: The requested resource did not return a 2xx HTTP response.
        * `UNKNOWN`: Unknown error. If you are lazy or just don't want to let a website
          know which thing is not allowed, make your host library send this instead of
          any error.
        * `TIMEOUT`: Request timed out.


Format Extensions
-----------------

pmxdr request and response format extensions (extra properties on request and response
JSON objects) must be put in an `"x"` object. For example, the foobar extension would use
`x.foobar` as it's property. The `x` object must be treated as case sensitive. The
following is an example `"remaining-requests"` response format extension that signifies
how many more requests are allowed to be made:

    {"pmxdr":true, /*...*/ "x":{"remaining-requests":5}}


![Tracking image](//in.getclicky.com/212712ns.gif)


 [1]: http://www.ietf.org/rfc/rfc2119.txt
 [2]: https://developer.mozilla.org/en/XMLHttpRequest "XMLHttpRequest"
 [3]: http://code.eligrey.com/pmxdr/demo.html
