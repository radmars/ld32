var Particle = (function() {
    "use strict";

    function Particle(game, options) {
        var asset    = options.asset;
        var frames   = options.frames;
        var rotation = options.rotation || 0;
        var life =  options.life || 1000;
        var position = options.position;
        var offset   = options.offset || { x: 0, y: 0 };
        var velX = options.velX || 0;
        var velY = options.velY || 0;

        this.rotateSpeed = options.rotateSpeed || 0;


        this.quad = new TQuad(game, {
            animations: [
                {
                    frames: TQuad.enumerate( frames, asset ),
                    frameTime: 100
                },
            ],
        });

        this.rotation = rotation;
        offset = rotateV( new THREE.Vector3( offset.x, offset.y ), this.rotation );

        this.vel = new THREE.Vector3( velX, velY, 0);
        this.life = life;
        this.alive = true;
        this.quad.mesh.rotation.z = this.rotation;
        this.quad.mesh.position.x = position.x + offset.x;
        this.quad.mesh.position.y = position.y + offset.y;
        this.quad.mesh.position.z = 4;

        //this.cb = this.update.bind(this);
        //game.state.controllers.push(this.cb);
    }

    Particle.prototype.update = function(game, dt) {
        this.life -= dt;
        this.quad.update(dt);
        var pos = this.quad.mesh.position;
        pos.x += this.vel.x * dt/1000;
        pos.y += this.vel.y * dt/1000;

        this.quad.mesh.rotation.z += this.rotateSpeed*dt/1000;

        if( this.life <  0) {
            if(this.alive){
                //console.log("removing!");
                this.alive = false;
                //game.state.controllers.remove(this.cb);
            }
        }
    };

    return Particle;
}());
