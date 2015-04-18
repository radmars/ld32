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

        // Velocity is just a fancy way to make the position shift around...
        // it's not really moving the player in the world cause we're going to
        // cheat for all of our collision detection things.
        this.velocity = new THREE.Vector2();
        this.maxVelocity = 150;
        this.accel = 3;
    }

    Player.prototype.addTo = function(container) {
        container.add(this.container);
    }

    Player.prototype.update = function(game, dt ) {
        var shouldRotate = 0;
        if(game.input.keys[37]) {
            this.velocity.x -= this.accel;
            shouldRotate = 1;
        }

        if(game.input.keys[39]) {
            this.velocity.x += this.accel;
            shouldRotate = 1;
        }

        if(game.input.keys[38]) {
            this.velocity.y += this.accel;
        }

        if(game.input.keys[40]) {
            this.velocity.y -= this.accel;
        }

        if(this.velocity.length() > this.maxVelocity) {
            this.velocity.normalize();
            this.velocity.multiplyScalar(this.maxVelocity);
        }

        if(shouldRotate) {
            this.playerQuad.mesh.rotation.z = this.velocity.x / this.maxVelocity / 5;
        }

        this.container.position.x += this.velocity.x * dt / 1000;
        this.container.position.y -= this.velocity.y * dt / 1000;

    }

    return Player;
}());
