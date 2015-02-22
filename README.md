[splash]: http://img15.hostingpics.net/pics/477214splash.png
[icon]: http://img15.hostingpics.net/pics/644112drawablexhdpiicon.png

![Alt text][splash]
#PongHeroes
*This project has been created for a JS Canvas workshop at __Gobelins - l'école de l'image__.*

If you like the original pong but feel a lack of a little something : do not hesitate, try PongHeroes. You can choose you racket in function of it's style and/or it's power. A slow one but with a cool power ? Or a quick one with a more basic power ?
Furthermore, you will have to fight against real people, online ! You can use your desktop, your phone (with the application or in your favorite browser) and fight cross platforms without a problem !

## How to play ?
From your browser (from any device) : http://91.121.120.180/pong-heroes/www/

With the android app, download this .APK and install it on your phone : http://91.121.120.180/pong-heroes/bin/PongHeroes.apk

## Installation
Firstly, you can clone the projet with the command :

    git clone https://github.com/Jerek0/pong-pixi-js.git
    
### Server
All the server sources are located in /server/. To run the server, you have to install some dependencies. Make sure you have node and run this command from the server folder.

    npm install
    
When it's done, you'll have to make a copy of config_sample.json into config.json, with your own settings. For example :

    {
      "url": "127.0.0.1",
      "port": 1234
    }

Finally, you're ready to launch the server, juste launch this :
    
    node server.js
    
Your server is now running.

### Browser
*There is currently some problems with the iOS retina devices*

The easiest way to play the game is to use your browser. But you need a quick configuration before that.

Go to /app/www/js/network/ and make a copy of serverConfig_sample.js to serverConfig.js. Adapt the settings in this new file to correspond with your server configuration. For example :

    var serverConfig = {
        url: "127.0.0.1",
        port: 1234
    }

Then, make sure you have browserify installed, if not, run this command : 

    npm install -g browserify
    
Finally, go to /app/www/js/ and run this command :

    browserify app.js -o bundle.js
    
This will take all the JS source files to compress it in a simple bundle.js file. 

You can now go to your browser and enter the URL to /app/www/.

### Cordova
*There is currently some problems with the iOS platform*

If you want to install the game on your phone as an app, here's the way to achieve it. Make sure you have cordova installed, and everything to compile in android or ios. Then, run the command :

    cordova platform add android
    
Replace android by ios if necessary. You're juste a step from the end, launch this command :

    cordova run android
    
And it's done ! The game should launch on you device

![Alt text][icon]
##Credits
Created with NodeJS, SocketIO and PixiJS.
Concept, design and code : Jérémy M. (http://www.jeremy-minie.com/)