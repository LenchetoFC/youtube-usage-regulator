/**
 * @file settings-website-blocker.js
 * @description Controls the youtube limitations section of the settings page
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @requires module:global-functions
 * @see {@link module:global-functions.updateRecordByPropertyGlobal}
 * @see {@link module:global-functions.resetTableGlobal}
 * @see {@link module:global-functions.displayNotifications} x 6
 * @see {@link module:global-functions.toggleButtonAnimation} x 3
 */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

/**
 * Get all active youtube limitations settings
 *
 * @name getActiveSettings
 * @async
 *
 * @returns {Array} Returns array of records with active values
 *
 * @example const allQuickActiviations = getActiveSettings();
 */
async function getActiveSettings() {
  // Define the properties to check
  const propertiesToCheck = ["active", "followSchedule", "popup"];

  // Create a Set to store unique active records
  const uniqueActiveRecords = new Set();

  for (const property of propertiesToCheck) {
    const activeRecords = await filterRecordsGlobal(
      "youtube-limitations",
      property,
      true
    );

    // Add each active record to the Set
    activeRecords.forEach((record) => uniqueActiveRecords.add(record));
  }

  // Convert the Set to an array to return the records
  return Array.from(uniqueActiveRecords);
}

/**
 * Get all settings that have been changed in the form (class name)
 * and groups all related settings by name to fit the database schema
 * and be more efficient
 *
 * @name getChangedSettings
 *
 * @returns {Array} Returns an array converted from an object of changed settings properties
 *                  necessary for updating storage
 *
 * @example const limitationChoices = getChangedSettings();
 */
function getChangedSettings() {
  const $changedInputs = $("#youtube-limitations fieldset input.changed");

  let groupedByName = {};

  for (const limitation of $changedInputs) {
    const $id = $(limitation).val();
    const $option = $(limitation).attr("data-option");
    const $name = $(limitation).attr("data-name");
    const $isChecked = $(limitation).is(":checked");

    if (!groupedByName[$name]) {
      groupedByName[$name] = {};
    }

    groupedByName[$name]["id"] = parseInt($id);
    groupedByName[$name][$option] = $isChecked;
  }

  return groupedByName;
}

/**
 * Updates limitations in local chrome database
 *
 * @name updateDatabase
 * @async
 *
 * @param {Array} newRecord - object of new setting record
 *
 * @returns {boolean} Returns validity value
 *
 * @example const newRecord = {name: 'home-page-popup', id: 1, isActive: true,
 *                              isQuickAdd: true};
 *          let result = updateDatabase(newRecord);
 */
async function updateDatabase(newRecord) {
  try {
    const result = await updateRecordByPropertyGlobal(
      "youtube-limitations",
      "id",
      newRecord.id,
      newRecord
    );

    return result;
  } catch (error) {
    console.log(error);
    return { error: true, message: error.message };
  }
}

/**
 * Iterates through all changes limitation choices and then calls function to update database
 *
 * @name prepareDatabaseUpdate
 * @async
 *
 * @param {Array} newRecords - array of settings records
 *
 * @returns {boolean} Returns validity value
 *
 * @example const newRecords = [{name: 'home-page-popup', id: 1, isActive: true,
 *                              isQuickAdd: true}, {name: 'shorts-page-popup',
 *                              id: 2, isActive: true, isQuickAdd: true
 *                            }];
 *          let isValid = prepareDatabaseUpdate(newRecords);
 */
async function prepareDatabaseUpdate(newRecords) {
  try {
    let updateResult;

    console.log(newRecords);

    for (const key in newRecords) {
      // Updates limitations in database
      const newRecord = newRecords[key];
      updateResult = await updateDatabase(newRecord);

      // Throws error if there are any problems updating
      if (updateResult.error) {
        throw { error: true, message: updateResult.message };
      }
    }

    return updateResult;
  } catch (error) {
    console.error(error.message);

    return { error: true, message: error.message };
  }
}

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(function () {
  // updateYouTubeUIDemo();

  /**
   * ONLOAD FUNCTION CALL: Get all active limitation records, toggle active limitation checkboxes, and update YT UI example
   *
   * @name getActiveSettings
   * @async
   *
   * @returns {void}
   */
  getActiveSettings()
    .then((data) => {
      for (const index in data) {
        const followScheduleVal = data[index].followSchedule;
        const activeVal = data[index].active;
        const popupVal = data[index].popup;
        console.log(data[index]);
        // Auto-checks corresponding checkbox input
        $(`input[name=${data[index].name}-active]`).attr("checked", activeVal);
        $(`input[name=${data[index].name}-followSchedule]`).attr(
          "checked",
          followScheduleVal
        );
        $(`input[name=${data[index].name}-popup]`).attr("checked", popupVal);
      }
    })
    .catch((error) => {
      console.error(error);
    });

  // TODO: get active misc settings

  /**
   * Warns user that there are unsaved changes for preferred creators
   *
   * This event listener toggles the "changed" class on checkboxes and displays a notification if there are unsaved changes.
   */
  $('#youtube-limitations input[type="checkbox"]').on("click", function () {
    // Toggle the "changed" class on the clicked checkbox
    $(this).toggleClass("changed");

    // Check if any inputs within #youtube-limitations have the "changed" class
    const $changedCheckbox = $(
      '#youtube-limitations input[type="checkbox"]'
    ).hasClass("changed");

    // Fade in or fade out the unsaved message based on the presence of the "changed" class
    if ($changedCheckbox) {
      displayNotifications(
        "Ensure to Save your Changed Settings.",
        "#fc0",
        "warning",
        0,
        true
      );
    } else {
      $("#notif-msg").fadeOut(1000);
    }
  });

  /**
   * Saves restrictive settings and displays status message
   *
   * This event listener saves the restrictive settings and displays a status message based on the outcome.
   */
  $("#save-limitations").on("click", function (event) {
    event.preventDefault();

    // Disable the save button
    toggleButtonAnimation("#save-limitations", true);

    // Hide unsaved message
    $("#notif-msg").fadeOut();

    console.log("Saving Limitations...");

    // Retrieve current values of the form inputs: name, id, isActive, isQuickAdd
    const newRecords = getChangedSettings();

    if (Object.keys(newRecords).length == 0) {
      displayNotifications("No Changes to Save.", "#40a6ce", "info", 2500);

      // Re-enable button after animation
      toggleButtonAnimation("#save-limitations", false);

      return;
    } else {
      $('#youtube-limitations input[type="checkbox"]').removeClass("changed");
    }

    setTimeout(async function () {
      // Iterates through changed settings to update accordingly
      const updateResult = await prepareDatabaseUpdate(newRecords);

      // Updates YouTube UI demos according to new settings
      // updateYouTubeUIDemo();

      // Start animation on status message, depending saving outcome
      if (!updateResult.error) {
        displayNotifications(
          "Saved Settings Successfully!",
          "#390",
          "verified",
          2000
        );
      } else {
        displayNotifications(
          "Unsuccessfully Saved. Check Error Logs.",
          // updateSettingsResults.message,
          "#d92121",
          "release_alert",
          5000
        );
      }

      // Re-enable button after animation
      toggleButtonAnimation("#save-limitations", false);
    }, 2000);
  });

  /**
   * Clears all settings
   *
   * This event listener clears all settings by resetting all checkboxes to unchecked and saving the settings.
   * It asks the user to confirm the action before proceeding.
   */
  $("#clear-settings").on("click", async function () {
    /**
     * Unchecks limitation inputs
     *
     * This function unchecks all limitation inputs by setting their checked property to false.
     */
    function uncheckLimitationBoxes() {
      const $limitationCheckboxes = $("#youtube-limitations fieldset input");

      $limitationCheckboxes.each(function (_, element) {
        $(`#${element.name}`).prop("checked", false);
      });
    }

    try {
      // Ask user to confirm choice
      if (window.confirm("Confirm to reset ALL settings...")) {
        // Sets all checkboxes to unchecked
        uncheckLimitationBoxes();

        const resetResult = await resetTableGlobal("youtube-limitations");

        if (!resetResult.error) {
          displayNotifications(
            "Cleared Settings Successfully!",
            "#390",
            "verified",
            2000
          );

          // Updates the YouTube UI Demo all at once
          // updateYouTubeUIDemo();
        } else {
          displayNotifications(resetResult.message, "#d92121", "error", 5000);
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  /**
   * Controls 'see more' options button
   *
   * This event listener expands and collapse the see-more-container, updates see-more text,
   * and switches icon for the limitation settings
   */
  $(".see-more-button").on("click", function (event) {
    // Prevent standard button behavior
    event.preventDefault();

    const $button = $(this);
    const $container = $button.siblings(".see-more-container");
    const $seeMoreTextElement = $button.find("span#see-more-text");
    const $icon = $button.find(".material-symbols-rounded");

    // Check if the container is expanded
    const isExpanded = $container.attr("aria-expanded") === "true";

    // Toggle text and icon
    $seeMoreTextElement.text(isExpanded ? "more" : "less");
    $icon.toggle();

    // Toggle container visibility
    $container.slideToggle({
      duration: 300,
      easing: "swing",
      complete: function () {
        $container.attr("aria-expanded", !isExpanded);
      },
    });
  });
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
