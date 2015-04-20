var Enemy = (function() {
    "use strict";
    function Enemy(game, player) {
        Car.call(this, game, {
            asset: 'assets/gfx/enemy1.png',
        });

        this.player = player;

        this.position.x = Math.random() * (game.width/3);
        this.position.y = player.position.y + game.height + 48;
        this.velocity.y = player.velocity.y - 2;
        this.maxY = player.maxY + 320 + Math.random()*50;
    }

    Enemy.prototype = Object.create(Car.prototype);

    Enemy.prototype.update = function(game, dt) {
        Car.prototype.update.call(this, game, dt);
        this.updateLazer(dt);

        if (this.hp <= 0) {
            return;
        }

        if (this.blindDir) {
            this.velocity.x += THREE.Math.clamp(this.blindDir, -5, 5);
        }
        else {
            this.runAI(dt);
        }

        this.velocity.y = THREE.Math.clamp(this.velocity.y, -this.maxY, this.maxY);
        this.velocity.x = THREE.Math.clamp(this.velocity.x, -150, 150);
        if(this.dumb) {
            this.velocity.y = -250;
            this.velocity.x = 0;
        }

        this.rotation.z = this.velocity.x / 400 / 5;
        this.position.x += this.velocity.x * dt / 1000;
        this.position.y += this.velocity.y * dt / 1000;
    }

    Enemy.prototype.runAI = function(dt) {
        var player = this.player;
        var enemyPosition = this.position;
        var playerPosition = player.position;
        var distance = enemyPosition.clone().sub(playerPosition);

        var nextToDistance = 90;
        var onLeft = distance.x > 0;
        if(onLeft) {
            distance.x -= nextToDistance;
        }
        else {
            distance.x += nextToDistance;
        }

        var faster = this.velocity.y < player.velocity.y;
        var ahead = enemyPosition.y < playerPosition.y;

        if(faster) {
            if(ahead) {
                // slow down??!?!?
                if(distance.y < 150) {
                    this.velocity.y += 5;
                }
                else {
                    // try to match their velocity..
                }
            }
            else {
                // within closing distance slow down, otherwise speed up...
                if(distance.y < 150) {
                    this.velocity.y += .1;
                }
                else {
                    this.velocity.y -= 8;
                }
            }
        }
        else {
            if(ahead) {
                // maintain velocity... ?
                this.velocity.y -= 5;
            }
            else {
                // speed up... until we get to closing distance..
                this.velocity.y -= 13 + Math.random();
            }
        }

        this.velocity.x += THREE.Math.clamp(-distance.x, -5, 5);
        this.velocity.x = THREE.Math.clamp(this.velocity.x, -50, 50);

        if(distance.y < 30) {
            this.shootLazer(onLeft);
        }
    }

    Enemy.prototype.blind = function(blindDir) {
        this.blindDir = blindDir;
    }

    return Enemy;
}());
