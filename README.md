# gr-webserver

This web server emulates a terminal/console using a browser for the user interface. It is mainly for use with GNU Radio.<br>

## Versions

There are two release versions of this program:

* Version v1.0.16.0 sends keyboard input text as a PMT message to a ZMQ PUSH Message socket and displays received PMT messages from a ZMQ PULL Message socket. It can be used as an alternative to a Message Edit Box and/or a Message Debug Block for PMT string messages.

* Version v2.1.0.0 changes the ZMQ PUSH Message socket to a ZMQ PUB Message socket and changes the ZMQ PULL Message socket to a ZMQ SUB Message socket. It can receive either plain PMT messages (such as from a Message_Strobe), or PDU messages (such as from a Tagged_Stream_to_PDU block).

Here is a screen shot of Version 1:

![screen shot](./gr-webserver_out.png "gr-webserver Console")

## Installation

See [What is GNU Radio?](https://wiki.gnuradio.org/index.php/What_is_GNU_Radio%3F) and [Installing GNU Radio](https://wiki.gnuradio.org/index.php/InstallingGR)

Note: These instructions are written for a Linux OS. Similar commands work for Mac and Windows.

* Open a terminal window.  
* Change to the home directory.
  
```
cd ~/  
```
* If you don't have 'git', enter.

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
* If you want Version v1.0.16.0, enter:

```
git checkout v1.0.16.0
```
* If you don't have 'node' (or 'nodejs') enter:

```
sudo apt install nodejs
```
* If you don't have 'npm' enter:

```
sudo apt install npm
```
* Install zeromq:

```
npm install zeromq --save
```
* There are three files to define the Operating System for gr-webserver. Execute the appropriate one for your system.

```
cp -v opSys_Linux.txt opSys.txt
cp -v opSys_Mac.txt opSys.txt
copy opSys_Win.txt opSys.txt
```

## Operation

* To start the webserver, enter:<br>
  `node index.js` <- OR -> `npm start`<br>
  Note: using npm is slower to start, but it sets up some error logging of its own which can be useful in debugging problems.
* You will get the following messages on your terminal:
    - "opSys is Linux" (your appropriate OS)
    - "gr-webserver has started. Listening on port: 50250"
* A web page (or tab) will open in your default browser.
* Text entered in the "Input" field is processed one line at a time. The terminator is the 'Enter' key. The text will be displayed on the Console screen, preceded by<br> &quot;&gt;&nbsp;&quot;, and will be sent through a ZMQ PUB Message port 50251.
* Text received by the ZMQ SUB Message port 50252 will be displayed on the Console screen, preceded by &quot;&lt;&nbsp;&quot;.
* The terminal will remain attached to the node.js process.
* Any additional informational messages written to the console will appear there.
* To terminate, close the tab in your browser and enter Control-C on your terminal.

## Using across multiple computers (new in version 1.0.16.0)

If the ZMQ Message Source and Sink blocks are on different computers on the same LAN, then the IP and port number of the ZMQ PUB Message Sink block must be specified on each end of that connection. For example, if the Sink is on IP 192.168.2.14:50251 and the Source is on IP 192.168.2.5, both Source and Sink blocks must specify the Sink IP and port (192.168.2.14:50251).

* To set the local and remote IP addresses, start the webserver with IP parameters (local remote). For example:

```
node index.js 192.168.2.14 192.168.2.5
```

* See [ZMQ PUSH Message Sink](https://wiki.gnuradio.org/index.php/ZMQ_PUSH_Message_Sink) for additional information.

## QA / Testing

* In the examples folder, there is a flowgraph which sends a message periodically and displays received messages on the terminal screen. To use it while gr-webserver is running, open a second terminal screen and perform the following steps:

```
cd ~/gr-webserver/examples
gnuradio-companion
```

* Open 'msg_test5.grc' then click 'Execute the flowgraph' or press F6.

* On the 'gr-webserver' screen the message "< GNU Radio" will be displayed every 5 seconds. Anything you type in the Input box will be displayed on the 'msg_test5.grc' screen. 

* While gr-webserver is running, you can open another tab in your browser to ```http://localhost:50250/trace``` to see some diagnostic information.

