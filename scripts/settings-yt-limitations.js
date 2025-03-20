/**
 * @file settings-website-blocker.js
 * @description Controls the youtube limitations section of the settings page
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 */

/**
 * Disable other limitation option to signify that both options are not able to active simultaneously
 *
 * @name disableOtherLimitationOption
 *
 * @returns {void}
 *
 * @example $(".search-item")
 *            .find(
 *              'input[data-property="followSchedule"], input[data-property="active"]'
 *            ).on("change", disableOtherLimitationOption);
 */
async function disableOtherLimitationOption() {
  const $this = $(this);
  const $parent = $this.closest(".search-item");
  const property = $this.attr("data-property");

  const propertiesToDisable = {
    followSchedule:
      "input[data-property='active'], input[data-property='popup']",
    activeOrPopup: "input[data-property='followSchedule']",
  };

  const checkedCount = $parent.find(
    'input[data-property="popup"]:checked, input[data-property="active"]:checked'
  ).length;

  const getCheckboxesToDisable = (propertyKey) =>
    $parent.find(propertiesToDisable[propertyKey]);

  // Case: "active" or "popup" is checked
  if ((property === "active" || property === "popup") && checkedCount > 0) {
    getCheckboxesToDisable("activeOrPopup").prop("disabled", true);
  }
  // Case: "followSchedule" input is manually checked or unchecked
  else if (property === "followSchedule") {
    getCheckboxesToDisable("followSchedule").prop(
      "disabled",
      $this.prop("checked")
    );
  }
  // Case: No checkboxes are checked
  else if (checkedCount === 0) {
    getCheckboxesToDisable("activeOrPopup").prop("disabled", false);
  }
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

  // Attach the change handler to both checkboxes - MUST be before updateSettingsCheckboxes()
  $(".search-item")
    .find(
      'input[data-property="followSchedule"], input[data-property="active"], input[data-property="popup"]'
    )
    .on("change", disableOtherLimitationOption);

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
