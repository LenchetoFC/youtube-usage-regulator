/**
 * Author: Lorenzo Ramirez
 * Purpose: This script is injected into the YouTube page 
 *  and removes elements from the page
 * 
 */

/**TODO: 
 * 1. Time tracking resets at wrong times
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
  * SECTION - REMOVAL OF ELEMENTS FUNCTIONS 
  * 
  */

/**
 * Removes the element with the given ID
 * 
 * @param {string} elementID - ID of the element to remove
 * @param {string} elementName - Name of the element to remove
 * 
 * @returns {void} Returns nothing
 * 
 * @example removeDOMContent('elementID', 'elementName')
 */
const removeDOMContent = (elementID, elementName) => {
  try {
    const contentItems = document.querySelectorAll(elementID);
    contentItems.forEach((item) => {
      item.style.display = "none";
    })
    console.log(`removed ${elementName}`);
  } catch (error) {
    console.log(`Error removing ${elementName}: ${error}`);
  }
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
 * SECTION - CHECKS SCHEDULES & BLOCKS YOUTUBE ACCORDINGLY
 * 
 */


/**
 * Gets current time as of execution
 * 
 * @returns {string} Returns the current time in a string format
 * 
 * @example let currentTime = getCurrentTime();
 */
const getCurrentTime = () => {
  let currentDateTime = new Date();
  let currentHour = currentDateTime.getHours();
  let currentMinute = currentDateTime.getMinutes();

  return `${currentHour}:${currentMinute < 10 ? "0" : ""}${currentMinute}`;
}

/**
 * Checks stored schedule times and blocks YouTube accordingly
 * 
 * @returns {void} Returns nothing
 * 
 * @example checksSchedule();
 */
const checksSchedule = () => {
  console.log("CHECKING SCHEDULE TIMES...");

  // Settings IDs
  let scheduleList = [
    "schedule-sun", "schedule-mon", "schedule-tue", 
    "schedule-wed", "schedule-thu", "schedule-fri", 
    "schedule-sat"
  ];

  // Empty array to store the boolean values when the current time is checked with schedule times
  let blockYouTube = [];
  
  // Gets current time (string) and day of the week (int - index of day of week i.e. Monday == 1)
  let currentTime = getCurrentTime();
  let currentDay = new Date().getDay();

  // Iterates through schedule days and only gets schedule times when it is the current day
  scheduleList.forEach(async (day, index) => {
    if (currentDay === index) {
      let times = await retrieveSettings({operation: "retrieve", key: day});
  
      // Checking if current time is within schedule times
      if (times[0]) { // All day schedule
        blockYouTube.push(true);
      } else if (times[0] === false && times.length > 1) { // if all day is false and there is at least one scheduled interval
        timesSelection = times.slice(1) // Only grabs the schedule intervals (array)

        // Iterates through each schedule interval
        timesSelection.forEach((time) => {
          // Adds true value to blockYoutube array if current time is between interval
          if (currentTime >= time[0] && currentTime <= time[1]) {
            blockYouTube.push(true);
          }
  
        })
      }
    }
  
    // Redirects user to blocked page if there is at least true value in blockYouTube array
    //  & sets youtube-site restriction setting to true
    if (blockYouTube.includes(true)) {
      console.log("WITHIN SCHEDULE TIMES. BLOCKING YOUTUBE");
      await setSettings({operation: "set", key: 'scheduleOn', value: true});
      updateHTML("/html/blocked-page.html");
      return;
    } else { 
      // Sets youtube-site restriction to false if there are NO true values in blockYouTube array
      await setSettings({operation: "set", key: 'scheduleOn', value: false});
      console.log("NOT WITHIN SCHEDULE TIMES");
    }
  })
}

// Checks schedule time when YouTube page first loads
checksSchedule();

/**!SECTION */


/**
 * SECTION - REMOVAL OF ELEMENTS
 * 
 */

// A list of names of all settings
let settingTitles = [
  'youtube-site', 'home-page', 'shorts-page', 
  'home-button', 'autoplay-button', 'next-vid-btn',
  'recommended-vids', 'left-side-menu', 'search-bar', 
];

// Gets values of settings & enables activated settings
//window.onload = () => {
//};


// Removes ability to refresh recommendations every time the window is resized.
// That tag is reset when the window is resized, so this is the workaround
window.addEventListener("resize", () => {
  setTimeout(() => {
    removeDOMContent('ytd-continuation-item-renderer', 'Continuous Recommendations');
  }, 1000);
});

setTimeout(() => {
  settingTitles.forEach(async (settingTitle) => {
    let returnValue = await retrieveSettings({operation: "retrieve", key: settingTitle});
  
    // If settings value is set to true, it restricts that element
    if (returnValue) {
      switch (settingTitle) {
        // YouTube Site
        case settingTitles[0]:
          if (window.location.href.startsWith('https://www.youtube.com') ) {
            console.log("blocks entire site");
            updateHTML("/html/blocked-page.html");
          } 
          break;
        
        // Home Page
        case settingTitles[1]:
          if (window.location.href === 'https://www.youtube.com') {
            console.log("blocks home page");
            updateHTML("/html/blocked-page.html");
          } 
  
          // Home button in side nav bar
          document.querySelectorAll('ytd-guide-entry-renderer')[1].style.display = 'none';
          
          // Home button in top bar
          removeDOMContent('ytd-topbar-logo-renderer', 'Home button in top bar');
  
          break;
          
        // Shorts Page
        case settingTitles[2]:
          if (window.location.href.startsWith('https://www.youtube.com/shorts')) { // Shorts page
            console.log("blocks shorts page");
            updateHTML("/html/blocked-page.html");
          } 
          else if (window.location.href.startsWith('https://www.youtube.com/results') || window.location.href.startsWith('https://www.youtube.com/watch')) { // Search page
            removeDOMContent("ytd-reel-shelf-renderer", "Shorts");
            document.querySelectorAll('ytd-guide-entry-renderer')[1].style.display = 'none';
          } 
          else if (window.location.href.startsWith('https://www.youtube.com')) { // Home page
            removeDOMContent("ytd-rich-section-renderer", "Shorts");
            document.querySelectorAll('ytd-guide-section-renderer #items ytd-guide-entry-renderer')[1].style.display = 'none';
          }
          break;
        
        // Home Button
        case settingTitles[3]:
          removeDOMContent("ytd-topbar-logo-renderer", "Home Button");
  
          if (window.location.href.startsWith('https://www.youtube.com/results') || window.location.href.startsWith('https://www.youtube.com/watch')) { // Search page
            document.querySelectorAll('ytd-guide-entry-renderer')[0].style.display = 'none';
          } 
          else if (window.location.href.startsWith('https://www.youtube.com')) {
            document.querySelectorAll('ytd-guide-section-renderer #items ytd-guide-entry-renderer')[0].style.display = 'none';
          }
  
          break;
    
        // Autoplay Button
        //TODO: Remove feature - unable to disable autoplay
        case settingTitles[4]:
          try {
            document.querySelector('.ytp-autonav-toggle-button').ariaChecked = 'false';
            document.querySelector('.ytp-autonav-toggle-button-container').parentNode.style.display = 'none';
          } catch (error) {
            console.log(`Error removing autoplay button: ${error}`);
          }
          break;
          
        // Next Video Button
        case settingTitles[5]:
          removeDOMContent('.ytp-next-button', 'Next Video Button');
          break;
    
        //TODO: doesn't remove all videos
        // Recommended Videos
        case settingTitles[6]:
          removeDOMContent('#header', 'filters on search & home pages');
          removeDOMContent('yt-related-chip-cloud-renderer', 'filters video playback pages');
          removeDOMContent('ytd-compact-video-renderer', 'Recommendations on video playback pages');
          removeDOMContent('ytd-rich-grid-row', 'Recommendations on home pages');

          // TODO: Removes recommended video wall after video ends
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
         
        // Left Side Bar
        case settingTitles[7]:
          removeDOMContent('ytd-continuation-item-renderer', 'Continuous Recommendations');
          break;
  
        // Search Bar
        case settingTitles[8]:
          removeDOMContent('ytd-masthead #container #center', 'Search Bar');
          break;
      }
    }
  });
  
}, 2000);
/**!SECTION */


/**
 * SECTION - TIME TRACKING
 * 
 */

/**
 * Starts tracking time when site is focused
 * Gets current time when tracking starts
 */

// Starts timer immediately, even if not focused at first
let startTime = new Date();
console.log(`start time immediately ${startTime}`);

// Starts timer when YouTube site is focused
window.addEventListener("focus", (event) => {
  startTime = new Date();
  console.log(`start time on focus ${startTime}`);
  
  // Checks schedule every time the page is focused
  //  to make sure any new schedules are applied without
  //  the need to reload page
  checksSchedule();
});


// Stops tracking and updates time tracking storage values
// Get current time when tracking ends & compares that with time when tracking started
window.addEventListener("blur", async (event) => {  
  // Calculates elapsed time
  const endTime = new Date();
  const elapsedTime = Math.floor((endTime - startTime) / 1000);
  console.log(`elapsed time on blur ${elapsedTime}`);
  
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
