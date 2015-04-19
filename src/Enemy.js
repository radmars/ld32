var Enemy = (function() {
    "use strict";
    function Enemy(game, player) {
        this.container = new THREE.Object3D();

        this.enemyQuad = new TQuad(game, {
            animations: [{
                frames: ['assets/gfx/enemy1.png'],
                frameTime: 100,
                name: 'default',
            }],
            current: 'default',
        });

        this.lazerQuad = new TQuad(game, {
            animations: [{
                frames: ['assets/gfx/lazer.png'],
                frameTime: 100,
            }],
        });

        this.container.add(this.enemyQuad.mesh);
        this.player = player;

        this.velocity = new THREE.Vector2();
        this.accel = 5;
        this.container.position.x = Math.random() * game.width;
        this.container.position.y = game.height;
        this.maxY = player.maxY + 50;
        this.shootCooldown = 0;
    }

    Enemy.prototype.addTo = function(container) {
        container.add(this.container);
        this.globalContainer = container;
    }

    Enemy.prototype.update = function(game, dt ) {
        var shouldRotate = 0;
        var player = this.player;
        var enemyPosition = this.container.position;
        var playerPosition = player.container.position;
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
                    this.velocity.y -= 5;
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
                this.velocity.y -= 5;
            }
        }

        this.velocity.y = THREE.Math.clamp(this.velocity.y, -this.maxY, this.maxY);
        this.velocity.x += THREE.Math.clamp(-distance.x, -5, 5);
        this.velocity.x = THREE.Math.clamp(this.velocity.x, -50, 50);

        this.enemyQuad.mesh.rotation.z = this.velocity.x / 400 / 5;
        this.container.position.x += this.velocity.x * dt / 1000;
        this.container.position.y += this.velocity.y * dt / 1000;

        if(this.shootCooldown <= 0 && distance.y < 30) {
            this.shootCooldown = 1000;
            this.lazerQuad.mesh.position.x = enemyPosition.x;
            this.lazerQuad.mesh.position.y = enemyPosition.y;
            this.globalContainer.add(this.lazerQuad.mesh);
            this.shotActive = {
                x: onLeft ? -950 : 950,
                y: this.velocity.y,
            };
        }
        this.shootCooldown -= dt;

        if(this.shotActive) {
            this.lazerQuad.mesh.position.x += this.shotActive.x * dt / 1000;
            this.lazerQuad.mesh.position.y += this.shotActive.y * dt / 1000;
            if(this.lazerQuad.mesh.position.x < 0 || this.lazerQuad.mesh.position.x > game.width){
                this.shotActive = null;
                this.container.remove(this.lazerQuad.mesh);
            }
        }
    }

    return Enemy;
}());
