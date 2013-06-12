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
};/*-===============================================================================================-*
 *                                                                                                 *
 *                                                      . *''*.'                                   *
 *                                                      *__\/__*                                   *
 *                                                     ,*. /\',*                                   *
 *                        __ _       _     _       _      *..* .        _                          *
 *                       / /(_) __ _| |__ | |_ ___| |__   _____      __(_)___                      *
 *                      / / | |/ _` | '_ \| __/ __| '_ \ / _ \ \ /\ / /| / __|                     *
 *                     / /__| | (_| | | | | |_\__ \ | | | (_) \ V  V / | \__ \                     *
 *                     \____/_|\__, |_| |_|\__|___/_| |_|\___/ \_/\_(_)/ |___/                     *
 *                             |___/                                 |__/                          *
 *                                                                                                 *
 *-===============================================================================================-*
 *
 * Copyright (c) 2013 John Laswell
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and 
 * associated documentation files (the "Software"), to deal in the Software without restriction, 
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, 
 * sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is 
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all copies or 
 * substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND 
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
/* Lightshow.js v0.0.1 */
!function($) {
	"use strict";
	var Lightshow = function() {
		/* 'Protected' data object. */
		var data = window.data || {};
		/* 'Private' data object. */
		var data_ = {};
		/* Set the data as non-editable by the user. */
		var set_ = function( bucket_, object_ ) {
			return data_[ bucket_ ] = object_;
		};
		/* Private get function. */
		var get_ = function( bucket_ ) {
			return data_[ bucket_ ];
		};
		/* Sky color. */
		var clear_color = '#010101';
		/* Maximum amount of particles to draw to the screen in a single frame.
		 * Adjust this value to enhance performance if needed.
		 */
		var threshold = 1800;
		/* Array of currently visible particles. */
		var particles = [];
		// Mixin class to add functionality to sub-classes.
		var Mixin = function() {};
		Mixin.prototype = {
			position: function( x, y ) {
				this.x = x || 0;
				this.y = y || 0;
			}
		};
		/* Array of the currently active shells. */
		var shells = [];
		function Shell( x, y, red, green, blue ) {
			this.mixins = {};
			this.mixins[ 'position' ] = Mixin.prototype.position;
			this.mixins.position( x, y );
			this.radius = 1;
			this.effect = lightshow.Peony;
			this.density = 120;
			/* The coordinates of the location that the shell was aimed at on launch. */
			this.final_x = x + (-25 + 50 * Math.random()) || Math.random() * get_( 'width' );
			this.final_y = y + (-25 + 50 * Math.random()) || Math.random() * get_( 'height' );
			/* The coordinates of the location that the shell was launched from. */
			// Currently just using the bottom center of the canvas. */
			this.x = get_( 'start_x' );
			this.y = get_( 'start_y' );
			/* The current position (as a percentage from 0.0 to 1.0) of the shell along the path to its final_x, final_y location. */
			this.current_position = 0;
			/* Ground effect flag.
			 * This needs to be more customizable though....
			 */
			this.ready = false;
			/* Speed constant to adjust for a more realistic look.*/
			this.rate = 1.2;
			/* Flag to indicate if this shell is a single color.
			 * These sort of properties will be move to effect components in the future.
			 */
			this.single_color = false;
			// Color components of this shell. 
		  this.red = red || 255;
			this.green = green || 255;
			this.blue = blue || 255;
			/* Array of the effect components contained within this shell. */
			this.effects = [];
			/* Make some noise! */
			audio_( 'launch' );
			this.draw = function() {
				/* Background color of the shell. */
				get_( 'context' ).fillStyle = '#ffffff';//'#3c3c3c';
				get_( 'context' ).beginPath();
				get_( 'context' ).arc( this.x, this.y, this.radius, 0, Math.PI * 2, false );
				get_( 'context' ).fill();
				get_( 'context' ).closePath();
			};
			this.update = function( speedup ) {
				this.x = position_( this.current_position, get_( 'start_x' ), get_( 'target_x' ), this.final_x );
				this.y = position_( this.current_position, get_( 'start_y' ), get_( 'target_y' ), this.final_y );
				var last_position = this.current_position;
				this.current_position += 0.027 * speedup * this.rate;
				this.rate *= 0.97;
			};
			this.ignite = function() {
				for( var i = 0; i < this.density; i++ ) {
					particles.push( new this.effect( this.x, this.y, this.red, this.green, this.blue ));
				}
				audio_( 'explosion' );
			}
		}
		var fireworks = [];
		function Firework( request, description, type, duration ) {
			this.name = request;
			this.ignition_string = lightshow.library.data.cake[ request ];
			this.shell_sequence = JSON.parse( this.ignition_string );
			this.description = description || this.description;
			this.type = type || this.type;
			this.duration = duration || this.duration;
			this.launch = function() {
				for( var i = 0; i < this.shell_sequence.shells.length; i++ ) {
					var shell = this.shell_sequence.shells[ i ];
					setTimeout( function() {shells.push( new Shell( shell.x, shell.y ))}, (shell.timeout - 100 + Math.random() * 200 ));
				}
			};
		};
		function update_() {
			for( var i = 0; i < shells.length; i++ ) {
				var s = shells[ i ];
				s.update( 1 );
				if( s.ready || s.current_position >= 1 ) {
					s.ignite();
					shells.splice( i, 1 );
				}
			}
			for( var i = 0; i < particles.length; i++ ) {
				var p = particles[ i ];
				p.update( 0.24 );
				if( p.alpha <= 0 ) {
					particles.splice( i, 1 );
				}
			}
			if( particles.length > threshold ) {
				particles.splice( 0, particles.length - threshold );
			}
			lightshow.library.update();
		};
		function clear_() {
			get_( 'context' ).fillStyle = clear_color;
			get_( 'context' ).fillRect( 0, 0, get_( 'width' ), get_( 'height' ));
		};
		function draw_() {
			for( var i = 0; i < shells.length; i++ ) {
				var s = shells[ i ];
				s.draw();
			}
			for( var i = 0; i < particles.length; i++ ) {
				var p = particles[ i ];
				p.draw();
			}
		};
		function start_() {
			clear_();
			draw_();
			update_();
			requestAnimFrame( start_ );
		};
		function get_mouse_position( event ) {
			var rectangle = $(get_( 'canvas' )).offset();
			return {
				x: event.clientX - rectangle.left,
				y: event.clientY - rectangle.top
			};
		}
		// @isaacs (http://stackoverflow.com/questions/4320587/merge-two-object-literals-in-javascript)
		var merge = function() {
			var o = {}
  		for (var i = arguments.length - 1; i >= 0; i --) {
  		  var s = arguments[i]
  		  for (var k in s) o[k] = s[k]
  		}
  		return o
		};
		function build_fireworks() {
			lightshow.library.add( 'cake.blond joke', '{"shells":[{"x":550,"y":100,"timeout":0},{"x":550,"y":100,"timeout":1800},{"x":550,"y":100,"timeout":3600},{"x":550,"y":100,"timeout":5400},{"x":550,"y":100,"timeout":7200},{"x":550,"y":100,"timeout":9000},{"x":550,"y":100,"timeout":10800},{"x":550,"y":100,"timeout":12600},{"x":550,"y":100,"timeout":14400},{"x":550,"y":100,"timeout":16200},{"x":550,"y":100,"timeout":18000},{"x":550,"y":100,"timeout":19800},{"x":550,"y":100,"timeout":21600},{"x":550,"y":100,"timeout":23400},{"x":550,"y":100,"timeout":25200},{"x":550,"y":100,"timeout":27000},{"x":550,"y":100,"timeout":28800},{"x":550,"y":100,"timeout":30600},{"x":550,"y":100,"timeout":32400},{"x":550,"y":100,"timeout":34200},{"x":550,"y":100,"timeout":36000},{"x":550,"y":100,"timeout":37800},{"x":550,"y":100,"timeout":39600},{"x":550,"y":100,"timeout":41400},{"x":550,"y":100,"timeout":43200},{"x":550,"y":100,"timeout":43950},{"x":550,"y":100,"timeout":44700},{"x":550,"y":100,"timeout":45450},{"x":550,"y":100,"timeout":46200},{"x":550,"y":100,"timeout":46950},{"x":550,"y":100,"timeout":47700},{"x":550,"y":100,"timeout":48450},{"x":550,"y":100,"timeout":49200},{"x":550,"y":100,"timeout":49950},{"x":550,"y":100,"timeout":50700},{"x":550,"y":100,"timeout":51450},{"x":550,"y":100,"timeout": 52200}]}', 'An attention grabbing show of alternating red crackling stars, green bouquets with crackling tail and blue bouquets with crackling tails. Twelve of the 36 shots in a HUGE finale.', 52200 );
		}
		function audio_( type )  {
			if( type === 'launch' ) {
				// We have almost acheived callback hell... maybe we should clean this up? @TODO
				lightshow.audio.available.launch.randomProperty().next().play();
			} else if( type === 'explosion' ) {
				lightshow.audio.available.explosion.randomProperty().next().play();
			};
		};
		function fire_( rate ) {
			var x = get_( 'width' ) / 3 + (Math.floor(0 + Math.random() * get_( 'width') / 3));
			var y = get_( 'height' ) / 8 - 0.1 * Math.floor(0 + Math.random() * 10);
			// console.log( '{"shells":[{"x":' + x + ',"y":' + y + ',"timeout":' + rate + '}]}' );
			var f = new Firework( '{"shells":[{"x":' + x + ',"y":' + y + ',"timeout":' + 100 + '}]}' );
			f.launch();
		}
		// Meat and potatoes.
		return {
			/* Set the appropriate (key, value) pair for our data while preventing overwriting of private keys. */
			set: function( bucket_, object_ ) {
				/* If the desired bucket_ is empty... */
				if( data_[ bucket_ ] === undefined ) {
					return data[ bucket_ ] = object_;
				} else {
					return false;
				}
			},
			/* Get the object within the desired bucket, taking from the private buckets first. */
			get: function( bucket_ ) {
				return data_[ bucket_ ] || data[ bucket_ ];
			},
			/* Debugging function used to see whats in the data objects. */
			data: function() {
				return merge( data_, data );
			},
			/* Initialization function where id_ is the id of the canvas you want to draw to. */
			init: function( canvas_id_, container_id_ ) {
				$(('#' + container_id_ )).prepend( '<canvas id="' + canvas_id_ + '" width="' + (width - 40) + '" height="' + (2 * (height - 34) / 3) + '"></canvas>' );
				set_( 'canvas', document.getElementById( canvas_id_ ));
				set_( 'context', get_('canvas').getContext( '2d' ));
				set_( 'width', get_( 'canvas' ).width );
				set_( 'height', get_( 'canvas' ).height );
				set_( 'start_x', get_( 'canvas' ).width / 2 );
				set_( 'start_y', get_( 'canvas' ).height );
				set_( 'target_x', get_( 'canvas' ).width / 2 );
				set_( 'target_y', get_( 'canvas' ).height / 1.2 );
				// audio_init_();
				this.audio.init();
				this.library.init();
				build_fireworks();
			},
			explode: function( event ) {
				for( var i = 0; i < 150; i++ ) {
					var x = event.clientX + (-25 + 50 * Math.random());
					var y = event.clientY + (-25 + 50 * Math.random());
					particles.push( new lightshow.particle( x, y ));
				}
			},
			explode_at: function( x_, y_ ) {
				for( var i = 0; i < 150; i++ ) {
					var x = x_ + (-25 + 50 * Math.random());
					var y = x_ + (-25 + 50 * Math.random());
					particles.push( new lightshow.particle( x, y ));
				}
			},
			path: function( event ) {
				var position = get_mouse_position( event );
				var x = position.x + (-25 + 50 * Math.random());
				var y = position.y + (-25 + 50 * Math.random());
				audio_( 'launch' );
				shells.push( new Shell( x, y, 255, 255, 255 ));//, 113, 238, 184 ));
			},
			fire: function( x_, y_, amount ) {
				for( var i = 0; i < amount; i++ ) {
					var x = x_ + (-25 + 50 * Math.random());
					var y = y_ + (-25 + 50 * Math.random());
					shells.push( new Shell( x, y ));
				}
			},
			addParticle: function( x_, y_ ) {
				particles.push( new lightshow.particle( x_, y_ ));
			},
			addFirework: function( string ) {
				var f = new Firework( string );
				f.launch();
			},
			fireRandom: function( rate ) {
				set_( 'randomness', setInterval( function() {fire_();}, rate ));
			},
			stopRandom: function() {
				clearInterval( get_( 'randomness' ));
			},
			audio: audio_,
			// c: new Chrysanthemum( 400, 400, 55, 55, 250 ),
			particles: particles,
			shells: shells,
			fireworks: fireworks,
			firework: Firework,
			draw: draw_,
			update: update_,
			clear: clear_,
			start: start_
		};
	}();
	window.lightshow = Lightshow;
}(window.$);
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
}(window.$, lightshow);!function($, lightshow) {
	"use strict";
	var AudioPlayer = function( type ) {
		this.available = {};
		this.available.launch = {};
		this.available.explosion = {};
		this.active = [];
	}
	AudioPlayer.prototype.init = function() {
		this.available.launch.launch_1 =
			[	
				new Audio( 'res/launch_1_.mp3'),
				new Audio( 'res/launch_1_.mp3'),
				new Audio( 'res/launch_1_.mp3'),
				new Audio( 'res/launch_1_.mp3')
			];
		this.available.launch.launch_2 =
			[	
				new Audio( 'res/launch_2_.mp3'),
				new Audio( 'res/launch_2_.mp3'),
				new Audio( 'res/launch_2_.mp3'),
				new Audio( 'res/launch_2_.mp3')
			];
		this.available.launch.launch_3 =
			[	
				new Audio( 'res/launch_3_.mp3'),
				new Audio( 'res/launch_3_.mp3'),
				new Audio( 'res/launch_3_.mp3'),
				new Audio( 'res/launch_3_.mp3')
			];
		this.available.launch.launch_4 =
			[	
				new Audio( 'res/launch_4_.mp3'),
				new Audio( 'res/launch_4_.mp3'),
				new Audio( 'res/launch_4_.mp3'),
				new Audio( 'res/launch_4_.mp3')
			];
		this.available.explosion.explosion_1 =
			[
				new Audio( 'res/explosion_1_.mp3'),
				new Audio( 'res/explosion_1_.mp3'),
				new Audio( 'res/explosion_1_.mp3'),
				new Audio( 'res/explosion_1_.mp3')
			];
		this.available.explosion.explosion_2 =
			[
				new Audio( 'res/explosion_2_.mp3'),
				new Audio( 'res/explosion_2_.mp3'),
				new Audio( 'res/explosion_2_.mp3'),
				new Audio( 'res/explosion_2_.mp3')
			];
		this.available.explosion.explosion_3 =
			[
				new Audio( 'res/explosion_3_.mp3'),
				new Audio( 'res/explosion_3_.mp3'),
				new Audio( 'res/explosion_3_.mp3'),
				new Audio( 'res/explosion_3_.mp3')
			];
		}
		lightshow.audio = new AudioPlayer();
}(window.$, lightshow);!function($, lightshow) {
	"use strict";
	var Library = function( id_ ) {
		this.container = $( document.getElementById( id_ ));
		this.container.header = $( document.createElement( 'thead' ));
		this.container.body = $( document.createElement( 'tbody' ));
		this.container.queue = $( '#queue' );
		/* The .data property holds all of the JSON strings for each firework. */
		this.data = {};
		this.data.cake = {};
		/* The .available property holds all of the Firework objects that are ready for use. */
		this.available = {};
		this.available.cake = {};
		this.queue = [];
		var preview_ = function( event, name, type, duration ) {
			var target = $( event );
			console.log( duration );
			if( !target.hasClass( 'disabled' )) {
				target.addClass( 'disabled' );
				lightshow.library.enqueue( name, type );
				setTimeout( function() { target.removeClass( 'disabled' ) }, duration );
			}
		};
		var get = function( name, type ) {
			return lightshow.library.available[ type ][ name ];
		};
		var addToDomQueue_ = function( firework ) {
			var li = $( document.createElement( 'li' ));
			var a = $( document.createElement( 'a' ));
			a.attr( 'href', '#' );
			a.css( 'text-transform', 'capitalize' );
			a.text( firework.name + ' - ' );
			var span = $( document.createElement( 'span' ));
			span.text( firework.description );
			span.css( 'text-transform', 'none' );
			a.append( span );
			li.append( a );
			lightshow.library.container.queue.append( li );
		};
		this.enqueue = function( name_, type_ ) {
			/* @TODO
			 * Add the firework's name to the canvas on launch. */
			this.queue.push( $.extend({}, this.available[ type_ ][ name_ ]));
			this.container.queue
		};
		this.dequeue = function() {
			return this.queue.shift().launch();
		};
		this.addToBody = function( name_, type_, description_ , duration_) {
			// this.container.body
			var row = $( document.createElement( 'tr' ));
			var name = $( document.createElement( 'td' ));
				name.text( name_ );
			var type = $( document.createElement( 'td' ));
				type.text( type_ );
			var description = $( document.createElement( 'td' ));
				description.text( description_ );
				description.css( 'width', '60%' );
				description.css( 'word-wrap', 'break-word' );
			var actions = $( document.createElement( 'td' ));
			var actions_button_q = $( document.createElement( 'a' ));
				actions_button_q.attr( 'href', '#' );
				actions_button_q.addClass( 'tiny' );
				actions_button_q.addClass( 'button' );
				actions_button_q.text( 'Queue Up' );
				actions.append( actions_button_q );

			actions_button_q.bind( 'click', function() {
				var row = $( event.target ).closest( 'tr' );
				console.log( row );
				var name = $(row.find( 'td' )[ 0 ]).text();
				var type = $(row.find( 'td' )[ 1 ]).text();
				addToDomQueue_( get( name, type ));
			})

			var actions_button_p = $( document.createElement( 'a' ));
				actions_button_p.attr( 'href', '#' );
				actions_button_p.addClass( 'tiny' );
				actions_button_p.addClass( 'button' );
				actions_button_p.text( 'Preview' );
				actions.append( actions_button_p );

			actions_button_p.bind( 'click', function(){
				preview_( event.target, name_, type_, duration_ );
			});

			row.append( name, type, description, actions );
			this.container.body.append( row );

		};
	};
	/* Initialize the Library and the dom elements needed to get goin'. */
	Library.prototype.init = function() {
		this.container.append( this.container.header );
			var header_row = $( document.createElement( 'tr' ));
			this.container.header.append( header_row );
				var header_name = $( document.createElement( 'th' ));
				header_name.html( 'Name' );
				header_row.append( header_name );
				var header_type = $( document.createElement( 'th' ));
				header_type.html( 'Type' );
				header_row.append( header_type );
				var header_duration = $( document.createElement( 'th' ));
				header_duration.html( 'Duration' );
				header_row.append( header_duration );
				var header_actions = $( document.createElement( 'th' ));
				header_actions.html( 'Actions' );
				header_row.append( header_actions );
		this.container.append( this.container.body );
		this.container.body.css( 'text-transform', 'capitalize' );
	};
	Library.prototype.update = function( key_ ) {
		// If there are fireworks in the queue...
		if( this.queue.length ) {
			this.dequeue();
		}
	};
	/* Add a firework to the library. */
	Library.prototype.add = function( key_, value_, description_, duration_ ) {
		var type = key_.split( '.' );
		if( type[ 0 ] === 'cake' ) {
			this.data.cake[ type[ 1 ]] = value_;
			var f = new lightshow.firework( type[ 1 ], description_, type[ 0 ], duration_ );
			this.available.cake[ type[ 1 ]] = f;
			this.addToBody( f.name, f.type, f.description, f.duration );
		}
	};
	/* This should be a private method to do the legwork for dom element addition. */
	Library.prototype.appendToContainer = function( key_ ) {
		var f = this.available.cake[ 'key' ];
		return this.container.body;
	};
	lightshow.library = new Library( 'library' );
}(window.$, lightshow);