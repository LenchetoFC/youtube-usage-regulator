/**
 * Author: Lorenzo Ramirez
 * Purpose: This script is injected into the YouTube page 
 *  and removes elements from the page
 * 
 */

// Removes all elements with the given class name
function removeClassElement(className, elementName){
  try {
    let element = document.getElementsByClassName(className)
    console.log(element);
    while (element.length > 0) {
      element[0].parentNode.removeChild(element[0]);
      console.log(`removed ${elementName}`);
    }
  } catch (error) {
    console.log("Error hiding an element by classname (" + className + "): " + error);
  }
  
}

// Removes the element with the given ID
function removeElement(elementID, elementName){
  try {
    // document.getElementById(elementID).style.display = 'none';
    document.getElementById(elementID).style.visibility = 'hidden';
    // document.getElementById(elementID).style.position = 'absolute';
    console.log(`removed ${elementName}`);
  } catch (error) {
    console.log("Error showing an element by ID (" + elementID + "): " + error);
  }
}

// Get all removal settings from storage from background script
const retrieveSettings = (valueToSend) => {
  // Send a message to the background script
  return new Promise ((resolve, reject) => {
    chrome.runtime.sendMessage(valueToSend, function(response) {
      resolve(response.data);
    });
  });
}

// Sets storage settings from background script
const setSettings = (valueToSend) => {
  // Send a message to the background script
  return new Promise ((resolve, reject) => {
    chrome.runtime.sendMessage(valueToSend, function(response) {
      resolve(response.data);
    });
  });
}

// HTML of blockedPage.html takes over current web page
const updateHTML = (htmlPage) => {
  chrome.runtime.sendMessage({redirect: htmlPage}, function(response) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    } else {
      console.log(response);
    }
  });
}

// A list of names of all settings
let settingTitles = [
  'youtubeSite', 'homePage', 'shortsPage', 
  'homeButton', 'autoPlayButton', 'nextVideoButton',
  'recommendedVideos', 'leftSideMenu', 'searchBar', 
];


// Gets values of settings & enables activated settings
setTimeout(() => {
  settingTitles.forEach(async (settingTitle) => {
    let returnValue = await retrieveSettings({operation: "retrieve", key: settingTitle});
  
    if (returnValue === "true") {
      switch (settingTitle.key) {
        case 'youtubeSite':
          if (window.location.href.startsWith('https://www.youtube.com/') ) {
            console.log("blocks entire site");
            updateHTML("/html/blocked-page.html");
          } 
        break;

        case 'homePage':
          if (window.location.href === 'https://www.youtube.com/') {
            console.log("blocks home page");
            updateHTML("/html/blocked-page.html");
          } 
          break;

        case 'shortsPage':
          if (window.location.href.startsWith('https://www.youtube.com/shorts/')) {
            console.log("blocks shorts page");
            updateHTML("/html/blocked-page.html");
          } 
          break;

        case 'homeButton':
          removeElement("start", 'homeButton');
          removeElement("logo-icon", 'homeButton') //YouTube home button (alternate 1)
          removeElement("logo", 'homeButton') //YouTube home button (alternate 2)
          break;
    
        case 'autoPlayButton':
          removeClassElement("ytp-autonav-toggle-button-container", 'autoPlayButton'); //autoplay toggle
          break;
          
        case 'nextVideoButton':
          removeClassElement("ytp-next-button ytp-button", 'nextVideoButton'); //next video button
          break;
    
        case 'recommendedVideos':
          removeElement("related", 'recommendedVideos');
          removeElement("contents", 'recommended videos on home page');
          
          removeElement("owner", 'recommendedVideos') //channel logo
          document.getElementById("owner").style.position = 'absolute';

          
          // Removes recommended video wall after video ends
          // let videoWallClassName = "html5-endscreen ytp-player-content videowall-endscreen ytp-show-tiles";
          // let intervalID = setInterval(function() {
          //   try {
          //     removeClassElement(videoWallClassName, 'recommendedVideosWall');
          //     return;
          //   } catch (error) {
          //     console.log("Video Wall Hasn't Appeared Yet...")
          //   }
          // }, 1000);
          break;
          
        case 'leftSideMenu':
          removeElement("scroll-container", 'left side bar') //left side bar
          removeElement("guide", 'leftSideMenu alt 1') //left side bar (alternate 1)
          removeElement("items", 'leftSideMenu alt 2') //left side bar (alternate 2)
          removeElement("guide-button", 'leftSideMenu') //left side hamburger menu
          removeElement("header", 'header') //header
          break;

        case 'searchBar':
          removeElement("center", 'searchBar');

          document.getElementById('container').style.justifyContent = "flex-end";
    
          break;
      }
    }
  });
}, 3000);


/**
 * TIME TRACKING
 */

// Starts tracking time when site is focused
// Gets current time when tracking starts
let startTime;
window.addEventListener("focus", (event) => {
  const currentTime = new Date();
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  console.log(`${hours}:${minutes}:${seconds}`);
  startTime = new Date();
});

// Stops tracking and updates time tracking storage values
// Get current time when tracking ends & compares that with time when tracking started
window.addEventListener("blur", async (event) => {
  console.log("tests")
  const allTimeUsage = await retrieveSettings({operation: "retrieve", key: 'all-time-usage'});
  const endTime = new Date();
  const elapsedTime = Math.floor((endTime - startTime) / 1000);
  await setSettings({operation: "set", key: 'all-time-usage', value: elapsedTime + allTimeUsage});

  console.log(`Elapsed time: ${elapsedTime} seconds`);
});