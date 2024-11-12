/**
 * @file settings-website-blocker.js
 * @description Controls the youtube limitations section of the settings page
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @requires module:global-functions
 * @see {@link module:global-functions.displayNotifications} x6
 * @see {@link module:global-functions.updateRecordByPropertyGlobal} x2
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

/**
 * Check if the checkbox form choices are valid (boolean and settings saved successfully)
 *
 * @name updateLimitationsDB
 * @async
 *
 * @param {Array} limitationChoices - array of settings records
 *
 * @returns {boolean} Returns validity value
 *
 * @example const settings = [{name: 'home-page-quick', id: 1, isActive: true, isQuickAdd: true}, {name: 'shorts-page-quick', id: 2, isActive: true, isQuickAdd: true}];
 *          let isValid = updateLimitationsDB(settings);
 */
async function updateLimitationsDB(limitationChoices) {
  let isValid = true;
  for (const limitation of limitationChoices) {
    let quick;
    limitation.isQuickAdd ? (quick = true) : (quick = false);

    if (limitation.isQuickAdd) {
      isValid = await updateRecordByPropertyGlobal(
        "youtube-limitations",
        "id",
        limitation.id,
        {
          "quick-add": limitation.isActive,
        }
      );

      if (!isValid) {
        console.error("invalid limitations");
        break;
      }
    } else {
      isValid = await updateRecordByPropertyGlobal(
        "youtube-limitations",
        "id",
        limitation.id,
        {
          active: limitation.isActive,
        }
      );

      if (!isValid) {
        console.error("invalid limitations");
        break;
      }
    }
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
  getActiveLimitations()
    .then((data) => {
      // console.log(data);
      for (let index in data) {
        // Auto-checks corresponding checkbox input
        $(`#${data[index].name}`).attr("checked", true);

        // Auto-updates YT UI example
        $(`.limitation-demos .${data[index].name}`).slideToggle();
      }
    })
    .catch((error) => {
      console.error(error);
    });

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
    const $button = $(this);
    $button.prop("disabled", true);
    $button.parent().toggleClass("spin-animation");

    // Hide unsaved message
    $("#notif-msg").fadeOut();

    console.log("saving limitations...");

    // Retrieve current values of the form inputs: name, id, isActive, isQuickAdd
    const limitationChoices = getLimitationChoices();

    if (limitationChoices.length == 0) {
      displayNotifications("No Changes to Save.", "#40a6ce", "info", 2500);

      // Re-enable button after animation
      $button.prop("disabled", false);
      $button.parent().toggleClass("spin-animation");

      return;
    } else {
      $('#limitation-settings input[type="checkbox"]').removeClass("changed");
    }

    let isValid = updateLimitationsDB(limitationChoices);

    setTimeout(function () {
      // Start animation on status message, depending saving outcome
      if (isValid) {
        displayNotifications(
          "Saved Settings Successfully!",
          "#390",
          "verified",
          2000
        );

        // Updates the YouTube UI Demo all at once
        $("#limitation-settings fieldset input").each(function () {
          if (this.checked) {
            $(`.limitation-demos .${this.name}`).slideUp();
          } else {
            $(`.limitation-demos .${this.name}`).slideDown();
          }
        });
      } else {
        displayNotifications(
          "Unsuccessfully Saved. Try Again Later.",
          "#d92121",
          "release_alert",
          5000
        );
      }

      // Re-enable button after animation
      $button.parent().toggleClass("spin-animation");
      $button.prop("disabled", false);
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
  $("#clear-settings").on("click", function () {
    // Ask user to confirm choice
    if (window.confirm("Confirm to reset ALL settings...")) {
      // Sets all checkboxes to unchecked
      clearLimitationInputs();

      // Save settings
      const limitationInputs = getLimitationInputs();

      // FIXME: isValid returns promise, not a boolean value
      // replicate this by clearing storage, then trying to save to non-existant storage
      // NOTE: possibly use .then()
      let isValid = updateLimitationsDB(limitationInputs);

      setTimeout(function () {
        // Start animation on status message, depending saving outcome
        if (isValid) {
          displayNotifications(
            "Cleared Settings Successfully!",
            "#390",
            "verified",
            2000
          );

          // Updates the YouTube UI Demo all at once
          $("#limitation-settings fieldset input").each(function () {
            if (this.checked) {
              $(`.limitation-demos .${this.name}`).slideUp();
            } else {
              $(`.limitation-demos .${this.name}`).slideDown();
            }
          });
        } else {
          displayNotifications(
            "Unsuccessfully Saved. Try Again Later.",
            "#d92121",
            "release_alert",
            5000
          );
        }
      });
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
