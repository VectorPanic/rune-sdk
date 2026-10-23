//------------------------------------------------------------------------------
// CONSTRUCTOR SCOPE
//------------------------------------------------------------------------------

/**
 * Fades the old image over the new image using two canvas image draws.
 *
 * @constructor
 * @extends rune.transition.Transition
 *
 * @param {Object} [options] Effect settings; duration defaults to 600 milliseconds.
 *
 * @class
 * @classdesc
 *
 * Fades the old image over the new image using two canvas image draws.
 */
rune.transition.Crossfade = function(options) {

    //--------------------------------------------------------------------------
    // SUPER CALL
    //--------------------------------------------------------------------------

    /**
     * Extend rune.transition.Transition.
     */
    rune.transition.Transition.call(this, options);
};

//------------------------------------------------------------------------------
// INHERITANCE
//------------------------------------------------------------------------------

rune.transition.Crossfade.prototype = Object.create(rune.transition.Transition.prototype);
rune.transition.Crossfade.prototype.constructor = rune.transition.Crossfade;

//------------------------------------------------------------------------------
// OVERRIDE PUBLIC PROTOTYPE METHODS (ENGINE)
//------------------------------------------------------------------------------

/**
 * @inheritDoc
 */
rune.transition.Crossfade.prototype.render = function(canvas, from, to, progress) {
    if (progress <= 0 || progress >= 1) {
        var image = progress <= 0 ? from : to;
        canvas.drawImage(image['element'], 0, 0, canvas['width'], canvas['height']);
        
        return;
    }

    var context = canvas['context'];

    canvas.drawImage(to['element'], 0, 0, canvas['width'], canvas['height']);

    context.save();
    context.globalAlpha = 1 - progress;
    canvas.drawImage(from['element'], 0, 0, canvas['width'], canvas['height']);
    context.restore();
};
