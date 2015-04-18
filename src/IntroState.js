var IntroState = (function(){
    "use strict";

    var pixelize = function(t) {
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.LinearMipMapLinearFilter;
    };

    function IntroState( nextState ) {
        State.call(this);
        this.glassesFiles = [
            { name: 'assets/intro/glasses1.png', type: 'img', callback: pixelize },
            { name: 'assets/intro/glasses2.png', type: 'img', callback: pixelize },
            { name: 'assets/intro/glasses3.png', type: 'img', callback: pixelize },
            { name: 'assets/intro/glasses4.png', type: 'img', callback: pixelize }
        ];

        this.textFiles = [
            { name: 'assets/intro/intro_mars.png', type: 'img', callback: pixelize },
            { name: 'assets/intro/intro_radmars1.png', type: 'img', callback: pixelize },
            { name: 'assets/intro/intro_radmars2.png', type: 'img', callback: pixelize }
        ];

        this.atmoFiles = [
            { name: 'assets/intro/mars_atmosphere1.png', type: 'img', callback: pixelize },
            { name: 'assets/intro/mars_atmosphere2.png', type: 'img', callback: pixelize },
        ]

        this.bgAssetName = "assets/intro/bg.png";

        this.marsFiles = [
            { name: 'assets/intro/mars1.png', type: 'img', callback: pixelize },
        ];

        this.nextState = nextState;

        this.counter = 0;
    }

    IntroState.prototype = Object.create(State.prototype);

    IntroState.prototype.getAssets = function() {
        // Bring it all together!
        return [].concat(
            this.nextState.getAssets(),
            this.glassesFiles,
            this.textFiles,
            this.marsFiles,
            this.atmoFiles,
            { name: this.bgAssetName, type: 'img' }
        ).concat(mapSoundAsset("radmarslogo"));
    }

    IntroState.prototype.onBeat = function() {
        // BEAT IT, JUST BEAT IT
        console.log("BEAT IT BABY")
    }

    IntroState.prototype.resize = function( width, height ) {
        this.cx = width / 2;
        this.cy = height / 2;
    }

    IntroState.prototype.onStart = function(game) {
        var self = this;

        game.loader.get("audio/radmarslogo").play();
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

        this.bgSprite    = new TQuad(game, {animations: [{frames: ['assets/intro/bg.png']}]});
        this.planet      = new TQuad(game, {animations: [{frames: ['assets/intro/mars1.png']}]});
        this.atmosphere1 = new TQuad(game, {animations: [{frames: ['assets/intro/mars_atmosphere1.png']}]});
        this.atmosphere2 = new TQuad(game, {animations: [{frames: ['assets/intro/mars_atmosphere2.png']}]});
        this.marsText    = new TQuad(game, {animations: [{frames: ['assets/intro/intro_mars.png', 'assets/intro/intro_radmars1.png', 'assets/intro/intro_radmars2.png' ]}]});

        this.bgSprite.mesh.position.z    = -1;
        this.atmosphere1.mesh.position.z = 2;
        this.atmosphere2.mesh.position.z = 2;

        this.worldObject = new THREE.Object3D();
        this.worldObject.add(this.bgSprite.mesh);
        this.worldObject.add(this.atmosphere1.mesh);
        this.worldObject.add(this.atmosphere2.mesh);
        this.worldObject.add(this.planet.mesh);
        this.worldObject.add(this.marsText.mesh);
        this.worldObject.position.set( game.width / 2, game.height / 2, 0 );
        this.scene2d.add(this.worldObject);

        this.textMaterials = this.textFiles.map(function( file ) {
            return new THREE.SpriteMaterial({
                map: game.loader.get( file.name ),
            });
        });

        this.glasses = new TQuad(game, {
            animations: [
                {
                    frames: [
                        'assets/intro/glasses1.png',
                        'assets/intro/glasses2.png',
                        'assets/intro/glasses3.png',
                        'assets/intro/glasses4.png',
                    ],
                }
            ],
        });
        this.glasses.mesh.position.z = 3;

        this.textSprite = new THREE.Sprite( this.textMaterials[ 0 ] );
        this.textSprite.scale.set(
            this.textMaterials[0].map.image.width,
            -this.textMaterials[0].map.image.height,
            1
        );

        var bgMaterial = new THREE.SpriteMaterial({
            map: game.loader.get( this.bgAssetName ),
        });

        //this.scene2d.add(this.textSprite);
        this.scene2d.add(this.glasses.mesh);

        this.controllers.push(function( game, dt ) {
            self.counter += dt;

            if( self.counter < 2000){
                self.marsText.setFrame(0)
                self.marsText.mesh.scale.set( 108, -28, 1 );
                self.marsText.mesh.position.set(1, 140, 0);
            } else if( self.counter < 2050) {
                self.marsText.mesh.scale.set( 192, -28, 1 );
                self.marsText.mesh.position.set(5, 140, 0);
                self.marsText.setFrame(1)
            }
            else if( self.counter < 2600)
                self.marsText.setFrame(2)
            else if( self.counter < 2650)
                self.marsText.setFrame(1)
            else if( self.counter < 2700)
                self.marsText.setFrame(2)
            else if( self.counter < 2750)
                self.marsText.setFrame(1)
            else if( self.counter < 2800)
                self.marsText.setFrame(2)
            else if( self.counter < 2850)
                self.marsText.setFrame(1)
            else
                self.marsText.setFrame(2)

            if( self.counter < 2000)
                self.glasses.mesh.position.y = ( self.cy ) * (self.counter/2000.0);
            else if( self.counter < 2150 )
                self.glasses.setFrame(1);
            else if( self.counter < 2300 )
                self.glasses.setFrame(2);
            else if( self.counter < 2550 )
                self.glasses.setFrame(3);
            else
                self.glasses.setFrame(0);

            self.glasses.mesh.position.x = self.cx;

            self.textSprite.position.set(
                self.cx,
                self.cy - 28 / 2 + 80, 0
            );

            if(self.counter > 6400){
                game.operations.push(function() {
                    game.setState( self.nextState );
                });
            }
        });
    };


    IntroState.prototype.render = function( game ) {
        game.renderer.clear();
        game.renderer.render(this.scene2d, this.camera2d);
    }

    IntroState.prototype.onStop = function() {
        game.input.keyDownEvent.remove(this.keyHandler);
        game.loader.get("audio/radmarslogo").stop();
    }

    return IntroState;
}());
