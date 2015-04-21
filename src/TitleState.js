var TitleState = (function(){
    "use strict";

    var pixelize = function(t) {
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.LinearMipMapLinearFilter;
    };

    function TitleState(nextState) {
        State.call(this);
        this.nextState = nextState;
    }

    TitleState.prototype = Object.create(State.prototype);

    function setBlindOverlayOpacity(overlay, opacity) {
        overlay.currentAnimationData().materials.forEach(function(mat) {
            mat.opacity = opacity;
        });
    }

    TitleState.prototype.getAssets = function() {
        // Bring it all together!
        return [].concat(
            this.nextState.getAssets(),
            { name: 'assets/gfx/title.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/blind1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/blind2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/blind3.png', type: 'img', callback: pixelize }
        ).concat(mapSoundAsset("ld32", 0.4));
    }

    TitleState.prototype.resize = function( width, height ) {
        this.cx = width / 2;
        this.cy = height / 2;
    }

    TitleState.prototype.onStart = function(game) {
        var self = this;

        this.keyHandler = function( e ) {
            if( e.keyCode == 13 ) {
                game.operations.push(function() {
                    game.setState( self.nextState );
                });
            }
        }

        game.input.keyDownEvent.push(this.keyHandler);

        this.scene2d = new THREE.Scene();
        this.camera2d = new THREE.OrthographicCamera( 0, game.width, 0, game.height );
        this.camera2d.position.z = 10;
        game.renderer.setClearColor(0x2e2e2e, 1);
        game.renderer.autoClear = false;

        this.blindOverlay = new TQuad(game, {
            animations: [{
                frames: ['assets/gfx/blind1.png',
                    'assets/gfx/blind2.png',
                    'assets/gfx/blind3.png'],
                frameTime: 32,
            }]
        });

        setBlindOverlayOpacity(this.blindOverlay, 0.4);
        this.blindOverlay.mesh.position.x = game.width/2;
        this.blindOverlay.mesh.position.y = game.height/2;
        this.blindOverlay.mesh.position.z = 0;
        this.scene2d.add(this.blindOverlay.mesh);

        this.bgSprite    = new TQuad(game, {animations: [{frames: ['assets/gfx/title.png']}]});
        this.bgSprite.mesh.position.x = game.width/2;
        this.bgSprite.mesh.position.y = game.height/2;
        this.bgSprite.mesh.position.z = 1;

        //this.scene2d.add(this.textSprite);
        this.scene2d.add(this.bgSprite.mesh);

        var bl = this.blindOverlay;

        this.controllers.push(function( game, dt ) {
            bl.update(dt);
        });

        if (!game.musicStarted) {
            game.loader.get("audio/ld32").loop(true).play();
            game.musicStarted = true;
        }

    };


    TitleState.prototype.render = function( game ) {
        game.renderer.clear();
        game.renderer.render(this.scene2d, this.camera2d);
    }

    TitleState.prototype.onStop = function() {
        game.input.keyDownEvent.remove(this.keyHandler);
    }

    return TitleState;
}());
