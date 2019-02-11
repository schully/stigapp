function initMap() {
	if (Modernizr.geolocation) {
		navigator.geolocation.getCurrentPosition(drawPath)
	}
}


var map
var poly

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
function initAuthentication(onAuthSuccess) {
	firebase.authAnonymously(function (error, authData) {
		if (error) {
			console.log('Login Failed!', error);
		} else {
			data.sender = authData.uid;
			onAuthSuccess();
		}
	}, { remember: 'sessionOnly' });  // Users will get a new id for every session.
}

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
	
    var adaRef = firebase.database().ref('routes')
	console.log(adaRef);
	
	//setInterval(() => {
		myLatLng = new google.maps.LatLng({ lat: position.coords.latitude, lng: position.coords.longitude })

		adaRef.push({latitude: position.coords.latitude, longitude: position.coords.longitude})
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

function addLatLng(e) {
	var path = poly.getPath()
	path.push(e.latLng)
	console.log(e.latLng);

	var marker = new google.maps.Marker({
		position: e.latLng,
		title: '#' + path.getLength(),
		animation: google.maps.Animation.BOUNCE,
		map: map
	})
}


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
	  {lat: 56.884, lng: 14.819},
	  {lat: 56.884, lng: 14.818}
	];
	var stigPath = new google.maps.Polyline({
	  path: stigCoordinates,
	  strokeColor: '#FF0000',
	  strokeOpacity: 1.0,
	  strokeWeight: 2
	});

	stigPath.setMap(map);

	infoWindow = new google.maps.InfoWindow;

	var pos = {
		lat: stigCoordinates[stigCoordinates.length/2].lat,
		lng: stigCoordinates[stigCoordinates.length/2].lng
	  };
	  
	  infoWindow.setPosition(pos);
	  infoWindow.setContent('name');
	  infoWindow.open(map);


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
