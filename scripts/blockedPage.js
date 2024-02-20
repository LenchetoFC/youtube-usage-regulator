// Author: Lorenzo Ramirez
// Purpose: To handle the fetch json data for the blocked page

// Fetch the settings.json file
fetch('/settings/settings.json')
  .then(response => response.json()) // Parse the JSON from the response
  .then(data => { // Use the parsed JSON data
    console.log(data); // Log the data for debugging

    // Set the innerHTML of the 'usage-today' and 'usage-all-time' elements to the corresponding data
    document.getElementById('usage-today-hours').innerHTML = data.usageToday;
    document.getElementById('usage-alltime-hours').innerHTML = data.usageOfAllTime;

    // Get the array of alternate activities from the data
    let alternateActivities = data.alternateActivities;
    console.log(alternateActivities.length) // Log the length of the array for debugging

    // If there are no alternate activities, display the 'activity-placeholder' element
    if(alternateActivities.length == 0){
      document.getElementById("activity-placeholder").style.display = "flex";
    }

    // For each alternate activity...
    alternateActivities.forEach((activity, index) => {
      // Get the 'activity-index' element and display it
      let activityBox = document.getElementById("activity-" + index);
      document.getElementById("activity-" + index).style.display = "flex";

      // Create an img element for the activity icon
      let activityIcon = document.createElement('img');
      activityIcon.className = "clock-icon"; // Set the class name
      activityIcon.src = "/images/activity-" + index + ".svg"; // Set the source
      activityIcon.alt = "icon of activity number"  + (index + 1); // Set the alt text

      // Create a p element for the activity text
      let activityText = document.createElement('p');
      activityText.className = "header-text"; // Set the class name
      activityText.textContent = activity; // Set the text content

      console.log(activity); // Log the activity for debugging
      activityBox.appendChild(activityIcon); // Append the icon to the activity box
      activityBox.appendChild(activityText); // Append the text to the activity box
    });
  })
  .catch(error => {
    // Log any errors that occurred during the fetch
    console.log("Failed to fetch data from the JSON file.", error);
  });

// Add a click event listener to the 'settings-button' element
document.getElementById('settings-button').addEventListener("click", openSettings);

// Define the openSettings function
function openSettings() {
  // Open the settings.html page in a new tab
  window.open('/settings/settings.html', '_blank');
}

let timeStart = new Date('2024-02-01T03:24:00');
let timeCurrent = Date.now();

let timeHour = (timeCurrent - timeStart);
let timeMinute = (timeCurrent - timeStart) / 6000;
let timeSecond = (timeCurrent - timeStart) / 1000;

document.getElementById('usage-alltime-hours').innerHTML = timeHour;
document.getElementById('usage-alltime-minutes').innerHTML = timeMinute;
document.getElementById('usage-alltime-seconds').innerHTML = timeSecond;

