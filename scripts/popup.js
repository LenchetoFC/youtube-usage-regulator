// Author: Lorenzo Ramirez
// Date Created: 2023-09-05
// Purpose: This file is the popup for the extension

fetch('/settings/settings.json')
  .then(response => response.json())
  .then(data => {
    console.log(data);

    document.getElementById('usageToday').innerHTML = data.usageToday;
    document.getElementById('usageOfAllTime').innerHTML = data.usageOfAllTime;
    document.getElementById('timer').innerHTML = data.timer;
  })
  .catch(error => {
    console.log("Failed to fetch data from the JSON file.", error);
  });

// Opens Settings html page in a newly opened tab
document.getElementById('settings-button').addEventListener("click", openSettings);

function openSettings() {
  chrome.tabs.create({
    url: chrome.runtime.getURL("settings/settings.html")
  });
}