#!/usr/bin/python3
# -*- coding: utf-8 -*-

# echo_JSON.py

import sys
import pmt
import zmq
import json

debugFlags = 1

# create a PUB socket
_PROTOCOL = "tcp://"
_SERVER = "127.0.0.1"          # localhost
_PUB_PORT = ":50252"
_PUB_ADDR = _PROTOCOL + _SERVER + _PUB_PORT
if (debugFlags & 1):
    print ("'zmq_PUB_SUB_server' version 230622 binding to:", _PUB_ADDR)
pub_context = zmq.Context()
pub_sock = pub_context.socket (zmq.PUB)
rc = pub_sock.bind (_PUB_ADDR)

# create a SUB socket
_PROTOCOL = "tcp://"
_SERVER = "127.0.0.1"          # localhost
_SUB_PORT = ":50251"
_SUB_ADDR = _PROTOCOL + _SERVER + _SUB_PORT
if (debugFlags & 1):
    print ("'zmq_PUB_SUB_server' connecting to:", _SUB_ADDR)
sub_context = zmq.Context()
sub_sock = sub_context.socket (zmq.SUB)
rc = sub_sock.connect (_SUB_ADDR)
sub_sock.setsockopt(zmq.SUBSCRIBE, b'') # subscribe to topic of all

while True:
    #  Wait for next request from client
    msg = sub_sock.recv()
    m_len = len (msg)
    if (debugFlags & 4):
        print("Received:", msg, m_len)
    i = 0
    data = ""
    while (i < m_len):
        data += chr (msg[i])
        i += 1
    if (debugFlags & 4):
        print("data:", data)
    PYdict = json.loads(data)
    if (debugFlags & 4):
        print("PYdict:", PYdict)
    output = PYdict["text"].upper()    # capitalize message
    PYdict["text"] = output
    #  Send reply back to client
    _reply = json.dumps(PYdict)
    res = _reply.encode('utf-8')
    if (debugFlags & 4):
        print("Sent:", str(res))
    pub_sock.send (res)

