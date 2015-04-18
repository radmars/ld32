var TQuad = (function() {
    "use strict";

    // magic number makes the game look good.
    var scale = 2;

    // Would be cool to dispose of these via ref count or something...
    var materialCache = {};
    function getMaterial(file) {
        if( ! materialCache[file] ) {
            materialCache[file] = new THREE.MeshBasicMaterial({
                map: game.loader.get( file ),
                color: 0xffffff,
                transparent: true,
                // In order to support flipping need two sides...
                side: THREE.DoubleSide
            });
        }
        return materialCache[file];
    }

    // A textured quad.
    // ex:
    // new TQuad( game, {
    //     animations: [{
    //          frames: [1.png, 2.png]
    //          frameTime: 100,
    //          name: 'awesome'
    //     }],
    //     current: 'awesome'
    // })
    //
    // defaults to first key animation without current.
    // assumes every frame is same size.
    function TQuad(game, options) {
        var self = this;
        self.animations =  {}
        options.animations.forEach(function( animation ) {
            self.animations[animation.name] = {
                materials: animation.frames.map(getMaterial),
                frameTime: animation.frameTime,
            }
        });
        var animationName = options.current || Object.keys( self.animations )[0]

        // Take a sample image and figure out how big it is.
        var sample = this.animations[animationName].materials[0];
        self.width = sample.map.image.width;
        self.height = sample.map.image.height;

        self.timer = 0;
        self.frameTime = options.frameTime;
        self.currentFrame = 0;

        self.mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1, 1 ), sample );
        self.setAnimation( animationName  );
        self.mesh.scale.set(
            self.width * scale,
            -self.height * scale,
            1
        );
    }

    TQuad.prototype.currentAnimationData = function() {
        return this.animations[this.currentAnimation];
    }

    // static method to generate list of file names.
    TQuad.enumerate = function( count, name ) {
        var assets = [];
        for(var i = 1; i <= count; i ++ ) {
            assets.push('assets/textures/' + name + '/' + i + '.png');
        }
        return assets;
    }

    TQuad.prototype.update = function( dt ) {
        this.timer += dt;
        var current = this.currentAnimationData();
        var materials = current.materials;
        if( this.timer > current.frameTime ) {
            this.timer = 0;
            this.currentFrame++;
            this.mesh.material = materials[this.currentFrame % materials.length];
            if(this.currentFrame >= materials.length ) {
                this.currentFrame = this.currentFrame % materials.length;
                if(this.onFinish) {
                    var cb = this.onFinish;
                    this.onFinish = null;
                    cb();
                }
            }
        }
    }

    TQuad.prototype.setAnimation = function( a, f, frame ) {
        this.onFinish = f;
        this.currentAnimation = a;
        this.setFrame(frame || 0);
    }

    TQuad.prototype.setFrame = function( f ) {
        this.timer = 0;
        this.currentFrame = f;
        this.mesh.material = this.currentAnimationData().materials[this.currentFrame];
    }

    TQuad.prototype.dispose = function() {
        this.mesh.geometry.dispose();
        // TODO: Dispose materials when they're no longer in use?
    }

    return TQuad;
}());
