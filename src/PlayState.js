var PlayState = (function() {
    "use strict";

    var pixelize = function(t) {
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.LinearMipMapLinearFilter;
    };

    function PlayState() {
        State.call(this);
        this.assets = [
            { name: 'assets/gfx/trail/1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/trail/2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/trail/3.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/trail/4.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/explode/1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/explode/2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/explode/3.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/explode/4.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/explode/5.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/enemy1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/lazer.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/player.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/blockage1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/not-road1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/not-road2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-left1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-left2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-left-in1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-left-in2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-left-out1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-left-out2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-right1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-right2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-right-in1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-right-in2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-right-out1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/road-right-out2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/blind1.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/blind2.png', type: 'img', callback: pixelize },
            { name: 'assets/gfx/blind3.png', type: 'img', callback: pixelize },
        ].concat(mapSoundAsset("playeraccel", 0.0))
            .concat(mapSoundAsset("playerdecel", 0.0))
            .concat(mapSoundAsset("playeridle", 0.0))
            .concat(mapSoundAsset("enemyaccel", 0.5))
            .concat(mapSoundAsset("enemydecel", 0.5))
            .concat(mapSoundAsset("enemyidle", 0.5))
            .concat(mapSoundAsset("playerlaser"))
            .concat(mapSoundAsset("enemylaser"))
            .concat(mapSoundAsset("hit", 0.1))
            .concat(mapSoundAsset("hp", 0.2))
            .concat(mapSoundAsset("explosion", 0.2))
            .concat(mapSoundAsset("ld32", 0.65));
    };

    PlayState.prototype = Object.create(State.prototype);

    PlayState.prototype.getAssets = function() {
        return this.assets;
    };

    PlayState.prototype.onStart = function(game) {
        var self = this;

        this.scene2d = new THREE.Scene();
        this.camera2d = new THREE.OrthographicCamera( 0, game.width, 0, game.height );
        this.camera2d.position.z = 10;
        this.font = new TextRenderer.Font({
            font: "monospace",
            size: 32,
            fgColor: 'white',
        });
        this.courseTranslation = new THREE.Object3D();
        this.scene2d.add(this.courseTranslation);

        this.player = new Player(game);
        this.player.addTo(this.courseTranslation);
        this.enemies = [];
        this.enemyTimer = 3000;

        this.grid = new Grid(game, 9, this.courseTranslation);

        game.renderer.setClearColor(0x000000, 1);
        game.renderer.autoClear = false;

        if (!game.songStarted) {
            //game.loader.get("audio/ld31").loop(true).play();
            game.songStarted = true;
        }

        this.blindOverlay = new TQuad(game, {
            animations: [{
                frames: ['assets/gfx/blind1.png',
                        'assets/gfx/blind2.png',
                        'assets/gfx/blind3.png'],
                frameTime: 32,
            }]
        });

        setBlindOverlayOpacity(this.blindOverlay, 0.0);
        this.blindOverlay.mesh.position.x = game.width/2;
        this.blindOverlay.mesh.position.y = game.height/2;
        this.blindOverlay.mesh.position.z = 3;
        this.scene2d.add(this.blindOverlay.mesh);

        this.bg = new TQuad(game, {
            animations: [{
                frames: ['assets/intro/bg.png'],
                frameTime: 32,
            }]
        });
        this.bg.mesh.position.x = game.width/2;
        this.bg.mesh.position.y = game.height/2;
        this.bg.mesh.position.z = -5;
        this.spaceTranslation = new THREE.Object3D();
        this.spaceTranslation.add(this.bg.mesh);
        this.scene2d.add(this.spaceTranslation);

        // this doesn't work :(
        /*
        this.composer = new THREE.EffectComposer( game.renderer );
        this.composer.addPass( new THREE.RenderPass( this.scene2d, this.camera2d ) );

        var effect = new THREE.BloomPass( 4 );
        effect.renderToScreen = true;
        this.composer.addPass( effect );
        */
    };

    function setBlindOverlayOpacity(overlay, opacity) {
        overlay.currentAnimationData().materials.forEach(function(mat) {
            mat.opacity = opacity;
        });
    }

    PlayState.prototype.calculateScore = function() {
        return Math.round(this.courseTranslation.position.y / 10);
    }

    PlayState.prototype.updateScore = function(dt) {
        var score = this.calculateScore();
        // attach properties like a jerk
        if( ( !this.scoreObject ) || (this.scoreObject && this.scoreObject.score != score ) ) {
            if(this.scoreObject) {
                this.scene2d.remove(this.scoreObject);
            }
            this.scoreObject = TextRenderer.render(this.font, "Score: " + score );
            this.scoreObject.score = score;
            this.scoreObject.position.x = 0; // this.cx*2;
            this.scoreObject.position.y = 0; // this.cy*2;
            this.scoreObject.position.z = 4;
            this.scene2d.add(this.scoreObject);
        }
        if( !this.speedo || this.speedo.speed != this.player.velocity.y ) {
            if(this.speedo){
                this.scene2d.remove(this.speedo);
            }
            var speed = this.player.velocity.y;
            this.speedo = TextRenderer.render(this.font, "Speed: " + speed + "/" + this.player.maxY);
            this.speedo.speed = speed;
            this.speedo.position.x = 0;
            this.speedo.position.y = 100;
            this.speedo.position.z = 4;
            this.scene2d.add(this.speedo);
        }
        if( !this.hpo || this.hpo.hp != this.player.hp ) {
            if(this.hpo){
                this.scene2d.remove(this.hpo);
            }
            var hp = this.player.hp;
            var hpDisplay = Math.round(hp * 10);
            this.hpo = TextRenderer.render(this.font, "HP: " + hpDisplay);
            this.hpo.hp = hp;
            this.hpo.position.x = 0;
            this.hpo.position.y = 50;
            this.hpo.position.z = 4;
            this.scene2d.add(this.hpo);
        }
    }

    PlayState.prototype.update = function(game, dt){
        State.prototype.update.call(this, game, dt);

        if (this.deathTimer && this.deathTimer <= 0) {
            game.setState(new PlayState());
        }

        var self = this;
        var step = this.player.velocity.y * dt / 1000;
        if (this.player.hp <= 0) {
            step = 0;
            if (!this.deathTimer) {
                this.deathTimer = 3000;
            }
            else {
                this.deathTimer -= dt;
            }
        }
        this.courseTranslation.position.y += step;
        this.spaceTranslation.position.y += step/20;
        if (!this.spaceCounter) {
            this.spaceCounter = 0;
        }
        this.spaceCounter += step/20;

        if (this.spaceCounter > game.height/2) {
            this.bg = new TQuad(game, {
                animations: [{
                    frames: ['assets/intro/bg.png'],
                    frameTime: 32,
                }]
            });
            this.bg.mesh.position.x = game.width/2;
            this.bg.mesh.position.y = game.height/2 - this.spaceTranslation.position.y;
            this.bg.mesh.position.z = -5;
            this.spaceTranslation.add(this.bg.mesh);
            this.spaceCounter = 0;
        }

        this.enemyTimer -= dt;
        if(this.enemyTimer <= 0 && this.enemies.length < 4) {
            this.enemyTimer = 150;
            // enemy spawn
            var enemy = new Enemy(game, this.player);
            console.log("enemy spawned at " + enemy.position.x + ", " +enemy.position.y);
            // NOTE: Useful debugging setting here
            // enemy.dumb = true;
            enemy.addTo(this.courseTranslation);
            this.enemies.push(enemy);
        }

        this.player.update(game, dt);
        this.enemies.forEach(function(e) {
            e.update(game, dt);
        });
        this.checkCollision();

        for (var i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].hp <= 0 && !this.enemies[i].explode) {
                this.enemies.splice(i, 1);
                i--;
            }
        }

        this.grid.update(game, dt, step);
        this.updateScore(dt);

        this.blindOverlay.update(dt);
        var opacity = this.blindOverlay.currentAnimationData().materials[0].opacity;
        if (opacity > 0.0) {
            setBlindOverlayOpacity(this.blindOverlay, opacity - dt / 2000);
        }
    }

    function checkObjectCollision(a, b, xSize, ySize, shift, aTranslation, bTranslation) {
        var dir = b.position.clone();
        if (bTranslation) {
            dir.x += bTranslation.x;
            dir.y += bTranslation.y;
        }

        var a2 = a.position.clone();

        if (aTranslation) {
            a2.x += aTranslation.x;
            a2.y += aTranslation.y;
        }

        dir.sub(a2);

        if( dir.x < xSize
            && dir.x > -xSize
            && dir.y < ySize
            && dir.y > -ySize
            ) {
            if (shift) {
                if (b.velocity) {
                    b.velocity.x = (dir.x > 0 ? 1 : -1) * 30;
                }
                if (a.velocity) {
                    a.velocity.x = (dir.x > 0 ? -1 : 1) * 50;
                }
                var xshift = (dir.x > 0 ? 1 : -1) * (xSize - Math.abs(dir.x)) / 2;
                b.position.x += xshift;
                //b.position.y -= offset.y / 2;
                a.position.x -= xshift;
                //a.position.y += offset.y / 2;
            }
            return true;
        }
        else {
            return false;
        }
    }

    PlayState.prototype.checkCollision = function() {
        var player = this.player;
        var enemies = this.enemies;
        var blind = this.blindOverlay;

        enemies.forEach(function(enemy) {
            // enemy + player
            if (checkObjectCollision(enemy, player, 58, 78, true)) {
                enemy.hit(0.2);
                player.hit(0.1);
            }

            // enemy + enemy
            enemies.forEach(function(other) {
                if(enemy != other) {
                    checkObjectCollision(enemy, other, 58, 78, true);
                }
            });

            // enemy lazer + player
            if (enemy.shotActive && checkObjectCollision(enemy.lazerQuad.mesh, player, 53, 46, false)) {
                console.log("enemy hit player");
                setBlindOverlayOpacity(blind, 1.0);
                enemy.removeLazer();
            }

            // player lazer + enemy
            if (player.shotActive && checkObjectCollision(player.lazerQuad.mesh, enemy, 53, 46, false)) {
                console.log("player hit enemy");
                enemy.blind(player.shotActive.x);
                player.removeLazer();
            }

            checkCollisionWithRoad(enemy);
        });

        grid.roadblocks.forEach(function(block) {
            var translation = new THREE.Vector2();
            translation.x = 0;
            translation.y = grid.offset;
            if (checkObjectCollision(player, block.mesh, 44, 45, true, null, translation)) {
                grid.removeRoadblock(block);
                player.hit(1);
            }

            enemies.forEach(function(enemy) {
                if (checkObjectCollision(enemy, block.mesh, 44, 45, true, null, translation)) {
                    grid.removeRoadblock(block);
                    enemy.hit(1);
                }
            });
        });

        checkCollisionWithRoad(player);
    }

    function checkCollisionWithRoad(car) {
        if (car.hp <= 0) {
            return;
        }

        grid.rows.forEach(function(row) {
            row.tiles.forEach(function(tile) {
                if (tile.type == "not-road") {
                    var translation = new THREE.Vector2();
                    translation.x = 0;
                    translation.y = grid.offset + row.container.position.y;

                    if (checkObjectCollision(car, tile.quad.mesh, 77, 87, false, null, translation)) {
                        car.kill();
                    }
                }
            });
        });
    }

    PlayState.prototype.resize = function(width, height) {
        this.cx = width / 2;
        this.cy = height / 2;
        this.camera2d.right = width;
        this.camera2d.bottom = height;
        this.camera2d.updateProjectionMatrix();
    };

    PlayState.prototype.onStop = function(game) {
        game.renderer.autoClear = true;
        this.enemies.forEach(function(enemy){
            if (enemy.curSound) {
                enemy.curSound.stop();
            }
        });
    };

    PlayState.prototype.render = function(game) {
        game.renderer.clear();
        //this.composer.render();
        game.renderer.render(this.scene2d, this.camera2d);
    };

    return PlayState;
}).call(this);
