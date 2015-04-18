var LoaderState = (function() {
    "use strict";

    function LoaderState( nextState ) {
        State.call(this);

        this.nextState = nextState;
        this.assets = this.nextState.getAssets();
    }

    LoaderState.prototype = Object.create(State.prototype);

    LoaderState.prototype.getAssets = function() {
        return this.assets;
    };

    LoaderState.prototype.resize = function(width, height) {
        this.cx = width / 2;
        this.cy = height / 2;
        this.camera.right = width;
        this.camera.bottom = height;
        this.camera.updateProjectionMatrix();
    };

    LoaderState.prototype.onStart = function(game) {
        this.scene = new THREE.Scene();
        this.font = new TextRenderer.Font({
            font: "monospace",
            size: 32,
            fgColor: 'white',
        });

        game.renderer.setClearColor(0x2e2e2e, 1);
        game.renderer.autoClear = false;
        game.loader.load(this.nextState.getAssets());
        this.camera = new THREE.OrthographicCamera( 0, game.width, 0, game.height );
        this.scene = new THREE.Scene();
        this.camera.position.z = 10;
        game.renderer.clear();
        game.renderer.render(this.scene, this.camera);

    };

    LoaderState.prototype.onStop = function(game) {
        return game.renderer.autoClear = true;
    };

    LoaderState.prototype.update = function(game, dt) {
        var self = this;
        if(! this.text ) {
            this.text = TextRenderer.render(this.font, "Loading...");
            this.scene.add(this.text);
        }
        if (game.loader.done(this.getAssets())) {
            game.operations.push(function() {
                return game.setState(self.nextState);
            });
        }
    };

    LoaderState.prototype.render = function(game) {
        game.renderer.clear();
        game.renderer.render(this.scene, this.camera);
    };

    return LoaderState;
}).call(this);
