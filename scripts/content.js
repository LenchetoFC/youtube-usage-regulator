/**
 * Author: Lorenzo Ramirez
 * Purpose: This script is injected into the YouTube page 
 *  and removes elements from the page
 * 
 */

/** 
  * SECTION - STORAGE RELATED
  * 
  */

/**
 * Sets storage settings using the background script
 * 
 * @param {Object} valueToSend - The value to send to the background script
 * 
 * @returns {Promise} A promise that resolves when the settings are set
 * 
 * @example setSettings({operation: "set", key: 'settingKey', value: 'settingValue'})
 */
const setSettings = (valueToSend) => {
  // Send a message to the background script
  return new Promise ((resolve, reject) => {
    chrome.runtime.sendMessage(valueToSend, function(response) {
      resolve(response.data);
    });
  });
}

/**!SECTION */


/** 
  * SECTION - REMOVAL OF ELEMENTS FUNCTIONS 
  * 
  */

/**
 * Updates settings value
 * 
 * @param {string} className - className of element to confirm the element to remove
 * @param {string} elementName - element to remove
 * 
 * @returns {void} Returns nothing
 * 
 * @example setSettingsBG(key, value, () => {return}))
 */
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

/**
 * Removes the element with the given ID
 * 
 * @param {string} elementID - ID of the element to remove
 * @param {string} elementName - Name of the element to remove
 * 
 * @returns {void} Returns nothing
 * 
 * @example removeElement('elementID', 'elementName')
 */
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

/**
 * Retrieves settings from storage using the background script
 * 
 * @param {Object} valueToSend - The value to send to the background script
 * 
 * @returns {Promise} A promise that resolves with the retrieved settings
 * 
 * @example retrieveSettings({operation: "retrieve", key: 'settingKey'})
 */
const retrieveSettings = (valueToSend) => {
  // Send a message to the background script
  return new Promise ((resolve, reject) => {
    chrome.runtime.sendMessage(valueToSend, function(response) {
      resolve(response.data);
    });
  });
}

/**!SECTION */


/** 
 * SECTION - MISC FUNCTIONS
 * 
 */

/**
 * Updates the HTML of the current web page with the specified HTML page
 * 
 * @param {string} htmlPage - The path to the HTML page to be loaded
 * 
 * @returns {void} Returns nothing
 * 
 * @example updateHTML('/html/blocked-page.html')
 */
const updateHTML = (htmlPage) => {
  chrome.runtime.sendMessage({redirect: htmlPage}, function(response) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message);
    } else {
      console.log(response);
    }
  });
}

/**!SECTION */


/**
 * SECTION - REMOVAL OF ELEMENTS
 * 
 */

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
      switch (settingTitle) {
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

/**!SECTION */


/**f
 * SECTION - TIME TRACKING
 * 
 */

// Starts tracking time when site is focused
// Gets current time when tracking starts
let startTime = new Date();
window.addEventListener("focus", (event) => {
  startTime = new Date();
  console.log(`start time ${startTime}`)
});


// Stops tracking and updates time tracking storage values
// Get current time when tracking ends & compares that with time when tracking started
window.addEventListener("blur", async (event) => {  
  // Calculates elapsed time
  const endTime = new Date();
  const elapsedTime = Math.floor((endTime - startTime) / 1000);
  
  // Gets current values of both time usages
  const allTimeUsage = await retrieveSettings({operation: "retrieve", key: 'all-time-usage'});
  const todayUsage = await retrieveSettings({operation: "retrieve", key: 'today-usage'});
  
  // Updates both time usages when window is blurred
  await setSettings({operation: "set", key: 'today-usage', value: elapsedTime + todayUsage});
  await setSettings({operation: "set", key: 'all-time-usage', value: elapsedTime + allTimeUsage});
  
  // Gets video's play/pause button to simulate a mouse click on it
  const playButton = document.getElementsByClassName("ytp-play-button ytp-button").item(0);

  // Pause video if it is playing
  // Effectively keeps accurate tracking for when the user is *watching* YouTube
  if (playButton.getAttribute("data-title-no-tooltip") === "Pause") {
    playButton.click();
  }
});

/**!SECTION */
