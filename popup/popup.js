// Author: Lorenzo Ramirez
// Date Created: 2023-09-05
// Purpose: This file is the popup for the extension

// Gets footer elements from popup.html
let footerSupport = document.getElementById("footer-support");
let showFooterSupport = document.getElementById("footer-info-support"); 
let footerAbout = document.getElementById("footer-about");
let showFooterAbout = document.getElementById("footer-info-about");

// Shows/hides the footer "support' section
footerSupport.addEventListener("click", async() => {
  console.log(showFooterSupport.style.display)
  if(showFooterSupport.style.display === "none" || showFooterSupport.style.display === ""){
    showFooterAbout.style.display = "none";
    showFooterSupport.style.display = "block";
  } else {
    showFooterSupport.style.display = "none";
  }
});

// Shows/hides the footer "about" section
footerAbout.addEventListener("click", async() => {
  if(showFooterAbout.style.display === "none" || showFooterAbout.style.display === ""){
    showFooterSupport.style.display = "none";
    showFooterAbout.style.display = "block";
  } else {
    showFooterAbout.style.display = "none";
  }
});

// To manually remove everything it can
let removeAllElementsButton = document.getElementById("remove-all-elements");
removeAllElementsButton.addEventListener("click", async() => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['/scripts/content.js'],
  });
});

let buttonStatus;

// To manually remove/restore the video wall
let videoWallButton = document.getElementById("toggle-videoWall");
videoWallButton.addEventListener("click", async() => {
  let buttonColor = videoWallButton.style.backgroundColor;

  // Determines button status by button color
  if (buttonColor === "rgb(255, 171, 135)") {
    let buttonStatus = true;
    videoWallButton.style.backgroundColor = "rgb(191, 129, 102)";
    toggleVideoWall(buttonStatus)
  } else {
    let buttonStatus = false;
    videoWallButton.style.backgroundColor = "rgb(255, 171, 135)";
  }

  console.log(buttonStatus)
  // toggleVideoWall(buttonStatus);
});

// To manually remove/restore the recommended videos
let recommendedVideosButton = document.getElementById("toggle-recommendedVideos");

// To manually remove/restore the search bar
let searchBarButton = document.getElementById("toggle-searchBar");

// To manually remove/restore the autoplay toggle
let autoplayToggleButton = document.getElementById("toggle-autoplayToggle");

// To manually remove/restore the next video button
let nextVideoButton = document.getElementById("toggle-nextVideoButton");

// To manually remove/restore the YouTube home button
let homeButton = document.getElementById("toggle-homeButton");

// To manually remove/restore the channel logo
let channelLogo = document.getElementById("toggle-channelLogo");

// To manually remove/restore the left side hamburger menu
let leftSideHamburgerMenu = document.getElementById("toggle-leftSideHamburgerMenu");
