window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
		  window.webkitRequestAnimationFrame || 
		  window.mozRequestAnimationFrame    || 
		  window.oRequestAnimationFrame      || 
		  window.msRequestAnimationFrame     ||  
		  function( callback ){
			window.setTimeout(callback, 1000 / 60);
		  };
})();
;var lightshow = function() {
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
	clear_color = '#010101';
	function Chrysanthemum( x, y, red, green, blue ) {
		Particle.call( this, x, y, red, green, blue );
	};
	Chrysanthemum.prototype = Object.create( Particle.prototype );
	function Dahlia( x, y, red, green, blue ) {
		Particle.call( this, x, y, red, green, blue );
		this.radius = (Math.random() > 0.8)?this.radius*1.76:this.radius;
		this.alpha = 1.5;
	};
	Dahlia.prototype = Object.create( Particle.prototype );
	function Peony( x, y, red, green, blue ) {
		Particle.call( this, x, y, red, green, blue );
		this.vx = (Math.random() > 0.76)?this.vx * 0.24:this.vx;
		this.vy = (Math.random() > 0.76)?this.vy * 0.24:this.vy;
	}
	Peony.prototype = Object.create( Particle.prototype );
	/* Maximum amount of particles to draw to the screen in a single frame.
	 * Adjust this value to enhance performance if needed.
	 */
	var threshold = 1800;
	/* Array of currently visible particles. */
	particles = [];
	/* Particle 'class' to represent sparks. */
	function Particle( x, y, red, green, blue ) {
		/* This particle is the size of its radius, of course. */
		this.radius = 0.76;
		/* Set the coordinates if desired, else pick a random point within the canvas. */
		this.x = x || Math.random() * get_( 'width' );
		this.y = y || Math.random() * get_( 'height' );
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
		/* Call this to update the particle. */
		this.draw = function() {
			context.fillStyle = 'rgba( ' + this.red + ', ' + this.green + ', ' + this.blue + ', ' + this.alpha + ' )';
			context.beginPath();
			context.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false );
			context.fill();
			context.closePath();
		};
		this.update = function( speedup ) {
			this.x += this.vx * speedup;
			this.y += this.vy * speedup;
			this.alpha -= 0.02;
		}
	};
	/* Array of the currently active shells. */
	shells = [];
	function Shell( x, y, red, green, blue ) {
		this.radius = 1;
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
		/* Color components of this shell. */
	  this.red = red || 255;
		this.green = green || 255;
		this.blue = blue || 255;
		/* Array of the effect components contained within this shell. */
		this.effects = [];
		/* Make some noise! */
		audio_( 'launch' );
		this.draw = function() {
			/* Background color of the shell. */
			context.fillStyle = '#3c3c3c';
			context.beginPath();
			context.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false );
			context.fill();
			context.closePath();
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
				particles.push( new Peony( this.x, this.y ));
			}
			audio_( 'explosion' );
		}
	}
	function Firework( ignition_string ) {
		var request = JSON.parse( ignition_string );
		for( var i = 0; i < request.shells.length; i++ ) {
			var shell = request.shells[ i ];
			setTimeout( function() {shells.push( new Shell( shell.x, shell.y ))}, (shell.timeout - 100 + Math.random() * 200) );
		}
	}
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
	};
	function clear_() {
		context.fillStyle = clear_color;
		context.fillRect( 0, 0, get_( 'width' ), get_( 'height' ));
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
	// @AKX (http://stackoverflow.com/questions/9194558/center-point-on-html-quadratic-curve)
	function position_( position, p1, p2, p3 ) {
		var iT = 1 - position;
		return iT * iT * p1 + 2 * iT * position * p2 + position * position * p3;
	};
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
		set_( 'firework.cake.blonde_joke', '{"shells":[{"x":550,"y":200,"timeout":0},{"x":550,"y":200,"timeout":1800},{"x":550,"y":200,"timeout":3600},{"x":550,"y":200,"timeout":5400},{"x":550,"y":200,"timeout":7200},{"x":550,"y":200,"timeout":9000},{"x":550,"y":200,"timeout":10800},{"x":550,"y":200,"timeout":12600},{"x":550,"y":200,"timeout":14400},{"x":550,"y":200,"timeout":16200},{"x":550,"y":200,"timeout":18000},{"x":550,"y":200,"timeout":19800},{"x":550,"y":200,"timeout":21600},{"x":550,"y":200,"timeout":23400},{"x":550,"y":200,"timeout":25200},{"x":550,"y":200,"timeout":27000},{"x":550,"y":200,"timeout":28800},{"x":550,"y":200,"timeout":30600},{"x":550,"y":200,"timeout":32400},{"x":550,"y":200,"timeout":34200},{"x":550,"y":200,"timeout":36000},{"x":550,"y":200,"timeout":37800},{"x":550,"y":200,"timeout":39600},{"x":550,"y":200,"timeout":41400},{"x":550,"y":200,"timeout":43200},{"x":550,"y":200,"timeout":43950},{"x":550,"y":200,"timeout":44700},{"x":550,"y":200,"timeout":45450},{"x":550,"y":200,"timeout":46200},{"x":550,"y":200,"timeout":46950},{"x":550,"y":200,"timeout":47700},{"x":550,"y":200,"timeout":48450},{"x":550,"y":200,"timeout":49200},{"x":550,"y":200,"timeout":49950},{"x":550,"y":200,"timeout":50700},{"x":550,"y":200,"timeout":51450},{"x":550,"y":200,"timeout": 52200}]}');
	}
	function audio_launch_var( id ) {
		var audio = get_( 'audio.launch_' + id );
		var length = audio.length;
		var index = get_( 'audio.launch_' + id + '.index' );
		if( index === length-1 ) {
			set_( 'audio.launch_' + id + '.index', 0 );
			return 0;
		}
		else {
			set_( 'audio.launch_' + id + '.index', ++index );
			return index;
		};
	}
	function audio_explosion_var( id ) {
		var audio = get_( 'audio.explosion_' + id );
		var length = audio.length;
		var index = get_( 'audio.explosion_' + id + '.index' );
		if( index === length-1 ) {
			set_( 'audio.explosion_' + id + '.index', 0 );
			return 0;
		}
		else {
			set_( 'audio.explosion_' + id + '.index', ++index );
			return index;
		};
	}
	function audio_( type )  {
		if( type === 'launch' ) {
			var sound = Math.floor(1 + Math.random() * 4);
			var index = audio_launch_var( sound );
			get_( 'audio.launch_' + sound )[ index ].play();
		} else if( type === 'explosion' ) {
			var sound = Math.floor(1 + Math.random() * 3);
			var index = audio_explosion_var( sound );
			get_( 'audio.explosion_' + sound )[ index ].play();
		};
	};
	function audio_init_() {
		set_( 'audio.launch_1',
			[	
				new Audio( 'res/launch_1_.mp3'),
				new Audio( 'res/launch_1_.mp3'),
				new Audio( 'res/launch_1_.mp3'),
				new Audio( 'res/launch_1_.mp3')
			]
		);
		set_( 'audio.launch_2',
			[	
				new Audio( 'res/launch_2_.mp3'),
				new Audio( 'res/launch_2_.mp3'),
				new Audio( 'res/launch_2_.mp3'),
				new Audio( 'res/launch_2_.mp3')
			]
		);
		set_( 'audio.launch_3',
			[	
				new Audio( 'res/launch_3_.mp3'),
				new Audio( 'res/launch_3_.mp3'),
				new Audio( 'res/launch_3_.mp3'),
				new Audio( 'res/launch_3_.mp3')
			]
		);
		set_( 'audio.launch_4',
			[	
				new Audio( 'res/launch_4_.mp3'),
				new Audio( 'res/launch_4_.mp3'),
				new Audio( 'res/launch_4_.mp3'),
				new Audio( 'res/launch_4_.mp3')
			]
		);
		set_( 'audio.launch_1.index', 0 );
		set_( 'audio.launch_2.index', 0 );
		set_( 'audio.launch_3.index', 0 );
		set_( 'audio.launch_4.index', 0 );
				// new Audio( 'res/launch_2_.mp3'),
				// new Audio( 'res/launch_3_.mp3'),
				// new Audio( 'res/launch_4_.mp3')
			// ]
		// );
		set_( 'audio.explosion_1',
			[
				new Audio( 'res/explosion_1_.mp3'),
				new Audio( 'res/explosion_1_.mp3'),
				new Audio( 'res/explosion_1_.mp3'),
				new Audio( 'res/explosion_1_.mp3')
			]
		);
		set_( 'audio.explosion_2',
			[
				new Audio( 'res/explosion_2_.mp3'),
				new Audio( 'res/explosion_2_.mp3'),
				new Audio( 'res/explosion_2_.mp3'),
				new Audio( 'res/explosion_2_.mp3')
			]
		);
		set_( 'audio.explosion_3',
			[
				new Audio( 'res/explosion_3_.mp3'),
				new Audio( 'res/explosion_3_.mp3'),
				new Audio( 'res/explosion_3_.mp3'),
				new Audio( 'res/explosion_3_.mp3')
			]
		);
		set_( 'audio.explosion_1.index', 0 );
		set_( 'audio.explosion_2.index', 0 );
		set_( 'audio.explosion_3.index', 0 );
	}
	function fire_( rate ) {
		var x = get_( 'width' ) / 3 + (Math.floor(0 + Math.random() * get_( 'width') / 3));
		var y = get_( 'height' ) / 8 - 0.1 * Math.floor(0 + Math.random() * 10);
		// console.log( '{"shells":[{"x":' + x + ',"y":' + y + ',"timeout":' + rate + '}]}' );
		new Firework( '{"shells":[{"x":' + x + ',"y":' + y + ',"timeout":' + 100 + '}]}' );
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
		init: function( id_ ) {
			$('body').prepend( '<canvas id="' + id_ + '" width="' + (width - 20) + '" height="' + (2 * (height - 34) / 3) + '"></canvas>' );
			set_( 'canvas', document.getElementById( id_ ));
			context = get_( 'canvas' ).getContext( '2d' );
			set_( 'width', get_( 'canvas' ).width );
			set_( 'height', get_( 'canvas' ).height );
			set_( 'start_x', get_( 'canvas' ).width / 2 );
			set_( 'start_y', get_( 'canvas' ).height );
			set_( 'target_x', get_( 'canvas' ).width / 2 );
			set_( 'target_y', get_( 'canvas' ).height / 1.2 );
			audio_init_();
			build_fireworks();
		},
		explode: function( event ) {
			for( var i = 0; i < 150; i++ ) {
				var x = event.clientX + (-25 + 50 * Math.random());
				var y = event.clientY + (-25 + 50 * Math.random());
				particles.push( new Particle( x, y ));
			}
		},
		explode_at: function( x_, y_ ) {
			for( var i = 0; i < 150; i++ ) {
				var x = x_ + (-25 + 50 * Math.random());
				var y = x_ + (-25 + 50 * Math.random());
				particles.push( new Particle( x, y ));
			}
		},
		path: function( event ) {
			var x = event.clientX + (-25 + 50 * Math.random());
			var y = event.clientY + (-25 + 50 * Math.random());
			shells.push( new Shell( x, y ));//, 113, 238, 184 ));
		},
		fire: function( x_, y_, amount ) {
			for( var i = 0; i < amount; i++ ) {
				var x = x_ + (-25 + 50 * Math.random());
				var y = y_ + (-25 + 50 * Math.random());
				shells.push( new Shell( x, y ));
			}
		},
		addParticle: function( x_, y_ ) {
			particles.push( new Particle( x_, y_ ));
		},
		addFirework: function( string ) {
			new Firework( string );
		},
		fireRandom: function( rate ) {
			set_( 'randomness', setInterval( function() {fire_();}, rate ));
		},
		stopRandom: function() {
			clearInterval( get_( 'randomness' ));
		},
		c: new Chrysanthemum( 400, 400, 55, 55, 250 ),
		particles: particles,
		// shells: shells,
		draw: draw_,
		update: update_,
		clear: clear_,
		start: start_
	};
}();