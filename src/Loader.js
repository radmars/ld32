var Loader = (function() {
    "use strict";
    function Loader() {
        var self = this;
        this.assets = {};
        this.loaders = {};

        // how to load a texture
        this.loaders.img = function(asset, name) {
            var success = function(image) {
                if(asset.callback) {
                    asset.callback(image);
                }
                return self.assets[name] = image;
            };
            var error = function() {
                return console.error( "Error loading", name, error);
            };
            return THREE.ImageUtils.loadTexture(name, undefined, success, error);
        };

            // how to load audio
        this.loaders.audio = function(asset, name) {
            var audio, loader, settings;
            loader = self;
            settings = {};
            if (asset.volume) {
                settings.volume = asset.volume;
            }
            if (asset.buffer) {
                settings.buffer = asset.buffer;
            }
            settings.urls = asset.urls;
            settings.onload = function() {
                loader.assets[name] = this;
                if (asset.callback) {
                    return asset.callback(this);
                }
            };
            return audio = new Howl(settings);
        };


        this.loaders.model = function(asset, name) {
            var modelLoader = new THREE.JSONLoader();
            return modelLoader.load(name, function(geo, mat) {
                self.assets[name] = {
                    geometry: geo,
                    materials: mat
                };
            });
        };
    }

    Loader.prototype.load = function(assets) {
        var self = this;
        assets.forEach(function(asset) {
            var loader = self.loaders[asset.type];
            if(! loader) {
                console.log("No loader for: ", asset);
                throw "No loader!";
            }
            loader(asset, asset.name);
        });
    };

    Loader.prototype.done = function(assets) {
        var self = this;
        var loaded = true;

        assets.forEach(function(asset) {
            if (!self.assets[asset.name]) {
                loaded = false;
            }
        });
        return loaded;
    };

    Loader.prototype.get = function(name) {
        var value = this.assets[name];
        if (!value) {
            throw "Unknown asset " + name;
        }
        return value;
    };

    return Loader;
}).call(this);
