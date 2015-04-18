var Player = (function() {
    "use strict";
    function Player(game) {
        this.container = new THREE.Object3D();

        this.playerQuad = new TQuad(game, {
            animations: [{
                frames: ['assets/gfx/player.png'],
                frameTime: 100,
                name: 'default',
            }],
            current: 'default',
        });
        this.container.add(this.playerQuad.mesh);
        this.container.position.x = game.width/2;
        this.container.position.y = game.height/2;

        this.velocity = new THREE.Vector2(0, 0);
        this.maxY = 800;
        this.accel = 5;
    }

    Player.prototype.addTo = function(container) {
        container.add(this.container);
    }

    Player.prototype.update = function(game, dt ) {
        if(game.input.keys[37]) {
            this.velocity.x -= this.accel;
        }

        if(game.input.keys[39]) {
            this.velocity.x += this.accel;
        }

        if(game.input.keys[38]) {
            this.velocity.y += this.accel;
        }

        if(game.input.keys[40]) {
            this.velocity.y -= this.accel;
        }

        // insert hokey garbage here.
        this.velocity.y = THREE.Math.clamp( this.velocity.y, 0, this.maxY);
        var maxX = this.velocity.y / 2;
        this.velocity.x = THREE.Math.clamp( this.velocity.x, -maxX, maxX);

        this.playerQuad.mesh.rotation.z = this.velocity.x / 400 / 5;

        this.container.position.x += this.velocity.x * dt / 1000;
        this.container.position.y -= this.velocity.y * dt / 1000;

    }

    return Player;
}());
