var GridRow = (function() {
    "use strict";
    function GridRow(yOffset) {
        this.container = new THREE.Object3D();
        this.container.position.y = yOffset;
        this.tiles = [];
    }

    GridRow.prototype.shiftY = function(shift) {
        this.container.position.y += shift;
    }

    GridRow.prototype.makeTile = function(game, xIndex, size, type) {
        var pos = new THREE.Vector2();
        pos.x = xIndex * size;
        var tile = new GridTile(game, type, pos);
        this.container.add(tile.quad.mesh);
        this.tiles.push(tile);
        return tile;
    }

    GridRow.prototype.dispose = function() {
        this.tiles.forEach(function(tile) {
            tile.dispose();
        });
    }
    return GridRow;
}());

var GridTile = (function() {
    "use strict";

    function GridTile(game, type, position) {
        var randomness = Math.round(Math.random()) + 1;
        var png = type + randomness;
        this.type = type;

        this.quad = new TQuad(game, {
            animations: [
                {
                    frames: [ 'assets/gfx/' + png + '.png' ]
                }
            ]
        });

        this.quad.mesh.position.x = position.x;
        this.quad.mesh.position.y = 0;
        this.quad.mesh.position.z = -1;
    }

    GridTile.prototype.dispose = function() {
        this.quad.dispose();
    }

    return GridTile;
}());

var Grid = (function() {
    "use strict";

    function Grid(game, numTiles, container) {
        this.size = 96;
        this.numTiles = numTiles;
        this.game = game;

        this.container = new THREE.Object3D();
        this.centered = new THREE.Object3D();
        container.add(this.container);
        this.offset = (numTiles -2) * this.size;
        this.container.position.y += this.offset;


        this.expandThreshold = 0.35;
        this.contractThreshold = 0.15;
        this.roadblockThreshold = 0.05;
        this.counter = 0;
        this.travelled = 0;

        this.rows = [];
        this.roadblocks = [];

        // initial row
        this.makeInitialRow();

        for (var j = 1; j < this.numTiles ; j++) {
            this.makeRow( this.rows[j-1]);
        }
        window.grid = this;

        //this.makeTestRoadblock(-1000);
        //this.makeTestRoadblock(-2000);
    }

    Grid.prototype.makeInitialRow = function()
    {
        var row = new GridRow(0);
        this.addRow(row);

        // set up the edge
        row.makeTile(this.game, 0, this.size, "not-road");
        row.makeTile(this.game, 1, this.size, "road-left");

        // fill in the middle
        for (var i = 2; i < this.numTiles-2; i++) {
            row.makeTile(this.game, i, this.size, "road");
        }

        // set up other edge
        row.makeTile(this.game, this.numTiles-2, this.size, "road-right");
        row.makeTile(this.game, this.numTiles-1, this.size, "not-road");
    }

    Grid.prototype.rotate = function()
    {
        // First, lets get rid of the one we're rotating out.
        var firstRow = this.rows.shift();
        this.container.remove(firstRow.container);
        firstRow.dispose();

        // Then get the last row to build the new row...
        var lastRow = this.rows[this.rows.length - 1];

        // And fill in the gap
        this.makeRow(lastRow);
    }

    Grid.prototype.addRow = function(row) {
        this.counter ++;
        this.rows.push(row);
        this.container.add(row.container);
    }

    Grid.prototype.makeRow = function(previousRow) {
        var row = new GridRow(0 - this.counter * this.size);
        var buffer = 2;
        var length = previousRow.tiles.length;
        var left = 0;
        var right = length - 1;
        var newLeft = 0;
        var newRight = length - 1;

        // Add or the roads container...
        this.addRow(row);

        // find left & right edges
        for (var i = 0; i < length; i++) {
            if (previousRow.tiles[i].type.indexOf("left") != -1) {
                left = i;
                if (previousRow.tiles[i].type.indexOf("in") != -1) {
                    left++;
                }
            }
            else if (previousRow.tiles[i].type.indexOf("right") != -1) {
                right = i;
                if (previousRow.tiles[i].type.indexOf("in") != -1) {
                    right--;
                }
            }
        }

        // should we expand left, stay straight or go in?
        var leftMove = Math.random();
        // suffix will be in or out depending on contract/expand
        var leftSuffix = "";

        // expand (left goes left)
        if (leftMove < this.expandThreshold && left != 0) {
            newLeft = left - 1;
            leftSuffix = "-out";
        }
        // contract (left goes right)
        else if (leftMove > 1.0 - this.contractThreshold && left < right-buffer) {
            newLeft = left;
            leftSuffix = "-in";
        }
        else {
            newLeft = left;
        }

        var rightMove = Math.random();
        var rightSuffix = "";

        if (rightMove < this.expandThreshold && right != this.numTiles-1) {
            newRight = right + 1;
            rightSuffix = "-out";
        }
        // contract (right goes left)
        else if (rightMove > 1.0 - this.contractThreshold && right > left+buffer) {
            newRight = right;
            rightSuffix = "-in";
        }
        else {
            newRight = right;
        }

        for (var j = 0; j < length; j++) {
            if (j < newLeft) {
                row.makeTile(this.game, j, this.size, "not-road");
            }
            else if (j == newLeft) {
                row.makeTile(this.game, j, this.size, "road-left" + leftSuffix);
            }
            else if (j < newRight) {
                row.makeTile(this.game, j, this.size, "road");
            }
            else if (j == newRight) {
                row.makeTile(this.game, j, this.size, "road-right" + rightSuffix);
            }
            else {
                row.makeTile(this.game, j, this.size, "not-road");
            }
        }

        return row;
    }

    Grid.prototype.update = function(game, dt, step) {
        this.travelled += step;

        while(this.travelled > this.size ) {
            this.travelled -= this.size;
            this.rotate();

            if (Math.random() < this.roadblockThreshold) {
                this.makeRoadblock();
            }
        }

        if (this.roadblocks.length > 0 && this.roadblocks[0].mesh.position.y > this.rows[0].container.position.y + 1000) {
            var block = this.roadblocks.shift();
            this.container.remove(block.mesh);
        }
    }

    Grid.prototype.makeRoadblock = function() {
        var block = new TQuad(game, {
            animations: [{
                frames: ['assets/gfx/blockage1.png'],
                frameTime: 100,
            }]
        });

        var lastRow = this.rows[this.rows.length-1];
        var candidates = [];
        for(var i = 0; i < lastRow.tiles.length; i++) {
            if (lastRow.tiles[i].type == "road") {
                candidates.push(i);
            }
        }

        if (candidates.length == 0) {
            // wat
            return;
        }

        var tile = Math.round(Math.random() * (candidates.length-1)) + candidates[0];
        var xOffset = Math.round(Math.random() * (this.size-1));
        var yOffset = Math.round(Math.random() * (this.size-1));

        block.mesh.position.x = lastRow.tiles[tile].quad.mesh.position.x + xOffset;
        block.mesh.position.y = yOffset + lastRow.container.position.y;
        block.mesh.position.z = lastRow.tiles[tile].quad.mesh.position.z + .5;

        block.travelled = 0;
        block.row = lastRow;
        this.roadblocks.push(block);
        this.container.add(block.mesh);
    }

    Grid.prototype.makeTestRoadblock = function(y) {
        var block = new TQuad(game, {
            animations: [{
                frames: ['assets/gfx/blockage1.png'],
                frameTime: 100,
            }]
        });

        block.mesh.position.x = 400;
        block.mesh.position.y = y;
        block.mesh.position.z = 1.5;

        this.roadblocks.push(block);
        this.container.add(block.mesh);
    }

    Grid.prototype.removeRoadblock = function(block) {
        var i = this.roadblocks.lastIndexOf(block);
        this.container.remove(block.mesh);
        this.roadblocks.splice(i, 1);
    }

    return Grid;
}());
