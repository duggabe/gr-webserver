# gr-webserver

This web server emulates a terminal/console using a browser for the user interface.<br>

For use with GNU Radio, it sends keyboard input text to a ZMQ PUSH Message socket and displays received text from a ZMQ PULL Message socket. It can be used as an alternative to a Message Edit Box and/or a Message Debug Block for string messages.

## Installation

See [What is GNU Radio?](https://wiki.gnuradio.org/index.php/What_is_GNU_Radio%3F) and [Installing GNU Radio](https://wiki.gnuradio.org/index.php/InstallingGR)

Note: These instructions are written for a Linux OS. Similar commands work for Mac and Windows.

* Open a terminal window.
* Change to the home directory.

```
cd ~/  
```

* If you don't have 'git', enter

```
sudo apt install git  
```

* Clone the repository:

```
git clone https://github.com/duggabe/gr-webserver.git
```

* Change to the cloned directory:

```
cd ~/gr-webserver
```

* If you don't have 'node' (or 'nodejs') enter:

```
sudo apt install node
```

* If you don't have 'npm' enter:

```
sudo apt install npm
```

* Install zeromq:

```
npm install zeromq --save
```

* There are three files to define the Operating System for gr-webserver. Execute the appropriate one.

```
cp -v opSys_Linux.txt opSys.txt
cp -v opSys_Mac.txt opSys.txt
copy opSys_Win.txt opSys.txt /v
```

## Operation

* To start the webserver, enter:<br>
  `node index.js` <- OR -> `npm start`<br>
  Note: using npm is slower to start, but it sets up some error logging of its own which can be useful in debugging problems.
* You will get the following messages on your terminal:
    - "opSys is Linux" (your appropriate OS)
    - "gr-webserver has started. Listening on port: 50250"
* A web page (or tab) will open in your default browser.
* Text entered in the "Input" field is processed one line at a time. The terminator is the 'Enter' key. The text will be displayed on the Console screen, preceded by<br> &quot;&gt;&nbsp;&quot;, and will be sent through a ZMQ PUSH Message port 50251.
* Text received by the ZMQ PULL Message port 50252 will be displayed on the Console screen, preceded by &quot;&lt;&nbsp;&quot;.
* The terminal will remain attached to the node.js process.
* Any additional informational messages written to the console will appear there.
* To terminate, close the tab in your browser and enter Control-C on your terminal.

## QA / Testing

* In the examples folder, there is an echo program which will  receive messages, capitalize the text, and return the message. To use it while gr-webserver is running, open a second terminal screen and perform the following steps:

```
cd ~/gr-webserver/examples
python3 zmq_PUSH_PULL_server.py
```

* Whatever you type on the Input will be echoed in all caps.
* There is also an example flowgraph which will display input messages on the console and send out a "Testing" message every 10 seconds.

