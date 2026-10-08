//------------------------------------------------------------------------------
// Constructor scope
//------------------------------------------------------------------------------

/**
 * Creates a new object of TilemapLayer.
 *
 * @constructor
 * @extends rune.tilemap.TilemapDataLayer
 *
 * @param {rune.tilemap.Tilemap} map Reference to the map to which the layer belongs.
 * @param {Array.<number>} [data] Tilemap data.
 *
 * @class
 * @classdesc
 *
 * The rune.tilemap.TilemapLayer class represents a layer (buffer) within a
 * Tilemap. Each layer has its own set of Tiles, which can be managed from the
 * layer object. A Tilemap object automatically instantiates two layers; one
 * for the back buffer, and one for the front buffer.
 *
 * @see rune.tilemap.Tilemap
 */
rune.tilemap.TilemapLayer = function(map, data) {
    rune.tilemap.TilemapDataLayer.call(this, map, data);
};

//------------------------------------------------------------------------------
// Inheritance
//------------------------------------------------------------------------------

rune.tilemap.TilemapLayer.prototype = Object.create(rune.tilemap.TilemapDataLayer.prototype);
rune.tilemap.TilemapLayer.prototype.constructor = rune.tilemap.TilemapLayer;