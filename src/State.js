var State = (function() {
    "use strict";
    function State() {

        // controllers are function that takes a delta time and the game.
        this.controllers = [];
    }

    State.prototype.update = function(game, delta) {
        this.controllers.forEach(function(c) {
            c(game, delta);
        });
    };

    State.prototype.getAssets = function() {
        return [];
    };

    State.prototype.onStart = function(game) {
    };

    State.prototype.onStop = function(game) {
    };

    State.prototype.render = function(game) {
    };

    State.prototype.resize = function(width, height) {
    };
    return State;
}());
