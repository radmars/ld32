var Car = (function() {
    // new Car(game, {
    //  asset: 'assets/gfx/enemy1.png',
    // });
    function Car(game, args) {
        this.container = new THREE.Object3D();
        this.quad = new TQuad(game, {
            animations: [{
                frames: [args.asset],
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
        this.smokes = [];

        this.container.add(this.quad.mesh);
        this.smokeTimer = 0;

        this.shootCooldown = 0;
        this.velocity = new THREE.Vector2();
        this.position = this.container.position;
        this.rotation = this.quad.mesh.rotation;

        this.hp = 5;
    }

    Car.prototype.shootLazer = function(onLeft) {
        if(this.shootCooldown <= 0) {
            this.shootCooldown = 1000;
            this.lazerQuad.mesh.position.x = this.position.x;
            this.lazerQuad.mesh.position.y = this.position.y;
            this.globalContainer.add(this.lazerQuad.mesh);
            this.shotActive = {
                x: onLeft ? -950 : 950,
                y: this.velocity.y,
            };
        }
    }

    Car.prototype.update = function(game, dt) {
        this.smokes.forEach(function(s){ s.update(dt) });
        if (this.explode) {
            this.explode.update(dt);
        }

        if (this.hp <= 0) {
            return;
        }

        this.smokeTimer += dt;
        if(this.smokeTimer > 100) {
            this.smokeTimer = 0;
            var smoke = new TQuad(game, {
                animations: [{
                    frames: [
                        //'assets/gfx/trail/1.png',
                        //'assets/gfx/trail/2.png',
                        'assets/gfx/trail/3.png',
                        'assets/gfx/trail/4.png',
                    ],
                    frameTime: 100,
                    name: 'trail',
                }],
            });
            smoke.mesh.position.x = this.position.x;
            smoke.mesh.position.y = this.position.y+40;
            smoke.mesh.position.z = this.position.z - .5;

            var container = this.globalContainer;
            var list = this.smokes;
            list.push(smoke);
            container.add(smoke.mesh);
            smoke.setAnimation('trail', function() {
                container.remove(smoke.mesh);
                list.remove(smoke);
            });
        }
    }

    Car.prototype.updateLazer = function(dt) {
        if(this.shootCooldown > 0){
            this.shootCooldown -= dt;
        }

        if(this.shotActive) {
            this.lazerQuad.mesh.position.x += this.shotActive.x * dt / 1000;
            this.lazerQuad.mesh.position.y += this.shotActive.y * dt / 1000;
            if(this.lazerQuad.mesh.position.x < 0 || this.lazerQuad.mesh.position.x > game.width){
                this.removeLazer();
            }
        }
    }

    Car.prototype.removeLazer = function() {
        this.shotActive = null;
        this.globalContainer.remove(this.lazerQuad.mesh);
    }

    Car.prototype.addTo = function(container) {
        container.add(this.container);
        this.globalContainer = container;
    }

    Car.prototype.hit = function(damage) {
        if (this.hp <= 0) {
            return;
        }

        this.hp -= damage;

        if (this.hp <= 0) {
            this.kill(true);
        }
        else {
            game.loader.get("audio/hit").play();
        }
    }

    Car.prototype.kill = function(force) {
        if (!force && this.hp <= 0) {
            return;
        }

        this.hp = -1;
        game.loader.get("audio/explosion").play();
        this.container.remove(this.quad.mesh);
        var explode = new TQuad(game, {
            animations: [{
                frames: [
                    'assets/gfx/explode/1.png',
                    'assets/gfx/explode/2.png',
                    'assets/gfx/explode/3.png',
                    'assets/gfx/explode/4.png',
                    'assets/gfx/explode/5.png',
                ],
                frameTime: 100,
                name: 'trail',
            }],
        });
        explode.mesh.position.x = this.position.x;
        explode.mesh.position.y = this.position.y;
        explode.mesh.position.z = this.position.z - .5;

        var container = this.globalContainer;
        container.add(explode.mesh);
        this.explode = explode;
        explode.setAnimation('trail', function() {
            this.explode = null;
            container.remove(explode.mesh);
        });
    }

    return Car;
}());
