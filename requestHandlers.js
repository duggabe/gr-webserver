/* requestHandlers */
/* gr-webserver */

"use strict"

var fs = require('fs');
var url = require('url');
var querystring = require("querystring");
var exec = require("child_process").exec;
var execSync = require("child_process").execSync;
var inspect = require('util').inspect;
var zmq = require("zeromq");

var _ops = fs.readFileSync ("opSys.txt", "utf8");
var opSys = _ops.substr(0,5);       /*  Win64, MacOS, or Linux (first 5 characters) */
console.log ("opSys is " + opSys);

if (opSys != "Win64")
    {
    var _parentPath = "../";
    var _localPath = "./";
    var _slash = "/";
    }
else
    {
    var _parentPath = "..\\";
    var _localPath = "";
    var _slash = "\\";
    }

/*  GLOBAL variables */
var Version = "2.0.0";          // filled in from ./package.json file
var debugFlags = 5;             // bit-wise flags: 0 = none; 1 = trace_buffer; 2 = console.log; 4 = more detail
var IN_SERVER = "127.0.0.1"     // localhost
var OUT_SERVER = "127.0.0.1"    // localhost
const DB_SIZE = 20;             // display 20 lines
var display_buffer = [];
var display_initialized = 0;
var trace_buffer = "";
var in_sockConnected = 0;
var out_sock;

var _pkg = _localPath + "package.json";
var PKinfo = {};
if (fs.existsSync (_pkg))
    {
    var _PKinfo = fs.readFileSync (_pkg, 'utf8');
    PKinfo = JSON.parse (_PKinfo);
    Version = PKinfo.version;
    }
else
    {
    console.log ("FATAL ERROR: package.json file not found!");
    process.exit(1);
    }

function pmt_to_string (p_string)
    {
    /* converts a GNU Radio Polymorphic Type to a string */
    var i;
    var offset = 3;
    var s_len = p_string[2];
    var p_len = p_string.length;
    var o_string = ""

    if (debugFlags & 4)
        {
        for (i = 0; i < p_len; i++)
            trace_buffer += (" " + p_string[i]);
        trace_buffer += ("<br>"); 
        }
    for (i = offset; i < p_len; i++)
        {
        if (p_string[i] != 13)          // LF
            o_string += String.fromCharCode(p_string[i]);
        }
    if (debugFlags & 4)
        {
        trace_buffer += ("offset = " + offset + "<br>"); 
        trace_buffer += ("s_len = " + s_len + "<br>");
        trace_buffer += ("p_len = " + p_len + "<br>");
        trace_buffer += ("o_string = '" + o_string + "'<br>"); 
        }
    return (o_string);
    }

function string_to_pmt (s_string)
    {
    /* converts a string to a GNU Radio Polymorphic Type */
    var i;
    var offset = 3;
    var s_len = s_string.length;
    var p_string = "";

    p_string += "\x02";         // PST_SYMBOL = 0x02
    p_string += "\x00";         // UVI_U8 = 0x00
    p_string += String.fromCharCode (s_len);
    p_string += s_string;
//    p_string += "'";
    if (debugFlags & 4)
        {
        trace_buffer += ("string_to_pmt:  '" + s_string + "'<br>"); 
        trace_buffer += ("string_to_pmt: [" + p_string + "]<br>");
        }
    return (p_string);
    }

function Console (response, request)
    {
    if (debugFlags & 2)
        console.log ("Request handler 'Console'.");
    var now = new Date();
    var _ctime = now.toString();
    if (in_sockConnected == 0)
        {
        console.log ("zmq SUB socket not connected at " + _ctime);
        trace_buffer += ("zmq SUB socket not connected at " + _ctime + "<br>");
        trace_buffer += (" *** Doing a restart. ***<br><br>");
        // switch to init screen to restart TLS
        response.writeHead (302, {'Location': 'http://localhost:50250/init'});
        response.end();
        }
    else
        {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write ("<!DOCTYPE html>\n");
        response.write ("<html>\n");
        response.write ("<head>\n");
        response.write ("<meta charset=\"UTF-8\">\n");
        response.write ("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
        response.write ("<meta http-equiv=\"Cache-Control\" content=\"no-cache, no-store, must-revalidate\">\n");
        response.write ("<meta http-equiv=\"Pragma\" content=\"no-cache\">\n");
        response.write ("<meta http-equiv=\"Expires\" content=\"0\">\n");
        response.write ("<title>DCS webserver</title>\n");
        response.write ('<link rel="stylesheet" type="text/css" href="style">\n');
        response.write ("</head>\n");
        response.write ("<body>\n");

        response.write ("<header>\n");
        response.write ("<p class='bl_strip'>DCS webserver: Console</p>");
        response.write ("<p>Version " + Version + "</p>\n");
        var now = new Date();
        var _ctime = now.toString();
        response.write('<p>Updated ' + _ctime + "</p>\n");
        response.write ("</header>\n");

        response.write ('<script>\n');
        response.write ('function myFunction ()\n');
        response.write ('    {\n');
        response.write ('    if ((event.charCode) == 13)\n');
        response.write ('        document.getElementById("_form").submit();\n');
        response.write ('    }\n');
        response.write ('</script>\n');
        response.write ('<noscript>Sorry, your browser does not support JavaScript!</noscript>\n');

        response.write ("<form id=\"_form\" action=\"http://localhost:50250/upload\" method=\"post\">\n");
        response.write ('Input:<br>\n');
        response.write ('<textarea name="in_put" rows="1" cols="96" autofocus onkeypress="myFunction()">\n');
        response.write ("</textarea><br>\n");
        response.write ('</form>\n');
        response.write ('<br>\n');

        response.write ('<div id="serverData"></div>\n');
        response.write ("<br>\n");

        response.write ('<script>\n');
        response.write ('    if (typeof(EventSource) !== "undefined")\n');
        response.write ('        {\n');
        response.write ('        var eSource = new EventSource ("http://localhost:50250/send_sse");\n');
        response.write ('        eSource.onmessage = function (event) {\n');
        response.write ('            document.getElementById("serverData").innerHTML = event.data;\n');
        response.write ('            };\n');
        response.write ('        }\n');
        response.write ('    else\n');
        response.write ('        document.getElementById("serverData").innerHTML = "Your browser does not support server-sent events.";\n');
        response.write ('</script>\n');

        response.write ("</body>\n");
        response.write ("</html>\n");
        response.end ();
        }
    }       // end console

function favicon (response, request)
    {
    if (debugFlags & 2)
        console.log("Request handler 'favicon'.");
    var _fn = _localPath + 'favicon.ico';
    fs.readFile (_fn, null, function (err,data)
        {
        if (err)
            {
            if (debugFlags & 2)
                console.log ("favicon.ico not found.");
            response.writeHead(404 ,{'Content-Type': 'text/plain'});
            response.write('404 favicon Not Found\n');
            response.write (err);
            response.end();
            }
        else
            {
            response.writeHead(200, {"Content-Type": "image/x-icon"});
            response.write(data);
            response.end();
            }
        });
    }

function init (response, request)
    {
    if (debugFlags & 2)
        console.log ("Request handler 'init'.");
    if (display_initialized == 0)
        {
        // init display buffer
        var i;
        for (i = 0; i < DB_SIZE; i++)
            display_buffer.push ("");       // fill buffer with empty strings
        display_initialized = 1;
        }
    if ((process.argv.length) > 3)
        {
        if (debugFlags & 1)
            trace_buffer += (process.argv + "<br>");
        var pos = process.argv[2].search ("192.168");
        if (pos == 0)
            OUT_SERVER = process.argv[2];   // set local address
        pos = process.argv[3].search ("192.168");
        if (pos == 0)
            IN_SERVER = process.argv[3];    // set remote address
        }
    if (in_sockConnected == 0)
        {
        // create sockets
        var in_sock = zmq.socket("sub");
        var _PROTOCOL = "tcp://"
        var IN_PORT = ":50252"
        var IN_ADDR = _PROTOCOL + IN_SERVER + IN_PORT
        out_sock = zmq.socket('pub');
        var OUT_PORT = ":50251"
        var OUT_ADDR = _PROTOCOL + OUT_SERVER + OUT_PORT

        in_sock.connect (IN_ADDR);
        in_sock.subscribe ("");
        if (debugFlags & 1)
            trace_buffer += ("zmq SUB socket listening on: " + IN_ADDR + "<br>");
        in_sockConnected = 1;

        out_sock.bind (OUT_ADDR);
        if (debugFlags & 1)
            trace_buffer += ("zmq PUB socket bound to: " + OUT_ADDR + "<br>");

        in_sock.on ("message", function(data) {
            var i;
            var d_len = data.length;
            var rcv_obj = JSON.parse(data);
            var msg = rcv_obj.text;
            display_buffer.push ("< " + msg + "<br>");      // put in new item at end
            display_buffer.shift();                                     // remove oldest from top
            });
        }
    // switch to Console screen
    response.writeHead(302, {'Location': 'http://localhost:50250/Console'});
    response.end();

    }   // end init

function send_sse (response, request)
    {
    /* Server-Sent Events */
    if (debugFlags & 2)
        console.log("Request handler 'send_sse'.");
    var now = new Date();
    var _ctime = now.toString();
    if (debugFlags & 8)
        {
        trace_buffer += ("send_sse: " + _ctime + "<br>");
        trace_buffer += ("data: " + display_buffer.join("") + "<br>");
        }
    response.writeHead(200, {"Content-Type": "text/event-stream"});
    response.write ("<meta http-equiv=\"Expires\" content=\"-1\">\n");
    response.write ("data: " + display_buffer.join("") + "\n\n");        // two trailing LF required for SSE
    response.end();
    }

function style (response, request)
    {
    if (debugFlags & 2)
        console.log("Request handler 'style'.");
    var _fn = _localPath + 'dcsmail.css';
    var data = fs.readFileSync (_fn, 'utf8');
    response.writeHead(200, {"Content-Type": "text/css"});
    response.write(data);
    response.end();
    }

function trace (response, request)
    {
    if (debugFlags & 2)
        console.log("Request handler 'trace'.");
    response.writeHead (200, {"Content-Type": "text/html"});
    response.write ("<!DOCTYPE html>\n");
    response.write ("<html>\n");
    response.write ("<head>\n");
    response.write ("<meta charset=\"UTF-8\">\n");
    response.write ("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
    response.write ("<meta http-equiv=\"Cache-Control\" content=\"no-cache, no-store, must-revalidate\">\n");
    response.write ("<meta http-equiv=\"Pragma\" content=\"no-cache\">\n");
    response.write ("<meta http-equiv=\"Expires\" content=\"0\">\n");
    response.write ("<meta http-equiv=\"refresh\" content=\"120\">\n");    // auto refresh (2 min)
    response.write ("<title>DCS trace buffer</title>\n");
    response.write ('<link rel="stylesheet" type="text/css" href="style">\n');
    response.write ("</head>\n");
    response.write ("<body>\n");
    response.write ("<h3>Trace buffer</h3>\n");
    var now = new Date();
    var _ctime = now.toString();
    response.write('<p>Updated ' + _ctime + "</p>\n");
    response.write (trace_buffer);
    response.write ("<br>\n");
    response.write ("</body>\n");
    response.write ("</html>\n");
    response.end ();
    }

function upload (response, postData)
    {
    if (debugFlags & 2)
        console.log ("Request handler 'upload'.");
    var url_parts = querystring.parse (postData);
    var in_msg = url_parts.in_put;
    var i;
    var msg = "";
    var s_len = in_msg.length;
    // strip trailing LF
    for (i = 0; i < s_len; i++)
        {
        if (in_msg[i] != "\n")
            msg += in_msg[i];
        else
            break;    // stop on first LF found
        }
    // display message
    display_buffer.push ("> " + msg + "<br>");      // put in new item at end
    display_buffer.shift();                                     // remove oldest from top

    var obj = {text: "message"};
    obj.text = msg;
    var out_msg = JSON.stringify(obj);
    // send to server
    out_sock.send (out_msg);
    // switch to Console screen
    response.writeHead(302, {'Location': 'http://localhost:50250/Console'});
    response.end();
    }           // end of upload

exports.Console = Console;
exports.favicon = favicon;
exports.init = init;
exports.send_sse = send_sse;
exports.style = style;
exports.trace = trace;
exports.upload = upload;

