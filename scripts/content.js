// Author: Lorenzo Ramirez
// Date Created: 2023-09-06
// Purpose: This script is injected into the YouTube page and removes elements from the page

//TODO: Add a timer to notify the user how long they have been on YouTube
//TODO: limit how many videos show in the search results
//TODO: Add try-catch for all the remove elements to prevent errors
//TODO: Remove left sidebar when the page width is between 790 and 1312 pixels
//TODO: Add more to the "Blocked for your own good" message (maybe a link to the css file?)

// Runs different functions depending on the URL
if (window.location.href === 'https://www.youtube.com/' || //blocks the homepage, shorts, and search pages
  window.location.href.startsWith('https://www.youtube.com/shorts/') ||
  window.location.href.startsWith('https://www.youtube.com/results?search_query=')) {
    document.getElementsByTagName("body")[0].innerHTML = "<h1 style=\"color: white;" + 
      "font-size: 20; font-weight: bold; display: flex; justify-content: center; " +
      "\">Blocked for your own good</h1>"
} else if (window.location.href.startsWith('https://www.youtube.com/')) {
  // Runs the extension after 2 seconds
  setTimeout(function() {
    chrome.storage.sync.get(null, function() {    
      // Removes elements from YouTube pages
      removeElementIfExists("related") //recommended videos
      removeElementIfExists("logo-icon") //YouTube home button
      removeElementIfExists("guide-button") //left side hamburger menu
      removeElementIfExists("owner") //channel logo
      removeElementIfExists("scroll-container") //left side bar, if it automatically shows
      removeElementIfExists("guide") //left side bar, if it automatically shows
      removeElementIfExists("items") //left side bar, if it automatically shows
      removeElementIfExists("center") //search bar
      removeClassElement("ytp-autonav-toggle-button-container"); //autoplay toggle
      removeClassElement("ytp-next-button ytp-button"); //next video button
    }) 

    //TODO: When the video starts, send a chrome notification about the timer starting
    //TODO: If the timer goes over 5 hours, send a chrome notification about the timer ending & remove the video
    // Removes the video wall at the end of the video
    let intervalID = setInterval(function() {

      // Gets the video's current time and duration
      currentTime = document.getElementsByClassName("ytp-time-current")[0].innerHTML;
      duration = document.getElementsByClassName("ytp-time-duration")[0].innerHTML;

      // Removes the video wall at the end of the video
      if (currentTime === duration) {
        removeClassElement("html5-endscreen ytp-player-content videowall-endscreen ytp-show-tiles");

        console.log("video ended");
        clearInterval(intervalID);
      } else {
        console.log("video not ended");
      }
    }, 1000);
  }, 1000);
}

// Removes all elements with the given class name
function removeClassElement(className){
  let element = document.getElementsByClassName(className)
  while (element.length > 0) {
    element[0].parentNode.removeChild(element[0]);
    console.log(element)
  }
}
// Removes the element with the given ID
function removeElementIfExists(elementID){
  let element = document.getElementById(elementID)
  console.log(element)
  if (element != 'undefined' || element != null) {
    element.remove()
  } else {
    console.log("element does not exist")
  }
}