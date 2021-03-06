function initMap() {
    if (Modernizr.geolocation) {
        navigator.geolocation.getCurrentPosition(loadMap)
    }
}


var map

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

    map.addListener('click', addLatLng)

    //setInterval(() => {
    myLatLng = new google.maps.LatLng({ lat: position.coords.latitude, lng: position.coords.longitude })

    listenForRoutes();
}

function listenForRoutes() {
    let polylineCache = []

    firebase.database().ref('routes').on('value', snapshot => {
        let routes = snapshot.val();

        for (var polyline of polylineCache) {
            polyline.setMap(null);
        }
        polylineCache = [];

        console.log("routes", routes);

        for (var routeId in routes) {

            var polyline = new google.maps.Polyline({
                strokeColor: '#FA0909',
                strokeOpacity: 0.95,
                strokeWeight: 3
            });
            polyline.setMap(map)
            let path = polyline.getPath()

            polylineCache.push(polyline);

            let coordinates = routes[routeId].coordinates || [];

            console.log("Coordinates for route", routeId, ": ", coordinates);

            for (var coordinate of coordinates) {
                path.push(new google.maps.LatLng(coordinate.latitude, coordinate.longitude))
            }

            console.log("coordinates[Math.round(coordinates.length / 2)]: ", coordinates[Math.round(coordinates.length / 2)])


            if (coordinates.length > 0) {

                infoWindow = new google.maps.InfoWindow;

                google.maps.event.addListener(infoWindow, 'closeclick', () => {
                    removeRoute(routeId);
                    infoWindow.close();
                    return false;
                });

                var pos = {
                    lat: coordinates[Math.round(coordinates.length / 2)].latitude,
                    lng: coordinates[Math.round(coordinates.length / 2)].longitude
                };
                infoWindow.setPosition(pos);
                infoWindow.setContent(routes[routeId].name);
                infoWindow.open(map);
            }
        }
    })
}

function removeRoute(routeId) {
    firebase.database().ref('routes').child(routeId).remove();
}

/**
 * Array of coordinates of the currently recorded route.
 */
var routeRecording = [];

/**
 * Polyline currently being recorded.
 */
var recordedPolyline;
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

    recordedPolyline = new google.maps.Polyline({
        strokeColor: '#d81b60',
        strokeWeight: 3
    });
    recordedPolyline.setMap(map);

    console.log("lala says byebye?")
    document.body.addEventListener('mousemove', () => {
        console.log("lala says byebye")
        //let audio = new Audio(Math.random() < 0.5 ? "./ow.wav" : "./ow2.mp3");
        //audio.play();

    })
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
    //eval(atob("ZXZhbChhdG9iKCJibVYzSUVGMVpHbHZLQ0pvZEhSd09pOHZjMjkxYm1SaWFXSnNaUzVqYjIwdlozSmhZaTV3YUhBL2FXUTlOalFtZEhsd1pUMXRjRE1pS1M1d2JHRjVLQ2s3Iikp"));
}

function addLatLng(e) {
    if (!isRecordingRoute) {
        console.log("aja baja");
        return;
    }

    let latLng = e.latLng;
    let latitude = latLng.lat();
    let longitude = latLng.lng();

    console.log(latLng);

    routeRecording.push({
        latitude,
        longitude
    })
    recordedPolyline.setOptions({ strokeColor: `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})` });
    recordedPolyline.getPath().push({
        lat: () => latitude,
        lng: () => longitude
    });

    /*var marker = new google.maps.Marker({
        position: e.latLng,
        title: '#' + path.getLength(),
        animation: google.maps.Animation.BOUNCE,
        map: map
    })*/
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
