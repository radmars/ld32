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
        this.quad.mesh.position.y = position.y;
    }

    return GridTile;
}());

var Grid = (function() {
    "use strict";

    function Grid(game, numTiles, container) {
        this.size = 96;
        this.numTiles = numTiles;
        this.game = game;
        this.container = container;

        this.expandThreshold = 0.25;
        this.contractThreshold = 0.25;

        var tiles = [];

        // initial row
        var initialYPos = 450;
        var row = [];
        row.push(this.makeTile(0, initialYPos, "not-road"));
        row.push(this.makeTile(1, initialYPos, "road-left"));
        for (var i = 2; i < this.numTiles-2; i++) {
            row.push(this.makeTile(i, initialYPos, "road"));
        }
        row.push(this.makeTile(this.numTiles-2, initialYPos, "road-right"));
        row.push(this.makeTile(this.numTiles-1, initialYPos, "not-road"));

        tiles.push(row);

        for (var j = 1; j < this.numTiles; j++) {
            tiles.push(this.addRow(tiles[j-1], tiles[j-1][0].quad.mesh.position.y - this.size));
        }
    }

    Grid.prototype.addRow = function(previousRow, yPos) {
        var row = [];
        var buffer = 2;
        var length = previousRow.length;
        var left = 0;
        var right = length - 1;
        var newLeft = 0;
        var newRight = length - 1;

        // find left & right edges
        for (var i = 0; i < length; i++) {
            if (previousRow[i].type.indexOf("left") != -1) {
                left = i;
                if (previousRow[i].type.indexOf("in") != -1) {
                    left++;
                }
            }
            else if (previousRow[i].type.indexOf("right") != -1) {
                right = i;
                if (previousRow[i].type.indexOf("in") != -1) {
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
                row.push(this.makeTile(j, yPos, "not-road"));
            }
            else if (j == newLeft) {
                row.push(this.makeTile(j, yPos, "road-left" + leftSuffix));
            }
            else if (j < newRight) {
                row.push(this.makeTile(j, yPos, "road"));
            }
            else if (j == newRight) {
                row.push(this.makeTile(j, yPos, "road-right" + rightSuffix));
            }
            else {
                row.push(this.makeTile(j, yPos, "not-road"));
            }
        }

        return row;
    }

    Grid.prototype.makeTile = function(xIndex, yPos, type) {
        var pos = new THREE.Vector2();
        pos.x = xIndex * this.size + 100;
        pos.y = yPos;
        var tile = new GridTile(this.game, type, pos);
        this.container.add(tile.quad.mesh);
        return tile;
    }

    return Grid;
}());