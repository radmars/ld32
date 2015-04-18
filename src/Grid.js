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
        container.add(this.centered);
        this.centered.add(this.container);

        this.centered.position.x = game.width / 2 - (this.numTiles - 1)* this.size / 2;
        this.centered.position.y = game.height / 2 - (this.numTiles - 1)* this.size / 2;

        this.expandThreshold = 0.25;
        this.contractThreshold = 0.25;

        this.rows = [];

        // initial row
        var initialOffset = (this.numTiles - 1)* this.size;
        this.makeInitialRow(initialOffset);

        for (var j = 1; j < this.numTiles; j++) {
            var yOffset = initialOffset - j * this.size;
            this.makeRow( this.rows[j-1], yOffset );
        }
        window.grid = this;
    }

    Grid.prototype.makeInitialRow = function(initialOffset)
    {
        var row = new GridRow(initialOffset);
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

        // Then shift everything down
        var yOffset = this.size;
        this.rows.forEach(function(row) {
            row.shiftY(yOffset);
        });

        // And fill in the gap
        this.makeRow(lastRow, 0);
    }

    Grid.prototype.addRow = function(row) {
        this.rows.push(row);
        this.container.add(row.container);
    }

    Grid.prototype.makeRow = function(previousRow, yPos) {
        var row = new GridRow(yPos);
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

    Grid.prototype.update = function(game, dt) {
        var speed = 0.1;
        var step = speed * dt;
        this.container.position.y += step;

        // TODO: if the step is > size, then we will have problems.
        if( step > this.size ) {
            throw "Uh this is 'unimplemented'...";
        }

        if(this.container.position.y > this.size ) {
            this.container.position.y -= this.size;
            this.rotate();
        }
    }


    return Grid;
}());
