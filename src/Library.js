!function($, lightshow) {
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