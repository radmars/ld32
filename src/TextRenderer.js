var TextRenderer = (function(){
    var TextRenderer = {};

    var textureSize = 1024;

    function Font(settings) {
        this.settings = settings || {};
        this.settings.font = this.settings.font || 'serif';
        this.settings.size= this.settings.size || 16;
        this.settings.fg = this.settings.fgColor || 'white';
        this.fontString = "" + this.settings.size + "px " + this.settings.font;
        this.characters = {};
        this.textures = [];
        this.sets = {};
        this.charactersPerSet = ~~(textureSize / (this.settings.size + 5));
        this.charactersPerSet = this.charactersPerSet * this.charactersPerSet;
    }

    Font.prototype._getSetNumber = function(code) {
        return Math.floor(code / this.charactersPerSet);
    };

    Font.prototype._getSetRange = function(set) {
        return {
            start: this.charactersPerSet * set,
            end: this.charactersPerSet * (set + 1) - 1
        };
    };

    Font.prototype.getCodeTexture = function(code) {
        var set;
        set = this._getSetNumber(code);
        return this.textures[this.sets[set]];
    };

    Font.prototype._getSetTexture = function(set) {
        return this.textures[this.sets[set]];
    };

    Font.prototype.getMetrics = function(code) {
        if (!this.characters[code]) {
            this.renderSet(code);
        }
        return this.characters[code];
    };

    Font.prototype.renderSet = function(code) {
        var canvas, char, context, currentCode, metrics, range, set, size, texture, textureId, x, y;
        set = this._getSetNumber(code);
        range = this._getSetRange(set);
        currentCode = range.start;
        canvas = document.createElement('canvas');
        canvas.width = canvas.height = textureSize;
        context = canvas.getContext('2d');
        context.font = this.fontString;
        size = this.settings.size;
        if (this.settings.bg) {
            context.fillStyle = this.settings.bg;
            context.fillRect(0, 0, textureSize, textureSize);
        }
        if (this.settings.stroke) {
            context.strokeStyle = this.settings.stroke;
        }
        context.fillStyle = this.settings.fg;
        context.textBaseline = 'top';
        x = 0;
        y = 0;
        textureId = this.textures.length;
        this.sets[set] = textureId;
        while (currentCode < range.end) {
            char = String.fromCharCode(currentCode);
            metrics = context.measureText(char);
            if (x + metrics.width > canvas.width) {
                x = 0;
                y += size + 2;
            }
            if (y + size > canvas.height) {
                throw "Character range " + range.start + "-" + range.end + " doesnt fit in texture";
            }
            this.characters[currentCode] = {
                u: x / textureSize,
                v: 1 - (y / textureSize),
                h: size / textureSize,
                uw: metrics.width,
                w: metrics.width / textureSize
            };
            context.fillText(char, x, y);
            if (this.settings.stroke) {
                context.strokeText(char, x, y);
            }
            x += ~~(metrics.width + 2);
            currentCode++;
        }
        texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;
        return this.textures.push(texture);
    };

    TextRenderer.Font = Font;

    TextRenderer.render = function(font, text) {
        var geometry, hash, id, material, metrics, object, right, texture, textures, x, y;
        var currentChar = 0;
        x = 0;
        y = 0;
        textures = {};
        while (currentChar < text.length) {
            var character = text.charAt(currentChar);
            var code = character.charCodeAt(0);
            metrics = font.getMetrics(code);
            texture = font.getCodeTexture(code);
            if (!textures[texture.id]) {
                textures[texture.id] = {
                    currentFace: 0,
                    geometry: new THREE.Geometry(),
                    texture: texture
                };
                textures[texture.id].geometry.faceVertexUvs = [[]];
            }
            geometry = textures[texture.id].geometry;
            right = x + metrics.uw;
            right = ~~right;
            geometry.vertices.push(new THREE.Vector3(x, 0, 0));
            geometry.vertices.push(new THREE.Vector3(x, font.settings.size, 0));
            geometry.vertices.push(new THREE.Vector3(right, 0, 0));
            geometry.vertices.push(new THREE.Vector3(right, font.settings.size, 0));
            var firstVertex = textures[texture.id].currentFace * 4;
            geometry.faces.push(new THREE.Face3(firstVertex, firstVertex + 1, firstVertex + 3));
            geometry.faces.push(new THREE.Face3(firstVertex, firstVertex + 3, firstVertex + 2));
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(metrics.u, metrics.v),
                new THREE.Vector2(metrics.u, metrics.v - metrics.h),
                new THREE.Vector2(metrics.u + metrics.w, metrics.v - metrics.h),
            ]);
            geometry.faceVertexUvs[0].push([
                new THREE.Vector2(metrics.u, metrics.v),
                new THREE.Vector2(metrics.u + metrics.w, metrics.v - metrics.h),
                new THREE.Vector2(metrics.u + metrics.w, metrics.v),

            ]);
            textures[texture.id].currentFace++;
            currentChar++;
            x = right;
        }
        object = new THREE.Object3D();
        for (id in textures) {
            hash = textures[id];
            geometry = hash.geometry;
            geometry.computeFaceNormals();
            material = new THREE.MeshBasicMaterial({
                map: hash.texture,
                transparent: true
            });
            material.blending = THREE.CustomBlending;
            material.blendSrc = THREE.SrcAlphaFactor;
            material.blendDst = THREE.OneMinusSrcAlphaFactor;
            material.blendEquation = THREE.AddEquation;
            object.add(new THREE.Mesh(geometry, material));
        }
        return object;
    }

    return TextRenderer;

}());

