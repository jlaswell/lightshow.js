/* Using requestAnimationFrame to render with setTimeout as a fallback. */
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
					window.webkitRequestAnimationFrame || 
					window.mozRequestAnimationFrame    || 
		  		window.oRequestAnimationFrame      || 
		  		window.msRequestAnimationFrame     ||  
					function( callback ) {
						window.setTimeout(callback, 1000 / 60);
		  		};
})();
/* Simple iteration utility function and property to use with AudioPlayer. */
Array.prototype.index = 0;
/* Iterate over the elements of the Array, and restart with the zeroth element once we hit the
 * last element.
 */
Array.prototype.next = function() {
	if( this.length === 0 ) {
		return undefined;
	}
	if( this.index >= this.length ) {
		this.index = 0;
	}
	return this[ this.index++ ];
}
/* Return a randomProperty of this object. */
Object.prototype.randomProperty = function() {
	var keys = Object.keys( this );
	return this[ keys[ Math.floor( Math.random() * keys.length )]];
}
// @AKX (http://stackoverflow.com/questions/9194558/center-point-on-html-quadratic-curve)
function position_( position, p1, p2, p3 ) {
	var iT = 1 - position;
	return iT * iT * p1 + 2 * iT * position * p2 + position * position * p3;
};