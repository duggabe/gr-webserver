/* index.js - main function */
/* gr-webserver */

"use strict"

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
handle["/Console"] = requestHandlers.Console;
handle['/favicon.ico'] = requestHandlers.favicon;
handle["/init"] = requestHandlers.init;
handle["/send_sse"] = requestHandlers.send_sse;
handle["/style"] = requestHandlers.style;
handle["/trace"] = requestHandlers.trace;
handle["/upload"] = requestHandlers.upload;

server.start (router.route, handle);
