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
 * @name getActiveLimitations
 * @async
 *
 * @returns {Array} Returns array of records with active values
 *
 * @example let allQuickActiviations = getActiveLimitations();
 */
async function getActiveLimitations() {
  let allActiveLimitations = await filterRecordsGlobal(
    "youtube-limitations",
    "active",
    true
  );

  return allActiveLimitations;
}

/**
 * Get all active quick activations for youtube limitations
 *
 * @name getActiveQuickActivations
 * @async
 *
 * @returns {Array} Returns array of records with active quick activations
 *
 * @example let allQuickActiviations = getActiveQuickActivations();
 */
async function getActiveQuickActivations() {
  let allQuickActivations = filterRecordsGlobal(
    "youtube-limitations",
    "quick-add",
    true
  );

  return allQuickActivations;
}

/**
 * Get all settings that have been changed in the form (class name)
 *
 * @name getLimitationChoices
 *
 * @returns {Array} Returns an array converted from an object of changed settings properties
 *                  necessary for updating storage
 *
 * @example const limitationChoices = getLimitationChoices();
 */
function getLimitationChoices() {
  return $("#limitation-settings fieldset input.changed")
    .map(function () {
      return {
        name: this.name,
        id: parseInt(this.value),
        isActive: this.checked,
        isQuickAdd: this.name.includes("quick"),
      };
    })
    .get();
}

/**
 * Get all limitations settings that is used to clear all settings
 *
 * @name getLimitationInputs
 *
 * @returns {Array} Returns an array converted from an object of changed settings properties
 *                  necessary for updating storage
 *
 * @example const limitationInputs = getLimitationInputs();
 */
function getLimitationInputs() {
  return $("#limitation-settings fieldset input")
    .map(function () {
      return {
        name: this.name,
        id: parseInt(this.value),
        isActive: this.checked,
        isQuickAdd: this.name.includes("quick"),
      };
    })
    .get();
}

//
async function updateLimitationsDB(limitation, isQuickAdd) {
  try {
    let property = isQuickAdd ? "quick-add" : "active";
    let result = await updateRecordByPropertyGlobal(
      "youtube-limitations",
      "id",
      limitation.id,
      {
        [property]: limitation.isActive,
      }
    );

    console.log(result);

    return result;
  } catch (error) {
    return { error: true, message: error };
  }
}

/**
 * Iterates through all changes limitation choices and then calls function to update database
 *
 * @name updateSettingsDB
 * @async
 *
 * @param {Array} limitationChoices - array of settings records
 *
 * @returns {boolean} Returns validity value
 *
 * @example const settings = [{name: 'home-page-quick', id: 1, isActive: true, isQuickAdd: true}, {name: 'shorts-page-quick', id: 2, isActive: true, isQuickAdd: true}];
 *          let isValid = updateSettingsDB(settings);
 */
async function updateSettingsDB(limitationChoices) {
  try {
    let updateLimitationsResult;

    for (const limitation of limitationChoices) {
      // Updates limitations in database
      updateLimitationsResult = await updateLimitationsDB(
        limitation,
        limitation.isQuickAdd
      );

      // Throws error if there are any problems updating
      if (updateLimitationsResult.error) {
        throw { error: true, message: updateLimitationsResult.message };
      }

      return updateLimitationsResult;
    }
  } catch (error) {
    console.error(error);
    return error;
  }
}

async function updateYouTubeUIDemo() {
  // Gets active limitation settings
  let activeLimitations = await getActiveLimitations();

  console.log(activeLimitations);

  // Updates the YouTube UI Demo
  for (let limitation of activeLimitations) {
    $("#limitation-settings fieldset input").each(function () {
      if (limitation.active) {
        $(`#limitation-demos .${limitation.name}`).slideUp();
      } else {
        $(`#limitation-demos .${limitation.name}`).slideDown();
      }
    });
  }
}

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(function () {
  /**
   * ONLOAD FUNCTION CALL: Get all active youtube limitation records, toggle active checkboxes, and update YT UI example
   *
   * @name getActiveLimitationsOnLoad
   * @async
   *
   * @returns {void}
   */
  updateYouTubeUIDemo();

  /**
   * ONLOAD FUNCTION CALL: Get all active quick activations records, toggle active quick activation checkboxes, and update YT UI example
   *
   * @name getActiveQuickActivationsOnLoad
   * @async
   *
   * @returns {void}
   */
  getActiveQuickActivations()
    .then((data) => {
      for (let index in data) {
        // Auto-checks corresponding checkbox input
        $(`#${data[index].name}-quick`).attr("checked", true);
      }
    })
    .catch((error) => {
      console.error(error);
    });

  /**
   * Warns user that there are unsaved changes for preferred creators
   *
   * This event listener toggles the "changed" class on checkboxes and displays a notification if there are unsaved changes.
   *
   * @name warnUnsavedChangesEventListener
   *
   * @returns {void}
   *
   * @example $('#limitation-settings input[type="checkbox"]').on("click", warnUnsavedChangesEventListener);
   */
  $('#limitation-settings input[type="checkbox"]').on("click", function () {
    // Toggle the "changed" class on the clicked checkbox
    $(this).toggleClass("changed");

    // Check if any inputs within #limitation-settings have the "changed" class
    const hasChanged = $(
      '#limitation-settings input[type="checkbox"]'
    ).hasClass("changed");

    // Fade in or fade out the unsaved message based on the presence of the "changed" class
    if (hasChanged) {
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
   *
   * @name saveLimitationsEventListener
   *
   * @returns {void}
   *
   * @example $("#save-limitations").on("click", saveLimitationsEventListener);
   */
  $("#save-limitations").on("click", function () {
    // Disable the save button
    toggleButtonAnimation("#save-limitations", true);

    // Hide unsaved message
    $("#notif-msg").fadeOut();

    console.log("saving limitations...");

    // Retrieve current values of the form inputs: name, id, isActive, isQuickAdd
    const limitationChoices = getLimitationChoices();

    if (limitationChoices.length == 0) {
      displayNotifications("No Changes to Save.", "#40a6ce", "info", 2500);

      // Re-enable button after animation
      toggleButtonAnimation("#save-limitations", false);

      return;
    } else {
      $('#limitation-settings input[type="checkbox"]').removeClass("changed");
    }

    setTimeout(async function () {
      // Iterates through changed settings to update accordingly
      let updateSettingsResults = await updateSettingsDB(limitationChoices);

      // Updates YouTube UI demos according to new settings
      updateYouTubeUIDemo();

      // Start animation on status message, depending saving outcome
      if (!updateSettingsResults.error) {
        displayNotifications(
          "Saved Settings Successfully!",
          "#390",
          "verified",
          2000
        );
      } else {
        displayNotifications(
          // "Unsuccessfully Saved. Try Again Later.",
          updateSettingsResults.message,
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
   *
   * @name clearSettingsEventListener
   *
   * @param {Event} event - The form submission event.
   */
  $("#clear-settings").on("click", async function () {
    try {
      // Ask user to confirm choice
      if (window.confirm("Confirm to reset ALL settings...")) {
        // Sets all checkboxes to unchecked
        clearLimitationInputs();

        const result = await resetTableGlobal("youtube-limitations");

        if (!result.error) {
          displayNotifications(
            "Cleared Settings Successfully!",
            "#390",
            "verified",
            2000
          );

          // Updates the YouTube UI Demo all at once
          updateYouTubeUIDemo();
        } else {
          displayNotifications(result.message, "#d92121", "error", 5000);
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  /**
   * Clear limitation inputs
   *
   * This function clears all limitation inputs by setting their checked property to false.
   *
   * @name clearLimitationInputs
   *
   * @returns {void}
   */
  function clearLimitationInputs() {
    let limitationInputs = $("#limitation-settings fieldset input");

    limitationInputs.each(function (_, element) {
      $(`#${element.name}`).prop("checked", false);
    });
  }
});
/** !SECTION */
