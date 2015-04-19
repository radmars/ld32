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

        this.container.add(this.quad.mesh);

        this.shootCooldown = 0;
        this.velocity = new THREE.Vector2();
        this.position = this.container.position;
        this.rotation = this.quad.mesh.rotation;
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

    Car.prototype.updateLazer = function(dt) {
        if(this.shootCooldown > 0){
            this.shootCooldown -= dt;
        }

        if(this.shotActive) {
            this.lazerQuad.mesh.position.x += this.shotActive.x * dt / 1000;
            this.lazerQuad.mesh.position.y += this.shotActive.y * dt / 1000;
            if(this.lazerQuad.mesh.position.x < 0 || this.lazerQuad.mesh.position.x > game.width){
                this.shotActive = null;
                this.container.remove(this.lazerQuad.mesh);
            }
        }
    }

    Car.prototype.addTo = function(container) {
        container.add(this.container);
        this.globalContainer = container;
    }


    return Car;
}());
