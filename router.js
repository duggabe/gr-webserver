/* router.js */
/* gr-webserver */

"use strict"

var fs = require('fs')

function route(handle, pathname, response, request)
    {
//    console.log('About to route a request for ' + pathname);
    var _pos = pathname.indexOf (".htm");
    if (_pos > 0)     // page request
        {
        var _fn = "." + pathname;
//        console.log ("Request for " + _fn);
        fs.readFile (_fn, 'utf8', function (err,data)
            {
            if (err)
                {
                console.log ('Page not found: ' + _fn);
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.write ('404 Not Found ' + pathname + "\n");
                response.end();
                return;
                }
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(data);
            response.end();
            });
        }
    else if (typeof handle[pathname] === 'function')
        {
        return handle[pathname](response, request);
        }
    else
        {
        console.log ('No request handler found for ' + pathname);
        response.writeHead(404 ,{'Content-Type': 'text/plain'});
        response.write ('404 Not Found');
        response.write (pathname + "\n");
        response.end();
        }
    }
    
exports.route = route;
