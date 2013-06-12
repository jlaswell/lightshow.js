!function($, lightshow) {
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
}(window.$, lightshow);