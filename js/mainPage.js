// Code for the main app page (Past Runs list).
var runsListhtml  = document.getElementById("runsList");

if (typeof (Storage) !== "undefined") {
	savedRuns = JSON.parse(localStorage.getItem(APP_PREFIX + '-runs'));
} else {
	console.log("Error: localStorage is not supported by current browser.");
}

// NOTE: Retrieve all runs.
function loadRuns() {
	if(savedRuns !== null) {		
		var runCount = savedRuns.length;

		for (var i = 0; i < runCount; i++) {
			var run = new Run();
			run.initialiseFromRunPDO(savedRuns[i]);
            
            //Displaying the name of runs in date and time format
			runsListhtml.innerHTML += "<li class=\"mdl-list__item mdl-list__item--two-line\" onclick=\"viewRun(" +  i + ");\"><span class=\"mdl-list__item-primary-content\"><span>" + run.startTime.toDateString() + " @ " + run.startTime.toLocaleTimeString() + "</span><span class=\"mdl-list__item-sub-title\">" + run.distanceTravelled + "m in " + run.travelDuration + "sec.</span></span></li>";
		}
	}
}

// Creating a function so that the user can view the runs
function viewRun(runIndex) {
    // Saving the desired run to local storage so it can be accessed from View Run page.
    localStorage.setItem(APP_PREFIX + "-selectedRun", runIndex);
    
	// loading the View Run page.
    location.href = 'viewRun.html';
}
