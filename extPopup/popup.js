// Author: Lorenzo Ramirez
// Date Created: 2023-09-05
// Purpose: This file is the popup for the extension

// FUNCTION: 
function lowersSection(about){
  
}

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


// (async () => {
//   const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
//   const response = await chrome.tabs.sendMessage(tab.id, {greeting: "hello"});
//   // do something with response here, not outside the function
//   console.log(response);
// })();

(async () => {
  const response = await chrome.runtime.sendMessage({greeting: "hello"});
  // do something with response here, not outside the function
  console.log(response);
})();

// To manually remove/restore the video wall
let videoWallButton = document.getElementById("toggle-videoWall");
videoWallButton.addEventListener("click", (async () => {
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
  console.log(tab)
  const response = await chrome.tabs.sendMessage(tab.id, {greeting: "hello"});

  // let VWbuttonColor = videoWallButton.style.backgroundColor;

  // // Hides the video wall
  // if (VWbuttonColor === "rgb(255, 171, 135)") {
  //   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //     chrome.tabs.sendMessage(tabs[0].id, {message: "hideVideoWall"}, function(response) 
  //     {});
  //   });
  //   videoWallButton.style.backgroundColor = "rgb(191, 129, 102)";
  //   videoWallButton.style.borderColor = "rgb(0, 0, 0)";
  //   videoWallButton.style.borderStyle = "solid";
  // } 
  // // Shows the video wall
  // else {
  //   chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //     chrome.tabs.sendMessage(tabs[0].id, {message: "showVideoWall"}, function(response) 
  //     {});
  //   });
  //   videoWallButton.style.backgroundColor = "rgb(255, 171, 135)";
  //   recommendedVideosButton.style.borderStyle = "none";
  // }

  console.log(response);
})

);

  


//rgb(135, 183, 255) -> rgb(100 136 189)
//rgb(135, 255, 141) -> rgb(101 192 106): BC: rgb
//rgb(249, 255, 135) -> rgb(183 188 100)
//rgb(255, 135, 149) -> rgb(189 100 114)
//rgb(255, 135, 135) -> rgb(189 100 100)
//rgb(255, 135, 201) -> rgb(189 100 150)


// To manually remove/restore the recommended videos
// let recommendedVideosButton = document.getElementById("toggle-recommendedVideos");
// recommendedVideosButton.addEventListener("click", async() => {

//   let RVbuttonColor = recommendedVideosButton.style.backgroundColor;

//   // Hides the recommended videos
//   if (RVbuttonColor === "rgb(245, 135, 255)") {
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//       chrome.tabs.sendMessage(tabs[0].id, {message: "hideRecommendedVideos"}, function(response) 
//       {});
//     });
//     recommendedVideosButton.style.backgroundColor = "rgb(176, 94, 184)";
//     recommendedVideosButton.style.borderColor = "rgb(0, 0, 0)";
//     recommendedVideosButton.style.borderStyle = "solid";
//   } 
//   // Shows the recommended videos
//   else {
//     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//       chrome.tabs.sendMessage(tabs[0].id, {message: "showRecommendedVideos"}, function(response) 
//       {});
//     });
//     recommendedVideosButton.style.backgroundColor = "rgb(245, 135, 255)";
//     recommendedVideosButton.style.borderStyle = "none";
//   }

// });

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
