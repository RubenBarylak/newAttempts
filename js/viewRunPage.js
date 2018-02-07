// Code for the View Run page.

//Creating variables
var runIndex = null;
var run = null;

if (typeof (Storage) !== "undefined") {
	runIndex = localStorage.getItem(APP_PREFIX + "-selectedRun");
	savedRuns = JSON.parse(localStorage.getItem(APP_PREFIX + '-runs'));
	
	if (runIndex !== null) {
		localStorage.removeItem(APP_PREFIX + "-selectedRun");		
	}
} else {
	console.log("Error: localStorage is not supported by current browser.");
}

//Creating a function to load the runs
function loadRunDetails() {
	if (runIndex !== null && savedRuns !== null)
	{
        
        //Initialising class
		run  = new Run();
		run.initialiseFromRunPDO(savedRuns[runIndex]);
		document.getElementById("headerBarTitle").textContent = run.startTime.toDateString() + " @ " + run.startTime.toLocaleTimeString();
		
		var distanceTravelled = run.distanceTravelled;
		var travelDuration = run.travelDuration;
        
        
		//Displaying the information of the run on the screen
		document.getElementById("distance").innerHTML = distanceTravelled.toFixed(2);
		document.getElementById("duration").innerHTML = travelDuration.toFixed(2);
		document.getElementById("averageSpeed").innerHTML = (distanceTravelled/travelDuration).toFixed(2);
		document.getElementById("reattemptRun").disabled = false;
		
		var map = new google.maps.Map(document.getElementById('map'),{
			center: run.startLocation,
			zoom: 17
		});
        
        
		//displaying the plotted line of the run on the map when the user user view the runs
		var pathPolyLine = new google.maps.Polyline({
			path: run.arrayLocations,
			geodesic: true,
			strokeColor: '#FF0000',
			strokeOpacity: 1.0,
			strokeWeight: 2
		});

		pathPolyLine.setMap(map);
	}
}


//Creating a function to delete a run
function removeRun()
{
	if (runIndex !== null)
	{
		var proceedRemove = confirm('This run will be deleted. Are you sure?');
		
        
        //checking if the user agreed to delete a run 
		if(proceedRemove) {
			if (typeof (Storage) !== "undefined") {
				savedRuns.splice(runIndex, 1);
				
				var data = JSON.stringify(savedRuns);
				localStorage.setItem(APP_PREFIX + '-runs', data);
					
				location.href = 'index.html';
			} else {
				console.log("Error: localStorage is not supported by current browser.");
			}
		}
	}
}

//Creating a function to reattemp a run
function reattemptRun() {
	localStorage.setItem(APP_PREFIX + "-reRun", runIndex);
    location.href = 'newRun.html';
}