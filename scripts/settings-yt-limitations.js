/**
 * @LenchetoFC
 * @description This controls the youtube limitations section of the settings page
 *
 */

/** TODO: NOTE: List of Imported Functions from global-functions.js
 * - displayNotifications();
 */

/** SECTION - FUNCTION DECLARATIONS */

/** FUNCTION: Get all active youtube limitations settings
 *
 * @returns {array} Returns array of records with active values
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

/** FUNCTION: Get all active quick activations for youtube limitations
 *
 * @returns {array} Returns array of records with active quick activations
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

/** FUNCTION: Get all settings that have been changed in the form (class name)
 *
 * @returns {array} Returns an array converted from an object of changed settings properties
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

/** FUNCTION: Get all limitations settings that is used to clear all settings
 *
 * @returns {array} Returns an array converted from an object of changed settings properties
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

/** FUNCTION: Check if the checkbox form choices are valid (boolean and settings saved successfully)
 *
 * @param {array} id - array of settings records
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

/** SECTION - ONLOAD FUNCTION CALLS */
$(document).ready(function () {
  /** ONLOAD FUNCTION CALL: Get all active youtube limitation records, toggle active checkboxes, and update YT UI example */
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

  /** ONLOAD FUNCTION CALL: Get all active quick activations records, toggle active quick activation checkboxes, and update YT UI example */
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

  /** EVENT LISTENER: Warns user that there are unsaved changes for preferred creators */
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

  /** EVENT LISTENER: Saves restrictive settings and displays status message */
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

  /** EVENT LISTENER: Clears all settings
   *
   * This event listener clears all settings by resetting all checkboxes to unchecked and saving the settings.
   * It asks the user to confirm the action before proceeding.
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

  /** FUNCTION: Clear limitation inputs
   *
   * This function clears all limitation inputs by setting their checked property to false.
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
