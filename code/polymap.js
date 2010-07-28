// polymap.js
// Copyright (c) 2008 Michael Geary
// http://mg.to/
// Free Beer and Free Speech License (any OSI license)
// http://freebeerfreespeech.org/

// Outer wrapper function
(function( $ ) {

if( ! window.log ) window.log = window._log = function() {};

function S() {
	return Array.prototype.join.call( arguments, '' );
}

PolyMap = function( a ) {
	if( this === window )
		return new PolyMap( a );
	pm = this;
	pm.a = a;
	
	initMap();
	
	return $.extend( this, {
		
		// PolyMap methods
		
		load: function( b ) {
			opt.state = b.region;
			opt.county = b.place;
			loadState();
		},
		
		redraw: function( b ) {
			drawPolys();
		}
	});
};

if( ! Array.prototype.forEach ) {
	Array.prototype.forEach = function( fun /*, thisp*/ ) {
		if( typeof fun != 'function' )
			throw new TypeError();
		
		var thisp = arguments[1];
		for( var i = 0, n = this.length;  i < n;  ++i ) {
			if( i in this )
				fun.call( thisp, this[i], i, this );
		}
	};
}

if( ! Array.prototype.map ) {
	Array.prototype.map = function( fun /*, thisp*/ ) {
		var len = this.length;
		if( typeof fun != 'function' )
			throw new TypeError();
		
		var res = new Array( len );
		var thisp = arguments[1];
		for( var i = 0;  i < len;  ++i ) {
			if( i in this )
				res[i] = fun.call( thisp, this[i], i, this );
		}
		
		return res;
	};
}

if( ! Array.prototype.indexBy ) {
	Array.prototype.indexBy = function() {
		if( arguments.length ) {
			for( var iArg = 0, nArgs = arguments.length;  iArg < nArgs;  ++iArg ) {
				var field = arguments[iArg];
				var by = this[ 'by_' + field ] = {};
				for( var i = -1, obj;  obj = this[++i]; ) {
					by[obj[field]] = obj;
					obj.index = i;
				}
			}
		}
		else {
			var by = this.by = {};
			for( var i = 0, n = this.length;  i < n;  ++i ) {
				var str = this[i];
				by[str] = str;
				str.index = i;
			}
		}
		return this;
	};
}

// hoverize.js
// Based on hoverintent plugin for jQuery

(function( $ ) {
	
	var opt = {
		slop: 7,
		interval: 200
	};
	
	function start() {
		if( ! timer ) {
			timer = setInterval( check, opt.interval );
			$(document.body).bind( 'mousemove', move );
		}
	}
	
	function clear() {
		if( timer ) {
			clearInterval( timer );
			timer = null;
			$(document.body).unbind( 'mousemove', move );
		}
	}
	
	function check() {
		if ( ( Math.abs( cur.x - last.x ) + Math.abs( cur.y - last.y ) ) < opt.slop ) {
			clear();
			for( var i  = 0,  n = functions.length;  i < n;  ++i )
				functions[i]();
		}
		else {
			last = cur;
		}
	}
	
	function move( e ) {
		cur = { x:e.screenX, y:e.screenY };
	}
	
	var timer, last = { x:0, y:0 }, cur = { x:0, y:0 }, functions = [];
	
	hoverize = function( fn, fast ) {
		
		function now() {
			fast && fast.apply( null, args );
		}
		
		function fire() {
			clear();
			return fn.apply( null, args );
		}
		functions.push( fire );
		
		var args;
		
		return {
			clear: clear,
			
			now: function() {
				args = arguments;
				now();
				fire();
			},
			
			hover: function() {
				args = arguments;
				now();
				start();
			}
		};
	}
})( jQuery );


var pm, map, gonzo;  // temp hacks: only a single PolyMap at a time

var opt = { state:'us' };

var states = PolyMap.states = [
	{ "abbr":"AL", "name":"Alabama", "bounds":[[-88.4711,30.2198],[-84.8892,35.0012]] },
	{ "abbr":"AK", "name":"Alaska", "bounds":[[172.4613,51.3718],[-129.9863,71.3516]] },
	{ "abbr":"AZ", "name":"Arizona", "bounds":[[-114.8152,31.3316],[-109.0425,37.0003]] },
	{ "abbr":"AR", "name":"Arkansas", "bounds":[[-94.6162,33.0021],[-89.7034,36.5019]] },
	{ "abbr":"CA", "name":"California", "bounds":[[-124.4108,32.5366],[-114.1361,42.0062]] },
	{ "abbr":"CO", "name":"Colorado", "bounds":[[-109.0480,36.9948],[-102.0430,41.0039]] },
	{ "abbr":"CT", "name":"Connecticut", "bounds":[[-73.7272,40.9875],[-71.7993,42.0500]] },
	{ "abbr":"DE", "name":"Delaware", "bounds":[[-75.7865,38.4517],[-75.0471,39.8045]] },
	{ "abbr":"DC", "name":"District of Columbia", "bounds":[[-77.1174,38.7912],[-76.9093,38.9939]] },
	{ "abbr":"FL", "name":"Florida", "bounds":[[-87.6003,24.5457],[-80.0312,31.0030]] },
	{ "abbr":"GA", "name":"Georgia", "bounds":[[-85.6067,30.3567],[-80.8856,35.0012]] },
	{ "abbr":"HI", "name":"Hawaii", "bounds":[[-159.7644,18.9483],[-154.8078,22.2290]] },
	{ "abbr":"ID", "name":"Idaho", "bounds":[[-117.2415,41.9952],[-111.0471,49.0002]] },
	{ "abbr":"IL", "name":"Illinois", "bounds":[[-91.5108,36.9838],[-87.4962,42.5101]] },
	{ "abbr":"IN", "name":"Indiana", "bounds":[[-88.0275,37.7835],[-84.8070,41.7597]] },
	{ "abbr":"IA", "name":"Iowa", "bounds":[[-96.6372,40.3795],[-90.1635,43.5014]] },
	{ "abbr":"KS", "name":"Kansas", "bounds":[[-102.0539,36.9948],[-94.5943,40.0016]] },
	{ "abbr":"KY", "name":"Kentucky", "bounds":[[-89.4186,36.4964],[-81.9700,39.1198]] },
	{ "abbr":"LA", "name":"Louisiana", "bounds":[[-94.0412,28.9273],[-88.8162,33.0185]] },
	{ "abbr":"ME", "name":"Maine", "bounds":[[-71.0818,43.0578],[-66.9522,47.4612]] },
	{ "abbr":"MD", "name":"Maryland", "bounds":[[-79.4889,37.9149],[-75.0471,39.7223]] },
	{ "abbr":"MA", "name":"Massachusetts", "bounds":[[-73.4862,41.2668],[-69.9262,42.8880]] },
	{ "abbr":"MI", "name":"Michigan", "bounds":[[-90.4154,41.6940],[-82.4136,48.1897]] },
	{ "abbr":"MN", "name":"Minnesota", "bounds":[[-97.2287,43.5014],[-89.4898,49.3836]] },
	{ "abbr":"MS", "name":"Mississippi", "bounds":[[-91.6532,30.1815],[-88.0987,34.9957]] },
	{ "abbr":"MO", "name":"Missouri", "bounds":[[-95.7664,35.9980],[-89.1338,40.6096]] },
	{ "abbr":"MT", "name":"Montana", "bounds":[[-116.0475,44.3613],[-104.0475,49.0002]] },
	{ "abbr":"NE", "name":"Nebraska", "bounds":[[-104.0530,40.0016],[-95.3063,43.0030]] },
	{ "abbr":"NV", "name":"Nevada", "bounds":[[-120.0019,35.0012],[-114.0429,42.0007]] },
	{ "abbr":"NH", "name":"New Hampshire", "bounds":[[-72.5551,42.6963],[-70.7039,45.3033]] },
	{ "abbr":"NJ", "name":"New Jersey", "bounds":[[-75.5620,38.9336],[-73.8915,41.3599]] },
	{ "abbr":"NM", "name":"New Mexico", "bounds":[[-109.0480,31.3316],[-103.0014,37.0003]] },
	{ "abbr":"NY", "name":"New York", "bounds":[[-79.7628,40.5438],[-71.8541,45.0185]] },
	{ "abbr":"NC", "name":"North Carolina", "bounds":[[-84.3196,33.8455],[-75.5182,36.5895]] },
	{ "abbr":"ND", "name":"North Dakota", "bounds":[[-104.0475,45.9332],[-96.5606,49.0002]] },
	{ "abbr":"OH", "name":"Ohio", "bounds":[[-84.8180,38.4243],[-80.5186,41.9788]] },
	{ "abbr":"OK", "name":"Oklahoma", "bounds":[[-103.0014,33.6374],[-94.4300,37.0003]] },
	{ "abbr":"OR", "name":"Oregon", "bounds":[[-124.5532,41.9952],[-116.4638,46.2618]] },
	{ "abbr":"PA", "name":"Pennsylvania", "bounds":[[-80.5186,39.7223],[-74.6966,42.2691]] },
	{ "abbr":"PR", "name":"Puerto Rico", "bounds":[[-67.2699,17.9350],[-65.2763,18.5156]] },
	{ "abbr":"RI", "name":"Rhode Island", "bounds":[[-71.8596,41.3216],[-71.1202,42.0171]] },
	{ "abbr":"SC", "name":"South Carolina", "bounds":[[-83.3392,32.0327],[-78.5414,35.2148]] },
	{ "abbr":"SD", "name":"South Dakota", "bounds":[[-104.0585,42.4882],[-96.4346,45.9441]] },
	{ "abbr":"TN", "name":"Tennessee", "bounds":[[-90.3114,34.9847],[-81.6797,36.6771]] },
	{ "abbr":"TX", "name":"Texas", "bounds":[[-106.6162,25.8383],[-93.5154,36.5019]] },
	{ "abbr":"UT", "name":"Utah", "bounds":[[-114.0484,37.0003],[-109.0425,42.0007]] },
	{ "abbr":"VT", "name":"Vermont", "bounds":[[-73.4314,42.7291],[-71.5036,45.0130]] },
	{ "abbr":"VA", "name":"Virginia", "bounds":[[-83.6733,36.5512],[-75.2443,39.4649]] },
	{ "abbr":"WA", "name":"Washington", "bounds":[[-124.7285,45.5443],[-116.9183,49.0002]] },
	{ "abbr":"WV", "name":"West Virginia", "bounds":[[-82.6437,37.2029],[-77.7199,40.6370]] },
	{ "abbr":"WI", "name":"Wisconsin", "bounds":[[-92.8855,42.4936],[-86.9704,46.9628]] },
	{ "abbr":"WY", "name":"Wyoming", "bounds":[[-111.0525,40.9984],[-104.0530,45.0021]] }
];

var stateUS = {
	'abbr': 'US',
	'name': 'United States',
	bounds: [
		[ -124.7284, 24.5457],
		[ -66.9522, 49.3836 ]
	],
	center: [ -95.8403, 38.0049]
};

var stateCongressional = {
	'abbr': 'CONGRESSIONAL',
	'name': 'All Congressional Districts',
	bounds: [
		[ -124.7284, 24.5457 ],
		[ -66.9522, 49.3836 ]
	],
	center: [ -95.8403, 38.0049 ]
};

var stateCounties = {
	'abbr': 'COUNTY',
	'name': 'All Counties',
	bounds: [
		[ -124.7284, 24.5457 ],
		[ -66.9522, 49.3836 ]
	],
	center: [ -95.8403, 38.0049 ]
};

var statesByAbbr = {};
var statesByName = {};

states.forEach( indexState );
indexState( stateUS );
indexState( stateCongressional );
indexState( stateCounties );

function indexState( state ) {
	statesByAbbr[state.abbr] = state;
	statesByName[state.name] = state;
}

var stateByAbbr = PolyMap.stateByAbbr = function( abbr ) {
	if( typeof abbr != 'string' ) return abbr;
	return statesByAbbr[abbr.toUpperCase()];
}

function cacheUrl( url, cache, always ) {
	//if( opt.nocache  &&  ! always ) return url + '?q=' + new Date().getTime();
	//if( opt.nocache ) cache = 0;
	//if( typeof cache != 'number' ) cache = 120;
	//if( ! url.match(/^http:/) ) url = 'http://' + location.host + url;
	return url;
}

opt.state = opt.state || 'us';

var state = states[opt.state];

function contains( shape, x, y ) {
	var inside = false;
	var points = shape.points, n = points.length;
	var v = points[n-1], x1 = v[0], y1 = v[1];

	for( var i = 0;  i < n;  ++i ) {
		var v = points[i], x2 = v[0], y2 = v[1];
		
		if( ( y1 < y  &&  y2 >= y ) || ( y2 < y  &&  y1 >= y ) )
			if ( x1 + ( y - y1 ) / ( y2 - y1 ) * ( x2 - x1 ) < x )
				inside = ! inside;
		
		x1 = x2, y1 = y2;
	}
	return inside;
}

function zoomToBounds( bounds ) {
	var latlngbounds = new GLatLngBounds(
		new GLatLng( bounds[0][1], bounds[0][0] ),
		new GLatLng( bounds[1][1], bounds[1][0] )
	);
	var zoom = map.getBoundsZoomLevel( latlngbounds );
	map.setCenter( latlngbounds.getCenter(), zoom );
	//log.reset();
	//log( 'zoomToBounds return' );
}

function stateReady( state ) {
	delete pm.overWhere;
	var county = opt.county && state.geo.features.by_fips[opt.county];
	//if( ! mapplet ) map.checkResize();
	//map.clearOverlays();
	//$('script[title=jsonresult]').remove();
	//if( json.status == 'later' ) return;
	var bounds = county ? county.bounds : state.bounds;
	if( bounds ) {
		//var latpad = ( bounds[1][1] - bounds[0][1] ) / 20;
		//var lngpad = ( bounds[1][0] - bounds[0][0] ) / 20;
		//var latlngbounds = new GLatLngBounds(
		//	new GLatLng( bounds[0][1] - latpad, bounds[0][0] - lngpad ),
		//	new GLatLng( bounds[1][1] + latpad, bounds[1][0] + lngpad )
		//);
		zoomToBounds( bounds );
		polys( state, opt.county );
	}
	else {
	}
	
	function polys( state ) {
		// Let map display before drawing polys
		setTimeout( function() {
			trigger( 'load', state );
			var geo = county ? [ county ] : state.geo;
			gonzo = new PolyGonzo.GOverlay({
				//group: state,
				geo: geo,
				events: {
					mousemove: function( event, where ) {
						var feature = where && where.feature;
						if( feature ) feature.container = geo;
						trigger( 'over', feature );
					},
					click: function( event, where ) {
						var feature = where && where.feature;
						if( feature ) feature.container = geo;
						trigger( 'click', feature );
					}
				}
			});
			map.addOverlay( gonzo );
			trigger( 'redraw', state );
			drawPolys();
		}, 20 );
	}
}

function setStateByAbbr( abbr ) {
	setState( stateByAbbr(abbr) );
}

function setState( state ) {
	if( ! state ) return;
	if( typeof state == 'string' ) state = stateByAbbr( state );
	var select = $('#stateSelector')[0];
	select && ( select.selectedIndex = state.selectorIndex );
	opt.state = state.abbr.toLowerCase();
	loadState();
}

function initMap() {
	if( map ) return;
	
	if( ! GBrowserIsCompatible() ) return;
	map = new GMap2( pm.a.container );
	//zoomRegion();
	map.enableContinuousZoom();
	map.enableDoubleClickZoom();
	//map.enableGoogleBar();
	map.enableScrollWheelZoom();
	//map.addControl( new GLargeMapControl() );
	map.addControl( new GSmallMapControl() );
	
	//zoomToBounds( stateUS.bounds );
}

function drawPolys() {
	if( ! gonzo ) return;
	
	trigger( 'draw' );
	
	log.reset();
	log( 'start gonzo.redraw' );
	gonzo.redraw( null, true );
	log( 'end gonzo.redraw' );
	
	trigger( 'drew' );
}

function oneshot() {
	var timer;
	return function( fun, time ) {
		clearTimeout( timer );
		timer = setTimeout( fun, time );
	};
}

function loadState() {
	map && map.clearOverlays();
	gonzo = null;
	var abbr = opt.state;
	var state = curState = stateByAbbr( abbr );
	if( state.places ) {
		stateReady( state );
	}
	else {
		$.getJSON( ( pm.a.shapes || 'shapes/' ) + abbr.toLowerCase() + '.json', function( json ) {
			state.geo = json;
			if( state != stateUS ) json.features.indexBy('fips');
			log.reset();
			//log( 'got JSON ', abbr );
			if( state == stateUS ) loadBounds( json );
			stateReady( state );
		});
	}
}

function loadBounds( json ) {
	json.features.forEach( function( feature ) {
		stateByAbbr(feature.properties.abbr).bbox = feature.bbox;
	});
}

function trigger( event ) {
	var fn = pm.a.events && pm.a.events[event];
	fn && fn.apply( pm, Array.prototype.slice.call( arguments, 1 ) );
}

$(window).bind( 'unload', GUnload );

})( jQuery );
// end outer wrapper function