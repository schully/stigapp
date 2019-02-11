function initMap() {
    if (Modernizr.geolocation) {
        navigator.geolocation.getCurrentPosition(loadMap)
    }
}


var map
var poly

var provider = new firebase.auth.GoogleAuthProvider()

var data = {
    sender: null,
    timestamp: null,
    lat: null,
    lng: null
}

/**
 * Starting point for running the program. Authenticates the user.
 * @param {function} Called when authentication succeeds.
 */
function initAuthentication() {

    firebase.auth().signInWithPopup(provider).then(result => {
        var token = result.credential.accessToken
        console.log('token: ' + token)

        var user = result.user.email
        console.log('user: ' + user)

    }).catch(error => {
        var errorCode = error.code
        var errorMessage = error.message
        var email = error.email
        var credential = error.credential
    })

}

function toggleAuthentication() {
    let signedIn = !!firebase.auth().currentUser

    if (signedIn) {
        firebase.auth().signOut()
    } else {
        initAuthentication()
    }
}



window.addEventListener('load', () => {
    console.log("window.addEventListener load")
    firebase.auth().onAuthStateChanged(u => {
        console.log("onUseruChagneru", u)

        let signedIn = u != null;

        let signInButton = document.getElementById('sign-in-btn')
        if (signedIn) {
            signInButton.innerText = "Sign out"
        } else {
            signInButton.innerText = "Sign in"
        }
    })
});

/**
 * Adds a click to firebase.
 * @param {Object} data The data to be added to firebase.
 *     It contains the lat, lng, sender and timestamp.
 */




function loadMap(position) {
    latitude = position.coords.latitude
    longitude = position.coords.longitude

    console.log(latitude + " : " + longitude)

    var dasPos = { lat: latitude, lng: longitude }
    console.log(dasPos);

    map = new google.maps.Map(document.getElementById('map'), {
        center: dasPos,
        zoom: 17,
        gestureHandling: 'greedy',
        styles: mapStyles
    })


    poly = new google.maps.Polyline({
        strokeColor: '#FA0909',
        strokeOpacity: 0.95,
        strokeWeight: 1
    })
    poly.setMap(map)
    map.addListener('click', addLatLng)

    //setInterval(() => {
    myLatLng = new google.maps.LatLng({ lat: position.coords.latitude, lng: position.coords.longitude })

    var path = poly.getPath()
    path.push(myLatLng)
    console.log(myLatLng);

    var marker = new google.maps.Marker({
        position: myLatLng,
        title: '#' + path.getLength(),
        animation: google.maps.Animation.BOUNCE,
        map: map
    })
    //}, 5000)

}

function listenForRoutes() {
    firebase.database().ref('routes').on('value', snapshot => {
        let routes = snapshot.val();

        console.log("routes", routes);


        var megaPolyLine = new google.maps.Polyline({
            strokeColor: '#FA0909',
            strokeOpacity: 0.95,
            strokeWeight: 1
        });
        megaPolyLine.setMap(map)
        let path = megaPolyLine.getPath()

        for (var routeId in routes) {
            let coordinates = routes[routeId].coordinates;

            for (var coordinate of coordinates) {
                path.push(new google.maps.LatLng(coordinate.latitude, coordinate.longitude))
            }
        }
    })
}

/**
 * Array of coordinates of the currently recorded route.
 */
var routeRecording = [];
var isRecordingRoute = false;
function toggleRecordRoute() {
    if (isRecordingRoute) {
        stopRecordRoute();
    } else {
        startRecordRoute();
    }
}

function startRecordRoute() {
    document.getElementById('record-route-btn').innerText = "Stop recording";
    routeRecording = []
    isRecordingRoute = true;
}

function stopRecordRoute() {
    document.getElementById('record-route-btn').innerText = "Start recording";

    pushRecordedRoute();
    routeRecording = []
    isRecordingRoute = false;
}

/**
 * Pushes the recorded route to firebase.
 */
function pushRecordedRoute() {
    let name = prompt("Vad ska vi kalla stigen?");

    firebase.database().ref('routes').push({
        coordinates: routeRecording,
        name
    })
}

function addLatLng(e) {
    let latLng = e.latLng;
    let latitude = latLng.lat();
    let longitude = latLng.lng();

    var path = poly.getPath()
    path.push(latLng)
    console.log(latLng);

    if (isRecordingRoute) {
        routeRecording.push({
            latitude,
            longitude
        })
    }

    /*var marker = new google.maps.Marker({
        position: e.latLng,
        title: '#' + path.getLength(),
        animation: google.maps.Animation.BOUNCE,
        map: map
    })*/
}

window.addEventListener('load', listenForRoutes);

function drawPath(position) {
	
	latitude = position.coords.latitude
	longitude = position.coords.longitude

	console.log(latitude + " : " + longitude)

	var dasPos = { lat: latitude, lng: longitude }
	console.log(dasPos);

	map = new google.maps.Map(document.getElementById('map'), {
		center: dasPos,
		zoom: 17,
		gestureHandling: 'greedy',
		styles: mapStyles
	})

	var stigCoordinates = [
	  {lat: 56.882, lng: 14.817},
	  {lat: 56.883, lng: 14.817},
	  {lat: 56.883, lng: 14.818},
	  {lat: 56.884, lng: 14.819}
	];
	var stigPath = new google.maps.Polyline({
	  path: stigCoordinates,
	  strokeColor: '#FF0000',
	  strokeOpacity: 1.0,
	  strokeWeight: 2
	});

	stigPath.setMap(map);
  }

function setPath(position) {
	latitude = position.coords.latitude
	longitude = position.coords.longitude

	console.log(latitude + " : " + longitude)

	var dasPos = { lat: latitude, lng: longitude }
	console.log(dasPos);

    map = new google.maps.Map(document.getElementById('map'), {
        center: dasPos,
		zoom: 17,
		gestureHandling: 'greedy',
		styles: mapStyles
    });
    poly = new google.maps.Polyline({
        strokeColor: '#000000',
        strokeOpacity: 1.0,
        strokeWeight: 3
    });
    poly.setMap(map);
    // Add a listener for the click event
    map.addListener('click', addLatLng);
}

    // Handles click events on a map, and adds a new point to the Polyline.
function addLatLng(event) {
    var path = poly.getPath();

    // Because path is an MVCArray, we can simply append a new coordinate
    // and it will automatically appear.
    path.push(event.latLng);

    // Add a new marker at the new plotted point on the polyline.
    var marker = new google.maps.Marker({
        position: event.latLng,
        title: '#' + path.getLength(),
        map: map
    });
}


var mapStyles = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    {
        featureType: 'administrative.locality',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
    },
    {
        featureType: 'poi',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
    },
    {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#263c3f' }]
    },
    {
        featureType: 'poi.park',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#6b9a76' }]
    },
    {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#38414e' }]
    },
    {
        featureType: 'road',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#212a37' }]
    },
    {
        featureType: 'road',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#9ca5b3' }]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry',
        stylers: [{ color: '#746855' }]
    },
    {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ color: '#1f2835' }]
    },
    {
        featureType: 'road.highway',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#f3d19c' }]
    },
    {
        featureType: 'transit',
        elementType: 'geometry',
        stylers: [{ color: '#2f3948' }]
    },
    {
        featureType: 'transit.station',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#d59563' }]
    },
    {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#17263c' }]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#515c6d' }]
    },
    {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{ color: '#17263c' }]
    }
]
