// Author: Lorenzo Ramirez
// Date Created: 2023-09-05
// Purpose: This file is the popup for the extension
/**
 * @LenchetoFC 
 * @description This is the standard popup on toolbar to show
 *  the user's YouTube usasge, how many free videos they have left,
 *  and the ability to disable YouTube entirely
 * 
 */

const addictiveForm = document.querySelectorAll("form input");
// addictiveForm.forEach((element) => {
//   getSettings(element.name, (result) => {
//     // Visually displays the status of the setting
//     if (result === "true") {
//       element.checked = true;
//     } else {
//       element.checked = false;
//     }

//     // Updates settings for whichever button is pushed
//     element.addEventListener("click", (event) => {
//       setSetting(element.name, element.checked.toString());
//     });
//   });
// });

let youTubeSetting = addictiveForm[0];
getSettings(youTubeSetting.id, (result) => {
  // Visually displays the status of the setting
  if (result === "true") {
    youTubeSetting.checked = true;
  } else {
    youTubeSetting.checked = false;
  }

  // Updates settings for whichever button is pushed
  youTubeSetting.addEventListener("click", (event) => {
    setSetting(youTubeSetting.name, youTubeSetting.checked.toString());
  });
});