/*-===============================================================================================-*
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
