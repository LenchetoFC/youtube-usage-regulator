// Author: Lorenzo Ramirez
// Purpose: To handle the fetch json data for the blocked page

fetch('/settings/settings.json')
  .then(response => response.json())
  .then(data => {
    console.log(data);

    document.getElementById('usage-today').innerHTML = data.usageToday;
    document.getElementById('usage-total').innerHTML = data.usageOfAllTime;

    let alternateActivities = data.alternateActivities;
    let ulElement = document.getElementById('activity-list'); // Replace 'your-ul-id' with the id of your ul element

    alternateActivities.forEach(activity => {
      let liElement = document.createElement('li');
      liElement.textContent = activity;
      ulElement.appendChild(liElement);
    });
  })
  .catch(error => {
    console.log("Failed to fetch data from the JSON file.", error);
  });

// Opens Settings html page in a newly opened tab
document.getElementById('settings-button').addEventListener("click", openSettings);

function openSettings() {
  window.open('/settings/settings.html', '_blank');
}