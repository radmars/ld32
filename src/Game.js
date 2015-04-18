Object.defineProperty(Array.prototype, "remove", {
    enumerable: false,
    value: function (item) {
        var removeCounter = 0;

        for (var index = 0; index < this.length; index++) {
            if (this[index] === item) {
                this.splice(index, 1);
                removeCounter++;
                index--;
            }
        }
        return removeCounter;
    }
});

function rotateV( v, r ) {
    var m = new THREE.Matrix4().makeRotationZ(r);
    var v = v.clone();
    v.applyMatrix4(m);
    return v;
}

function mapSoundAsset( base, vol, prefix ) {
    return {
        name: "audio/" + (prefix || "") + base,
        volume: vol,
        urls: [
                "assets/audio/" + (prefix || "") + base + ".ogg",
                "assets/audio/" + (prefix || "") + base + ".m4a"
        ],
        type: 'audio',
        buffer: true,
        callback: function( audio ) {
            audio.origVolume= vol;
        }
    };
};

function isUp( game ) {
    var keys = game.input.keys;
    return keys[87] || keys[38];
}

function isRight( game ) {
    var keys = game.input.keys;
    return keys[68] || keys[39];
}

function isLeft( game ) {
    var keys = game.input.keys;
    return keys[65] || keys[37];
}

//Howler.mute();

var Game = (function(){
    "use strict";
    function InputManager(element) {
        var self = this;
        this.element = element;
        this.motionEvent = [];
        this.clickEvent = [];
        // typing
        this.pressEvent = [];
        // releasinG
        this.keyUpEvent = [];
        //holding
        this.keyDownEvent = [];
        this.element.tabIndex = 1;
        this.element.focus();
        this.element.addEventListener('mousemove', this.mouseMove.bind(this));
        //this.element.addEventListener('keypress', this.press.bind(this));
        this.element.addEventListener('keydown', this.keyDown.bind(this), true);
        this.element.addEventListener('keyup', this.keyUp.bind(this), true);
        this.element.addEventListener('click', this.click.bind(this));

        // non evented key queries
        this.keys = {};

        this.keyDownEvent.push(function(e) {
            self.keys[e.keyCode] = true;
        });
        this.keyUpEvent.push(function(e) {
            delete self.keys[e.keyCode];
        });
    }

    function generateHandler( field ) {
        return function(e) {
            var handlers = this[field];
            handlers.forEach(function(handler) {
                handler(e);
            });
            return true;
        };
    }

    InputManager.prototype.click = generateHandler( 'clickEvent' );
    InputManager.prototype.press = generateHandler( 'pressEvent' );
    InputManager.prototype.mouseMove = generateHandler( 'motionEvent' );
    InputManager.prototype.keyDown = generateHandler( 'keyDownEvent' );
    InputManager.prototype.keyUp = generateHandler( 'keyUpEvent' );

    function Game(element) {
        var self = this;
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.callback = this.update.bind(this);
        this.settings = {};
        this.mainElement = element;
        this.renderer.domElement.onfocus = function() {
            self.focus = true;
        };
        this.renderer.domElement.onblur = function() {
            self.focus = false;
        }

        // Extract settings with some probably broken regex.
        window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(match, key, value) {
            self.settings[key] = value;
        });

        this.operations = [];
        this.mainElement.appendChild(this.renderer.domElement);
        this.input = new InputManager(this.renderer.domElement);
        window.onresize = this.resize.bind(this);
        this.loader = new Loader();
        this.setState(new LoaderState(new IntroState(new PlayState())));
        this.lastFrame = Date.now();
        requestAnimationFrame(function(){
            self.resize();
            self.callback();
        });
    }

    Game.prototype.setState = function(state) {
        if (this.state) {
            this.state.onStop(this);
        }
        this.state = state;
        this.state.onStart(this);
        this.state.resize(this.width, this.height);
    };

    Game.prototype.resize = function(event) {
        var r = this.mainElement.getBoundingClientRect();
        this.width = r.width;
        this.height = r.height;
        this.state.resize(this.width, this.height);
        this.renderer.setSize(this.width, this.height);
    };

    Game.prototype.update = function() {
        delta = Date.now() - this.lastFrame;
        if(this.focus) {
            var delta, op;
            while ((op = this.operations.pop())) {
                op(this);
            }
            this.state.update(this, delta);
            this.state.render(this);
        }
        this.lastFrame = Date.now();
        requestAnimationFrame(this.callback);
    };
    return Game;
}).call(this);
