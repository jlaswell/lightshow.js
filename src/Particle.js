!function($, lightshow) {
	"use strict";
	var Particle = function( x, y, red, green, blue ) {
		/* This particle is the size of its radius, of course. */
		this.radius = 0.76;
		/* Set the coordinates if desired, else pick a random point within the canvas. */
		this.x = x || Math.random() * lightshow.get( 'width' );
		this.y = y || Math.random() * lightshow.get( 'height' );
		/* Color components of this Particle. */
		this.red = red || Math.floor(50 + (Math.random() * 205));
		this.green = green || Math.floor(50 + (Math.random() * 205));
		this.blue = blue || Math.floor(50 + (Math.random() * 205));
		this.alpha = 1;
		var xDir = (Math.random() > 0.5)?1:-1;
		var yDir = (Math.random() > 0.5)?1:-1;
		/* Help randomize the explosion vectors. */
		var tmp = this.radius * Math.sqrt( Math.random() );
		/* Set a random velocity to represent direction of this particle at the break. */
		this.vx = Math.pow( tmp, 2) * Math.random() * Math.PI * 4 * xDir;
		this.vy = Math.pow( tmp, 2) * Math.random() * Math.PI * 4 * yDir;
	}
	Particle.prototype.draw = function() {
		lightshow.get( 'context' ).fillStyle = 'rgba( ' + this.red + ', ' + this.green + ', ' + this.blue + ', ' + this.alpha + ' )';
		lightshow.get( 'context' ).beginPath();
		lightshow.get( 'context' ).arc( this.x, this.y, this.radius, 0, Math.PI * 2, false );
		lightshow.get( 'context' ).fill();
		lightshow.get( 'context' ).closePath();
	};
	/* Call this to update the particle. */
	Particle.prototype.update = function( speedup ) {
		this.x += this.vx * speedup;
		this.y += this.vy * speedup;
		this.alpha -= 0.02;
	};
	var Chrysanthemum = function( x, y, red, green, blue ) {
		lightshow.particle.call( this, x, y, red, green, blue );
		new lightshow.particle( x, y, red, green, blue );
	};
	Chrysanthemum.prototype = Object.create( Particle.prototype );
	var Peony = function ( x, y, red, green, blue ) {
		Particle.call( this, x, y, red, green, blue );
		this.vx = (Math.random() > 0.76)?this.vx * 0.24:this.vx;
		this.vy = (Math.random() > 0.76)?this.vy * 0.24:this.vy;
	};
	Peony.prototype = Object.create( Particle.prototype );
	// var Dahlia = function( x, y, red, green, blue ) {
		// Particle.call( this, x, y, red, green, blue );
		// this.radius = (Math.random() > 0.8)?this.radius*1.24:this.radius;
		// this.alpha = 1.24;
	// };
	// Dahlia.prototype = Object.create( Particle.prototype );
	lightshow.particle = Particle;
	lightshow.Chrysanthemum = Chrysanthemum;
	lightshow.Peony = Peony;
	// lightshow.Dahlia = Dahlia;
}(window.$, lightshow);