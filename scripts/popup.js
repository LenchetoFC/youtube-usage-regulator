// Author: Lorenzo Ramirez
// Date Created: 2023-09-05
// Purpose: This file is the popup for the extension

fetch('/settings/settings.json')
  .then(response => response.json())
  .then(data => {
    console.log(data);

    // reformatUsageTime(data.usageToday, data.usageOfAllTime)

    document.getElementById('usageToday').innerHTML = data.usageToday;
    document.getElementById('usageOfAllTime').innerHTML = data.usageOfAllTime;
    document.getElementById('timer').innerHTML = data.timer;
  })
  .catch(error => {
    console.log("Failed to fetch data from the JSON file.", error);
  });

// function reformatUsageTime(usageToday, usageOfAllTime) {
//   let hoursToday = Math.floor(usageToday / 60)
//   let minutesToday = hours % 60
  
//   if (minutesToday + ''.length < 2 || minutesAllTime + '') {
//     minutesToday = '0' + minutesToday;
//   }



//   document.getElementById('usageToday').innerHTML = hoursToday + "H:" + minutesToday + "M";
//   document.getElementById('usageOfAllTime').innerHTML = daysAllTime + "D:" + hoursAllTime + "H:" + minutesAllTime + "M";
// }

// Opens Settings html page in a newly opened tab
document.getElementById('settings-button').addEventListener("click", function () {
  chrome.tabs.create({
    url: chrome.runtime.getURL("/html/settings.html")
  });
});

// function openSettings() {
//   chrome.tabs.create({
//     url: chrome.runtime.getURL("/html/settings.html")
//   });
// }
