// Author: Lorenzo Ramirez
// Date Created: 2023-09-06
// Purpose: This script is injected into the YouTube page and removes elements from the page

// Runs the extension after 2 seconds
setTimeout(function() {
  // Runs different functions depending on the URL
  if (window.location.href === 'https://www.youtube.com/' || //blocks the homepage, shorts, and search pages
    window.location.href.startsWith('https://www.youtube.com/shorts/') ||
    window.location.href.startsWith('https://www.youtube.com/results?search_query=')) {
      document.getElementsByTagName("body")[0].innerHTML = "<h1 style=\"color: white;" + 
        "font-size: 20; font-weight: bold; display: flex; justify-content: center; " +
        "\">Blocked for your own good</h1>"
  } else if (window.location.href.startsWith('https://www.youtube.com/')) {
    chrome.storage.sync.get(null, function() {    
      // Removes elements from YouTube pages
      removeElementIfExists("related") //recommended videos
      removeElementIfExists("start") //YouTube home button
      removeElementIfExists("logo-icon") //YouTube home button (alternate 1)
      removeElementIfExists("logo") //YouTube home button (alternate 2)
      removeElementIfExists("guide-button") //left side hamburger menu
      removeElementIfExists("owner") //channel logo
      removeElementIfExists("scroll-container") //left side bar
      removeElementIfExists("guide") //left side bar (alternate 1)
      removeElementIfExists("items") //left side bar (alternate 2)
      removeElementIfExists("center") //search bar
      removeClassElement("ytp-autonav-toggle-button-container"); //autoplay toggle
      removeClassElement("ytp-next-button ytp-button"); //next video button
    }) 

    // Removes the video wall at the end of the video
    let intervalID = setInterval(function() {
      try {
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
      } catch (error) {
        console.log("Error getting the video's current time and duration: " + error)
      }
    }, 1000);
  }
}, 2000);

// Removes all elements with the given class name
function removeClassElement(className){
  try {
    let element = document.getElementsByClassName(className)
    while (element.length > 0) {
      element[0].parentNode.removeChild(element[0]);
    }
  } catch (error) {
    console.log("Error removing an element by classname: " + error);
  }
  
}
// Removes the element with the given ID
function removeElementIfExists(elementID){
  try {
    let element = document.getElementById(elementID);
    console.log(element);
    if (element != 'undefined' || element != null) {
      element.remove();
    } else {
      console.log("element does not exist");
    }
  } catch (error) {
    console.log("Error removing an element by ID: " + error);
  }
  
}