Visual Black Box (VBB)
======================

[http://github.com/PaulMontgomery/VisualBlackBox](http://github.com/PaulMontgomery/VisualBlackBox)

What is Visual Black Box?
-------------------------
This project enables quick, easy and free implementation of real-time data
visualizations (example: real-time line graphs) in a web browser consumable
way. Let's get right to the gist of it...

If you can create a .TSV (tab-separated values) file that looks something
like this:

`date	close0	close1	close2  
5-May-12	483.10	823.4	582  
4-May-12	728.88	458	822  
3-May-12	612.17	721	624  
2-May-12	582.13	621	442`

... then you can create web browser-enabled data visualizations that look
like the examples shown on the following web page in just minutes using the
built-in VBB GUI widgets:

[http://d3js.org/](http://d3js.org/)


Features
--------

* Creates a small/fast [Node.js](http://nodejs.org/) web server to serve data
visualizations to web browsers
* Uses cutting edge data visualization libraries like
[D3.js](http://d3js.org/)
* Data visualizations are [SVG](http://www.w3.org/Graphics/SVG/)-based and
thus are infinitely scalable to meet dashboard needs
* Real-time data enabled by server data push ([Socket.IO](http://socket.io/)
web sockets) to the web browser client
* Server data pushes are multicasted to all listeners
* Open source! Apache 2.0 license.
* Platform agnostic - This has run on Linux, Macs and Windows with no issues
* Pluggable architecture which will enable future seamless upgrades such as
.CSV/.JSON input data formats, more d3-based data visualization widgets
* Easy configuration through JSON or TSV files, no need for code changes


Possible Uses
-------------

* Big data real-time visualization
* Hackathons - Create professional GUIs to demonstrate your project results
quickly, especially when under a time crunch!
* Monitor CPU, memory, disk, etc resources remotely in just minutes
* Create your own dashboard using many frames of resizable data visualizations


Next Steps
----------

Please read the INSTALL.txt document for instructions on how to quickly set
up VBB and a demo on your own system.

More guides will be added soon that describe configuration, software
interfaces and project architecture.


Contact
-------

[Paul Montgomery](http://paulmontgomerycode.wordpress.com)
paulmontgomery.code@gmail.com

Please note that this project is in early stages so expect rapid changes and
possible backwards compatibility breaking.  Also, please forgive any bad style
used in my code as I'm using this project to teach myself Javascript, D3.js
and Node.js in my spare time.