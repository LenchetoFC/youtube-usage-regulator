/**
 * @file settings-website-blocker.js
 * @description Controls the youtube limitations section of the settings page
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 */

// Define the change handler function
function handleCheckboxChange() {
  console.log("Checkbox changed");
  const $this = $(this);
  const isFollowSchedule = $this.attr("data-property") === "followSchedule";
  const relatedCheckbox = $this
    .closest(".search-item")
    .find(
      `input[data-property='${isFollowSchedule ? "active" : "followSchedule"}']`
    );
  relatedCheckbox.prop("disabled", this.checked);
}

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(async function () {
  //  Gets all active settings and updates checkboxes
  const propertiesToCheck = ["active", "followSchedule", "popup"];

  // getActiveSettings() from database-control-buffer.js
  const activeSettings = await getActiveSettings(
    "youtube-limitations",
    propertiesToCheck
  );

  // Attach the change handler to both checkboxes
  $(".search-item")
    .find(
      'input[data-property="followSchedule"], input[data-property="active"]'
    )
    .change(handleCheckboxChange);
  // updateSettingsCheckboxes() from settings-form-control.js
  updateSettingsCheckboxes(activeSettings, "youtube-limitations");
});
/** !SECTION */

/** SECTION - DISABLED CODE */
// /**
//  * updateYouTubeUIDemo()
//  * Gets the most up-to-date active limitations and then removes any corresponding
//  * UI element according to active settings
//  *
//  * NOTE: Working, but disabled while the demo UI is still being reworked
//  */
// // async function updateYouTubeUIDemo() {
// //   // Gets active limitation settings
// //   const activeLimitations = await getActiveSettings();

// //   // Updates the YouTube UI Demo
// //   for (const limitation of activeLimitations) {
// //     $("#youtube-limitations fieldset input").each(function () {
// //       if (limitation.active) {
// //         $(`#limitation-demos .${limitation.name}`).slideUp();
// //       } else {
// //         $(`#limitation-demos .${limitation.name}`).slideDown();
// //       }
// //     });
// //   }
// // }

// /**
//  * loadLayoutDemos()
//  * Loads youtube layout demo html from separate files to save space
//  * and maintain readability on settings-yt-limitations.html
//  *
//  * NOTE: Working, but disabled while the demo UI is still being reworked
//  */
// // function loadLayoutDemos() {
// //   const demoNames = ["homepage", "playback"];

// //   for (const name of demoNames) {
// //     const target = document.querySelector(`#yt-demo-${name}`);

// //     fetch(`/modules/yt-demo-${name}.html`)
// //       .then((res) => {
// //         if (res.ok) {
// //           return res.text();
// //         }
// //       })
// //       .then((demoLayout) => {
// //         target.innerHTML = demoLayout;
// //       });
// //   }
// // }
// // loadLayoutDemos();

// /** !SECTION */
