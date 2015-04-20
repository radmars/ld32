var Player = (function() {
    "use strict";
    function Player(game) {
        Car.call(this, game, {
            asset: 'assets/gfx/player.png',
        });

        this.position.x = game.width/2;
        this.position.y = game.height/2;

        this.velocity = new THREE.Vector2(0, 0);
        this.maxY = 1100;
        this.minY = 200;
        this.Yaccel = 15;
        this.Xaccel = 60;
    }

    Player.prototype = Object.create(Car.prototype);

    Player.prototype.update = function(game, dt ) {
        console.log("pos diff is " + (this.position.y + this.globalContainer.position.y));

        Car.prototype.update.call(this, game, dt);
        if(game.input.keys[37]) {
            this.velocity.x -= this.Xaccel;
        }

        if(game.input.keys[39]) {
            this.velocity.x += this.Xaccel;
        }

        if(game.input.keys[38]) {
            this.velocity.y += this.Yaccel;
            if (this.position.y + this.globalContainer.position.y > 0) {
                this.position.y -= 1.2;
            }
        }

        if(game.input.keys[40]) {
            this.velocity.y -= this.Yaccel;
            if (this.position.y + this.globalContainer.position.y < game.height) {
                this.position.y += 3;
            }
        }

        // insert hokey garbage here.
        this.velocity.y = THREE.Math.clamp( this.velocity.y, this.minY, this.maxY);
        var maxX = this.velocity.y / 1.5;
        var maxX = 450;
        this.velocity.x = THREE.Math.clamp( this.velocity.x, -maxX, maxX);

        this.rotation.z = this.velocity.x / 400 / 5;

        this.position.x += this.velocity.x * dt / 1000;
        this.position.y -= this.velocity.y * dt / 1000;

        if(game.input.keys[88]) {
            this.shootLazer(true);
            // weird hack for laser velocity???
            if (this.shotActive) {
                this.shotActive.y = this.velocity.y * -1.0;
            }
        }

        if(game.input.keys[67]) {
            this.shootLazer(false);
            // bluuuuughghgh
            if (this.shotActive) {
                this.shotActive.y = this.velocity.y * -1.0;
            }
        }

        this.updateLazer(dt);
    }

    return Player;
}());
