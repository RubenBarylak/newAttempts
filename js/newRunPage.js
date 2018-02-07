// Global variable to hold map reference, so we can use it in other functions.
const ACCURACY_THRESHOLD = 21; 
const DISTANCE_THRESHOLD = 10;

var map = null;
var geolocationWatchID = null;
var currentPosition = null;
var destinationPosition = null;
var currentMarker = null;
var destinationMarker = null;
var accuracyCircle = null;
var distanceToDestination = null;
var distanceFromStart = null;
var newRun = null;
var trackRunTimer = null;
var trackDestinationTimer = null;
var runOnce = true;
var oldRun = null;


if (typeof (Storage) !== "undefined") {
	var runIndex = localStorage.getItem(APP_PREFIX + "-reRun");
	savedRuns = JSON.parse(localStorage.getItem(APP_PREFIX + '-runs'));
	
	if (runIndex !== null) {
		localStorage.removeItem(APP_PREFIX + "-reRun");	
		
		if (savedRuns !== null) {
			oldRun = savedRuns[runIndex];
		}
	}

} else {
	console.log("Error: localStorage is not supported by current browser.");
}

r(function(){
    geolocate();
});
function r(f){/in/.test(document.readyState)?setTimeout('r('+f+')',9):f()}


//getting the random destination
function randomDestination(position) {	
	document.getElementById("beginRun").disabled = true;
	
	// NOTE: Distance from current position must 60m to 150m away    
	var randomPosition = null;
	var max = 0.001;
    var min = -0.001;
    var positiveNegativeArray = [-1, 1];
	var rand = null;
	var distance = 0;
	
    //using the do-while loop so that the distance of the destination is always greater than 60m and less than 150m
	do {
		rand = positiveNegativeArray[Math.floor(Math.random() * positiveNegativeArray.length)];
        
        
        //formula to calculate the distnace of random destination
		randomPosition = {
			lat: ((Math.random() * (max - min)) + min) + position.lat,
			lng: ((Math.random() * (max - min)) + min) + position.lng
		}
		
		distance = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(currentPosition), new google.maps.LatLng(randomPosition));
    }
	while(distance > 150 || distance < 60);

	document.getElementById("beginRun").disabled = false;
    
	console.log(randomPosition);

    return randomPosition;
}


//creating a function to start a run
function startRun() {
    document.getElementById("selectDestination").disabled = true;
    document.getElementById("beginRun").disabled = true;

	var startPosition = new google.maps.LatLng(currentPosition);
	newRun = new Run(startPosition, new google.maps.LatLng(destinationPosition), new Array(startPosition) , new Date(), null);
	trackRunTimer = setInterval(trackRun, 1000);
}

//Creating a function to track a run

function trackRun() {

	//Pushing the current location in an array
	newRun.arrayLocations.push(new google.maps.LatLng(currentPosition));
	
    map.setCenter({
        lat: currentPosition.lat,
        lng: currentPosition.lng
    });
	
    //Setting the position of current marker
    currentMarker.setPosition({
        lat: currentPosition.lat,
        lng: currentPosition.lng
    });
    
    //calling drawpolyline function to draw a line on the map as the user runs
	drawPolyLine();
    
    //calculating the distance travelled from start location

    distanceFromStart = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(currentPosition), newRun.startLocation);
    
	document.getElementById("distanceFromStart").innerHTML = distanceFromStart.toFixed(2);

    //If statement to check if the distance to destination is less than or equal to 10 meters to stop the run automatically
    if (distanceToDestination <= DISTANCE_THRESHOLD) {
		stopRun();
        
		document.getElementById("saveRun").disabled = false;
    } else {
        
        //Making the save run button enabled
		document.getElementById("saveRun").disabled = true;
	}
}

//Creating a function which draws a line on the map

function drawPolyLine() {
    var pathPolyLine = new google.maps.Polyline({
        path: newRun.arrayLocations,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

    pathPolyLine.setMap(map);
}


//creating a function to stop a run
function stopRun() {
	newRun.endTime = new Date();
	navigator.geolocation.clearWatch(geolocationWatchID);
    clearInterval(trackRunTimer);
    clearInterval(trackDestinationTimer);
	displayMessage('Run completed ' + newRun.distanceTravelled + 'm in ' + newRun.travelDuration + 'sec.')
	console.log(newRun.distanceTravelled)
	console.log(newRun.travelDuration)
	console.log("Run stopped.");
}



// Map Initialization callback.  Will be called when Maps API loads.
function initMap() {
    // Enabling new cartography and themes
    google.maps.visualRefresh = true;

    // Initialize map, centered on Melbourne, Australia.
    map = new google.maps.Map(document.getElementById('map'),{
 
        zoom: 17
    });

    // Choosing our marker display and layout
    var currentMarkerOption = {
        position: map.getCenter(),
        icon: {
            fillColor: "blue",
            fillOpacity: 1,
            path: google.maps.SymbolPath.CIRCLE,
            strokeColor: "blue",
            scale: 3
        },
        draggable: false,
        map: map
    };

    // Creating the destination marker location
    var destinationMarkerOption = {
        position: map.getCenter(),
        icon: {
            fillColor: "red",
            fillOpacity: 1,
            path: google.maps.SymbolPath.CIRCLE,
            strokeColor: "red",
            scale: 3
        },
        draggable: false,
        map: map
    };

    // Displaying the Marker on the Map
    destinationMarker = new google.maps.Marker(destinationMarkerOption);
    currentMarker = new google.maps.Marker(currentMarkerOption);

    // Add circle overlay and bind to marker
    accuracyCircle = new google.maps.Circle({
        map: map,
        fillColor: 'blue',
        strokeColor: 'blue',
        strokeOpacity: 0.5,
        strokeWeight: 2
    });

    accuracyCircle.bindTo('center', currentMarker, 'position');

    // Geolocation is a functionality that comes from the navigator library. This library comes from the Google Maps API
    // this line checks to see whether the device has GPS functionality.
}

function geolocate() {
    if ("geolocation"in navigator) {
        // Here, properties are assigned to a new object. These properties are specifiable options which are passed into the geolocationWatchID variable
        var positionOptions = {
            enableHighAccuracy: false,
            timeout: 60000,
            maximumAge: 0
        };
		
        // this variable addresses the watchPosition functionality in geolocation which is in the navigator library. The functionality takes three arguments, as seen below.
        geolocationWatchID = navigator.geolocation.watchPosition(showCurrentPosition, errorHandler, positionOptions);
		displayMessage('Determining location. Please wait...', 1000);		
    } else {
		displayMessage('No GPS detected on device');
        console.log('No GPS detected on device');
    }
}

//Creating a function to get the user's location and accuracy
//Displaying the user's location
function showCurrentPosition(position) {
    console.log(position);
    
    currentPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.coords.timestamp
    };

    map.setCenter({
        lat: currentPosition.lat,
        lng: currentPosition.lng
    });

    currentMarker.setPosition({
        lat: currentPosition.lat,
        lng: currentPosition.lng
    });

    accuracyCircle.setRadius(currentPosition.accuracy);
	console.log(currentPosition.accuracy);

//Checking if the accuracy is high to make the select Destination button enabled	
	if (currentPosition.accuracy < ACCURACY_THRESHOLD) {
		if (runOnce) {
			if(oldRun === null) {
				document.getElementById("selectDestination").disabled = false;
			} else {
				showDestinationPosition({lat: oldRun._destinationLocation.lat, lng: oldRun._destinationLocation.lng});			
			} 
			
			displayMessage("Location now accurate enough.", 1000);
			runOnce = false;
		}

		if (oldRun !== null) {
			distanceFromStart = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(currentPosition), new google.maps.LatLng({lat: oldRun._startLocation.lat, lng: oldRun._startLocation.lng}));
			
			if (true) {
				document.getElementById("beginRun").disabled = false;
				displayMessage('You may begin run.', 1000);	
				oldRun = null;
			}
		}	
	}
	
	return position;
}


//Function to show destination position
function showDestinationPosition(position) {
	destinationPosition = position;
	
	trackRunDestinationTimer = setInterval(trackDestination, 100);
	
	map.setCenter({
        lat: position.lat,
        lng: position.lng
    });
	
    destinationMarker.setPosition({
        lat: position.lat,
        lng: position.lng
    });
}

//creating a function to calculate the distance to destination from start location
function trackDestination() {
	distanceToDestination = google.maps.geometry.spherical.computeDistanceBetween(new google.maps.LatLng(currentPosition), new google.maps.LatLng(destinationPosition));
    document.getElementById("distanceToDestination").innerHTML = distanceToDestination.toFixed(2);	
}

//Creating a function to check different conditions if the browser is not able to get user's location and display error message
function errorHandler(error) {
    var errorType = {
        0: "Unknown Error",
        1: "Permission Denied by user",
        2: "Position of the user isn't available",
        3: "Request timed out"
    };
	
    var errorMessage = errorType[error.code];

	console.log(errorMessage);
}