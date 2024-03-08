// Author: Lorenzo Ramirez
// Date Created: 2023-09-06
// Purpose: This script is injected into the YouTube page and removes elements from the page

// TODO: Revise current version of how YouTube elements are removed
// TODO: Tracking and display user's usage time
// TODO: Handle free video tokenization

import { getSettings } from "./settings.js";

// window.onload = function(){removeContent};

// *********************
// Function to remove any section of the YouTube webpage
// function removeContent(contentToBeRemoved){
//   // hide element
//   hideElement()
// }

// Runs the extension after 2 seconds
// setTimeout(function() {
//   // Runs different functions depending on the URL
//   if (window.location.href === 'https://www.youtube.com/' || //blocks the homepage, shorts, and search pages
//     window.location.href.startsWith('https://www.youtube.com/shorts/') ||
//     window.location.href.startsWith('https://www.youtube.com/results?search_query=')) {
//       document.getElementsByTagName("body")[0].innerHTML = "<h1 style=\"color: white;" + 
//         "font-size: 20; font-weight: bold; display: flex; justify-content: center; " +
//         "\">Blocked for your own good</h1>"
//   } else if (window.location.href.startsWith('https://www.youtube.com/')) {
//     chrome.storage.sync.get(null, function() {    
//       // Removes elements from YouTube pages
//       hideElement("related") //recommended videos
//       hideElement("start") //YouTube home button
//       hideElement("center") //search bar
//       getComputedStyle(document.getElementById('end').style.minWidth = '0px'); //removes extra space on mastheaad
//       hideElement("logo-icon") //YouTube home button (alternate 1)
//       hideElement("logo") //YouTube home button (alternate 2)
//       hideElement("guide-button") //left side hamburger menu
//       hideElement("owner") //channel logo
//       hideElement("scroll-container") //left side bar
//       hideElement("guide") //left side bar (alternate 1)
//       hideElement("items") //left side bar (alternate 2)
//       hideClassElement("ytp-autonav-toggle-button-container"); //autoplay toggle
//       hideClassElement("ytp-next-button ytp-button"); //next video button
//     }) 

//     // Removes the video wall at the end of the video
//     // let intervalID = setInterval(function() {
//     //   try {
//     //     // Gets the video's current time and duration
//     //     currentTime = document.getElementsByClassName("ytp-time-current")[0].innerHTML;
//     //     duration = document.getElementsByClassName("ytp-time-duration")[0].innerHTML;

//     //     // Removes the video wall at the end of the video
//     //     if (currentTime === duration) {
//     //       hideClassElement("html5-endscreen ytp-player-content videowall-endscreen ytp-show-tiles");

//     //       console.log("video ended");
//     //       clearInterval(intervalID);
//     //     } else {
//     //       console.log("video not ended");
//     //     }
//     //   } catch (error) {
//     //     console.log("Error getting the video's current time and duration: " + error)
//     //   }
//     // }, 1000);
//     let videoWallClassName = "html5-endscreen ytp-player-content videowall-endscreen ytp-show-tiles";
    
//     let intervalID = setInterval(function() {
//       try {
//         hideClassElement(videoWallClassName);
//       } catch (error) {
//         console.log("Video Wall Hasn't Appeared Yet...")
//       }
//     }, 1000);
//   }
// }, 3000);


//TEST: Listens for messages from popup.js DOES NOT WORK
// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     if(request.message === "hello") {
//       console.log("hdjsfksbhjk")
//     }
//     console.log(sender.tab ?
//                 "from a content script:" + sender.tab.url :
//                 "from the extension");
//     if (request.greeting === "hello")
//       sendResponse({farewell: "goodbye"});
//   }
// );

//TEST: Listens for messages from service-worker
// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
//   if (request.greeting == "hello") {
//     console.log("Message received from background script");
//   }
// });
// /*
// // Listens for recommended videos toggle messages from popup.js
// chrome.runtime.onmessage.addListener(function(request, sender, sendResponse) {
//   if (request.message === "hideRecommendedVideos") {
//     hideElement("related");
//   } else if (request.message === "showRecommendedVideos") {
//     showElement("related");
//   }
// });

// // Listens for search bar toggle messages from popup.js
// chrome.runtime.onmessage.addListener(function(request, sender, sendResponse) {
//   if (request.message === "hideSearchBar") {
//     hideElement("center");
//     getComputedStyle(document.getElementById('end').style.minWidth = '0px');
//   } else if (request.message === "showSearchBar") {
//     showElement("center");
//     getComputedStyle(document.getElementById('end').style.minWidth = '225px'); //removes extra space on mastheaad
//   }
// });

// // Listens for autoplay toggle messages from popup.js
// chrome.runtime.onmessage.addListener(function(request, sender, sendResponse) {
//   if (request.message === "hideAutoplayToggle") {
//     hideClassElement("ytp-autonav-toggle-button-container");
//   } else if (request.message === "showAutoplayToggle") {
//     showClassElement("ytp-autonav-toggle-button-container");
//   }
// });

// // Listens for next video button toggle messages from popup.js
// chrome.runtime.onmessage.addListener(function(request, sender, sendResponse) {
//   if (request.message === "hideNextVideoButton") {
//     hideClassElement("ytp-next-button ytp-button");
//   } else if (request.message === "showNextVideoButton") {
//     showClassElement("ytp-next-button ytp-button");
//   }
// });

// // Listens for left side bar toggle messages from popup.js
// chrome.runtime.onmessage.addListener(function(request, sender, sendResponse) {
//   if (request.message === "hideLeftSideBar") {
//     hideElement("guide")
//     hideElement("items")
//     hideElement("scroll-container");
//   } else if (request.message === "showLeftSideBar") {
//     showElement("guide")
//     showElement("items")
//     showElement("scroll-container");
//   }
// });

// // Listens for channel logo toggle messages from popup.js
// chrome.runtime.onmessage.addListener(function(request, sender, sendResponse) {
//   if (request.message === "hideChannelLogo") {
//     hideElement("owner");
//   } else if (request.message === "showChannelLogo") {
//     showElement("owner");
//   }
// });

// // Listens for hamburger menu toggle messages from popup.js
// chrome.runtime.onmessage.addListener(function(request, sender, sendResponse) {
//   if (request.message === "hideHamburgerMenu") {
//     hideElement("guide-button");
//   } else if (request.message === "showHamburgerMenu") {
//     showElement("guide-button");
//   }
// });

// // Listens for YouTube home button toggle messages from popup.js
// chrome.runtime.onmessage.addListener(function(request, sender, sendResponse) {
//   if (request.message === "hideYouTubeHomeButton") {
//     hideElement("start");
//     hideElement("logo-icon");
//     hideElement("logo");
//   } else if (request.message === "showYouTubeHomeButton") {
//     showElement("start");
//     showElement("logo-icon");
//     showElement("logo");
//   }
// });

// // Removes all elements with the given class name
// function hideClassElement(className){
//   try {
//     console.log("removed element with class name: " + className)
//     let element = document.getElementsByClassName(className)
//     while (element.length > 0) {
//       element[0].parentNode.removeChild(element[0]);
//     }
//   } catch (error) {
//     console.log("Error hiding an element by classname (" + className + "): " + error);
//   }
  
// }
// */

// // Hides the element with the given ID
// function hideElement(elementID){
//   try {
//     getComputedStyle(document.getElementById(elementID).style.display = 'none');
//   } catch (error) {
//     console.log("Error showing an element by ID (" + elementID + "): " + error);
//   }
// }

// // Shows the element with the given ID
// function showElement(elementID){
//   try {
//     getComputedStyle(document.getElementById(elementID).style.display = 'flexbox');

//   } catch (error) {
//     console.log("Error showing an element by ID (" + elementID + "): " + error);
//   }
// }

console.log(getSettings('searchBar'));

console.log("FGHJUKJDFGSYJDFGYUSEGFYU")