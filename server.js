/* node.js server */
/* gr-webserver */

"use strict"

var http = require("http");
var url = require("url");
var exec = require("child_process").exec;
var fs = require('fs')
var _ops = fs.readFileSync ("opSys.txt", "utf8");
var opSys = _ops.substr(0,5);       /*  Win64, MacOS, or Linux (first 5 characters) */

function start (route, handle)
    {
    function onRequest (request, response)
        {
        var postData = "";
        var pathname = url.parse(request.url).pathname;
//        console.log ("Request for " + pathname + " received.");
        request.setEncoding("utf8");
        request.addListener("data", function(postDataChunk)
            {
            postData += postDataChunk;
//            console.log("Received post data chunk.");
            });
        request.addListener("end", function()
            {
            if (postData != "")
                {
//                console.log ("end of post data.");
                route(handle, pathname, response, postData);
                }
            else
                {
//                console.log ("end of request.");
                route (handle, pathname, response, request);
                }
            });
        }
    var port = 50250;
    http.createServer(onRequest).listen(port);
    console.log ("gr-webserver has started. Listening on port: " + port);
//  start browser
    var command;
    if (opSys == "Win64")
        command = ("start http://localhost:50250/init");             // Win64
    else if (opSys == "MacOS")
        command = ("open http://localhost:50250/init");            // MacOS
    else
        command = ("xdg-open http://localhost:50250/init");     // Linux
    exec (command, function (error, stdout, stderr) 
        {
        if (error)
            {
            console.log ("command: ", command);
            console.log ("error: ", stderr);
            }
        });
    }
    
exports.start = start;
