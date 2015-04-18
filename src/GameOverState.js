var GameOverState = (function() {
    "use strict";

    var pixelize = function(t) {
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.LinearMipMapLinearFilter;
    };

    function GameOverState(scores) {
        State.call(this);
        this.assets = [
        ];

    };

    GameOverState.prototype = Object.create(State.prototype);

    GameOverState.prototype.getAssets = function() { return this.assets; };

    GameOverState.prototype.onStart = function(game) {
        this.score = 0;

        this.scene2d = new THREE.Scene();
        this.camera2d = new THREE.OrthographicCamera( 0, game.width, 0, game.height );
        this.camera2d.position.z = 10;
        game.renderer.setClearColor(0x2e2e2e, 1);
        game.renderer.autoClear = false;
        
        this.font = new TextRenderer.Font({
            font: "monospace",
            size: 56,
            fgColor: 'white',
        });
        var self = this;

    };

    GameOverState.prototype.update = function(game, dt){
        State.prototype.update.call(this, game, dt);
        if( game.input.keys[13] ) {
            game.operations.push(function() {
                game.setState( new PlayState() );
            });
        }

    }

    GameOverState.prototype.resize = function(width, height) {
        this.cx = width / 2;
        this.cy = height / 2;
        this.camera2d.right = width;
        this.camera2d.bottom = height;
        this.camera2d.updateProjectionMatrix();
    };

    GameOverState.prototype.onStop = function(game) {
        game.renderer.autoClear = true;
    };

    GameOverState.prototype.render = function(game) {
        game.renderer.clear();
        game.renderer.render(this.scene2d, this.camera2d);
    };

    return GameOverState;
}).call(this);
