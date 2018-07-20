if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

			THREE.Cache.enabled = true;

			var container, stats, permalink, hex, color;

			var camera, cameraTarget, scene, renderer;

			var group, textMesh1, textMesh2, textGeo, materials;
			var congrats = false;

			var posY = -100;

			var rot, vel, acc;

			var freq = 80;

			var sphere;

			// create web audio api context
			var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

			var gainNode = audioCtx.createGain();
			gainNode.gain.value = 1;

			var oscillator = audioCtx.createOscillator();			

			oscillator.type = 'sine';			
			
			oscillator.connect(gainNode);
			gainNode.connect(audioCtx.destination);
			oscillator.start();

			var firstLetter = true;

			var text = "ciao danielo",

				height = 30,
				size = 20,
				hover = 100,

				curveSegments = 4,

				bevelThickness = 2,
				bevelSize = 1.5,
				bevelSegments = 3,
				bevelEnabled = true,

				font = undefined,

				fontName = "optimer", // helvetiker, optimer, gentilis, droid sans, droid serif
				fontWeight = "bold"; // normal bold

			var mirror = false;

			var fontMap = {

				"helvetiker": 0,
				"optimer": 1,
				"gentilis": 2,
				"droid/droid_sans": 3,
				"droid/droid_serif": 4

			};

			var weightMap = {

				"regular": 0,
				"bold": 1

			};

			var reverseFontMap = [];
			var reverseWeightMap = [];

			for ( var i in fontMap ) reverseFontMap[ fontMap[i] ] = i;
			for ( var i in weightMap ) reverseWeightMap[ weightMap[i] ] = i;

			var targetRotation = 0;
			var targetRotationOnMouseDown = 0;

			var mouseX = 0;
			var mouseXOnMouseDown = 0;

			var windowHalfX = window.innerWidth / 2;
			var windowHalfY = window.innerHeight / 2;

			var fontIndex = 1;

			init();
			animate();

			function decimalToHex( d ) {

				var hex = Number( d ).toString( 16 );
				hex = "000000".substr( 0, 6 - hex.length ) + hex;
				return hex.toUpperCase();

			}

			function init() {

				rot = new THREE.Vector2( 0, 0);				
				vel = new THREE.Vector2( 0, 0);				
				acc = new THREE.Vector2( 0, 0);				

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				permalink = document.getElementById( "permalink" );

				// CAMERA

				camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1500 );
				camera.position.set( 0, 400, 700 );

				cameraTarget = new THREE.Vector3( 0, 150, 0 );

				// SCENE

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0xFFFFFF );
				// scene.fog = new THREE.Fog( 0xFFFFFF, 250, 1400 );

				// LIGHTS

				var pointLight = new THREE.PointLight( 0xffffff, 1.5 );
				pointLight.position.set( 0, 500, 90 );			
				scene.add( pointLight );

				// Get text from hash

				var hash = document.location.hash.substr( 1 );

				if ( hash.length !== 0 ) {

					var colorhash  = hash.substring( 0, 6 );
					var fonthash   = hash.substring( 6, 7 );
					var weighthash = hash.substring( 7, 8 );
					var bevelhash  = hash.substring( 8, 9 );
					var texthash   = hash.substring( 10 );

					// hex = colorhash;
					// pointLight.color.setHex( parseInt( colorhash, 16 ) );

					fontName = reverseFontMap[ parseInt( fonthash ) ];
					fontWeight = reverseWeightMap[ parseInt( weighthash ) ];

					bevelEnabled = parseInt( bevelhash );

					text = decodeURI( texthash );

					// updatePermalink();

				} else {

					// pointLight.color.setHSL( Math.random(), 1, 0.5 );
					// hex = decimalToHex( pointLight.color.getHex() );

				}				

				var texture = new THREE.TextureLoader().load( "t3.png" );
				texture.wrapS = THREE.RepeatWrapping;
				texture.wrapT = THREE.RepeatWrapping;
				// texture.repeat.set( 2, 2 );

				var geometry = new THREE.SphereGeometry( 100, 32, 32 );
				var m1 = new THREE.MeshPhongMaterial( { 
				    color: 0xffffff, 				    
				    shininess: 100,
				    map:texture
				} )
				var material = new THREE.MeshBasicMaterial( {map:texture} );
				sphere = new THREE.Mesh( geometry, material );				
				scene.add( sphere );

				materials = [
					// new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
					// new THREE.MeshPhongMaterial( { color: 0xffffff } ) // side
					new THREE.MeshPhongMaterial( {
					    color: 0xffff00,
					    specular:0xffffff,					    
					    combine: THREE.MultiplyOperation,
					    shininess: 50,
					    reflectivity: 1.0,					    
					}),

					new THREE.MeshPhongMaterial( {
					    color: 0xffff00,
					    specular:0xffffff,					    
					    combine: THREE.MultiplyOperation,
					    shininess: 50,
					    reflectivity: 1.0,					    
					}),
				];

				group = new THREE.Group();
				group.position.y = 10;
				group.position.x = 0;
				group.position.z = 180;

				scene.add( group );
				group.visible = false

				loadFont();

				var plane = new THREE.Mesh(
					new THREE.PlaneBufferGeometry( 10000, 10000 ),
					new THREE.MeshBasicMaterial( { color: 0xffffff } )
				);
				plane.position.y = 100;
				plane.rotation.x = - Math.PI / 2;
				scene.add( plane );

				// RENDERER

				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				container.appendChild( renderer.domElement );

				// STATS

				stats = new Stats();
				//container.appendChild( stats.dom );

				// EVENTS

				document.addEventListener( 'mousedown', onDocumentMouseDown, false );
				document.addEventListener( 'touchstart', onDocumentTouchStart, false );
				document.addEventListener( 'touchmove', onDocumentTouchMove, false );
				document.addEventListener( 'keypress', onDocumentKeyPress, false );
				document.addEventListener( 'keydown', onDocumentKeyDown, false );

				// document.getElementById( "color" ).addEventListener( 'click', function() {

					// pointLight.color.setHSL( Math.random(), 1, 0.5 );
					// hex = decimalToHex( pointLight.color.getHex() );

					// updatePermalink();

				// }, false );

				// document.getElementById( "font" ).addEventListener( 'click', function() {

				// 	fontIndex ++;

				// 	fontName = reverseFontMap[ fontIndex % reverseFontMap.length ];

				// 	loadFont();

				// }, false );


				// document.getElementById( "weight" ).addEventListener( 'click', function() {

				// 	if ( fontWeight === "bold" ) {

				// 		fontWeight = "regular";

				// 	} else {

				// 		fontWeight = "bold";

				// 	}

				// 	loadFont();

				// }, false );

				// document.getElementById( "bevel" ).addEventListener( 'click', function() {

				// 	bevelEnabled = !bevelEnabled;

				// 	refreshText();

				// }, false );

				//

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				windowHalfX = window.innerWidth / 2;
				windowHalfY = window.innerHeight / 2;

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			//

			function boolToNum( b ) {

				return b ? 1 : 0;

			}

			function updatePermalink() {

				var link = hex + fontMap[ fontName ] + weightMap[ fontWeight ] + boolToNum( bevelEnabled ) + "#" + encodeURI( text );

				permalink.href = "#" + link;
				window.location.hash = link;

			}

			function onDocumentKeyDown( event ) {

				if ( firstLetter ) {

					firstLetter = false;
					text = "";

				}

				var keyCode = event.keyCode;

				// backspace

				if ( keyCode == 8 ) {

					event.preventDefault();

					text = text.substring( 0, text.length - 1 );
					refreshText();

					return false;

				}

			}

			function onDocumentKeyPress( event ) {

				var keyCode = event.which;

				// backspace

				if ( keyCode == 8 ) {

					event.preventDefault();

				} else {

					var ch = String.fromCharCode( keyCode );
					text += ch;

					refreshText();

				}

			}

			function loadFont() {

				var loader = new THREE.FontLoader();
				loader.load( 'fonts/' + fontName + '_' + fontWeight + '.typeface.json', function ( response ) {

					font = response;

					refreshText();

				} );

			}

			function createText() {

				textGeo = new THREE.TextGeometry( text, {

					font: font,

					size: size,
					height: height,
					curveSegments: curveSegments,

					bevelThickness: bevelThickness,
					bevelSize: bevelSize,
					bevelEnabled: bevelEnabled

				});

				textGeo.computeBoundingBox();
				textGeo.computeVertexNormals();

				// "fix" side normals by removing z-component of normals for side faces
				// (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

				if ( ! bevelEnabled ) {

					var triangleAreaHeuristics = 0.1 * ( height * size );

					for ( var i = 0; i < textGeo.faces.length; i ++ ) {

						var face = textGeo.faces[ i ];

						if ( face.materialIndex == 1 ) {

							for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

								face.vertexNormals[ j ].z = 0;
								face.vertexNormals[ j ].normalize();

							}

							var va = textGeo.vertices[ face.a ];
							var vb = textGeo.vertices[ face.b ];
							var vc = textGeo.vertices[ face.c ];

							var s = THREE.GeometryUtils.triangleArea( va, vb, vc );

							if ( s > triangleAreaHeuristics ) {

								for ( var j = 0; j < face.vertexNormals.length; j ++ ) {

									face.vertexNormals[ j ].copy( face.normal );

								}

							}

						}

					}

				}

				var centerOffset = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

				textMesh1 = new THREE.Mesh( textGeo, materials );

				textMesh1.position.x = centerOffset;
				textMesh1.position.y = hover;
				textMesh1.position.z = 0;

				textMesh1.rotation.x = 0;
				textMesh1.rotation.y = Math.PI * 2;

				group.add( textMesh1 );

				if ( mirror ) {

					textMesh2 = new THREE.Mesh( textGeo, materials );

					textMesh2.position.x = centerOffset;
					textMesh2.position.y = -hover;
					textMesh2.position.z = height;

					textMesh2.rotation.x = Math.PI;
					textMesh2.rotation.y = Math.PI * 2;

					group.add( textMesh2 );

				}

			}

			function refreshText() {

				// updatePermalink();

				group.remove( textMesh1 );
				if ( mirror ) group.remove( textMesh2 );

				if ( !text ) return;

				createText();

			}

			function onDocumentMouseDown( event ) {

				event.preventDefault();

				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				document.addEventListener( 'mouseup', onDocumentMouseUp, false );
				document.addEventListener( 'mouseout', onDocumentMouseOut, false );

				mouseXOnMouseDown = event.clientX - windowHalfX;
				targetRotationOnMouseDown = targetRotation;

			}

			function onDocumentMouseMove( event ) {

				mouseX = event.clientX - windowHalfX;

				targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;

			}

			function onDocumentMouseUp( event ) {

				document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
				document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
				document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

			}

			function onDocumentMouseOut( event ) {

				document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
				document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
				document.removeEventListener( 'mouseout', onDocumentMouseOut, false );

			}

			function onDocumentTouchStart( event ) {

				if ( event.touches.length == 1 ) {

					event.preventDefault();

					mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
					targetRotationOnMouseDown = targetRotation;

				}

			}

			function onDocumentTouchMove( event ) {

				if ( event.touches.length == 1 ) {

					event.preventDefault();

					mouseX = event.touches[ 0 ].pageX - windowHalfX;
					targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

				}

			}

			//

			function animate() {

				requestAnimationFrame( animate );

				render();
				stats.update();

			}

			function render() {

				vel.add(acc)
				rot.add(vel)
				acc.multiplyScalar(0)								
				sphere.rotation.y = rot.x;

				if (sphere.position.y > 200) {
					congrats = true;
					group.visible = true;
				}

				if (congrats) {
					sphere.position.y = 200;						
				} else {
					sphere.position.y = -vel.x*100;													
					vel.multiplyScalar(0.995)				
				}
				
				oscillator.frequency.setValueAtTime(vel.x*800, audioCtx.currentTime); // value in hertz			
				gainNode.gain.value = vel.x;


				// group.rotation.y += ( targetRotation - group.rotation.y ) * 0.05;
				group.rotation.y += 0.015;

				camera.lookAt( cameraTarget );

				renderer.clear();
				renderer.render( scene, camera );



			}

			var container = document.body
		if (container.addEventListener) {
			// IE9, Chrome, Safari, Opera
			container.addEventListener("mousewheel", MouseWheelHandler, false);
			// Firefox
			container.addEventListener("DOMMouseScroll", MouseWheelHandler, false);
		}
		// IE 6/7/8
		else container.attachEvent("onmousewheel", MouseWheelHandler);

		function MouseWheelHandler(e) {
			if (e.deltaY < 0) {		    
			// mesh.rotation.y = mesh.rotation.y+0.15; 		    
			acc.x+= 0.01;
		  }
		  if (e.deltaY > 0) {		    
		  	console.log("-")
		  	acc.x-= 0.01;
		   // mesh.rotation.y = mesh.rotation.y-0.15; 		    
		  }		  
		}

document.addEventListener('touchstart', handleTouchStart, false);        
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;                                                        
var yDown = null;                                                        

function handleTouchStart(evt) {                                         
    xDown = evt.touches[0].clientX;                                      
    yDown = evt.touches[0].clientY;                                      
};                                                

function handleTouchMove(evt) {
    if ( ! xDown || ! yDown ) {
        return;
    }

    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
        if ( xDiff > 0 ) {
            /* left swipe */ 
        } else {
            /* right swipe */
        }                       
    } else {
        if ( yDiff > 0 ) {
            /* up swipe */ 
		acc.x+= 0.07;
        } else { 
            /* down swipe */
		acc.x-= 0.07;
        }                                                                 
    }
    /* reset values */
    xDown = null;
    yDown = null;                                             
};


// document.addEventListener("touchmove", ScrollStart, false);
// document.addEventListener("scroll", Scroll, false);

// function ScrollStart() {
//     //start of scroll event for iOS
// 	acc.x+= 0.02;
// }

// function Scroll() {
//     //end of scroll event for iOS
//     //and
//     //start/end of scroll event for other browsers
// 	acc.x+= 0.02;
// }
