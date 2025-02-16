/**
 * @file settings-form-controls.js
 * @description This file contains regular form related functions to interact with the form or database
 *
 * @version 1.0.0
 * @author LenchetoFC
 */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

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
function getChangedSettings(formId) {
  const $changedInputs = $(`#${formId}`).find("fieldset input.changed");

  let groupedByName = {};

  for (const setting of $changedInputs) {
    const $id = $(setting).val();
    const $option = $(setting).attr("data-property");
    const $name = $(setting).attr("data-name");
    const $isChecked = $(setting).is(":checked");

    if (!groupedByName[$name]) {
      groupedByName[$name] = {};
    }

    groupedByName[$name]["id"] = parseInt($id);
    groupedByName[$name][$option] = $isChecked;
  }

  return groupedByName;
}

/**
 * Checks all active checkboxes
 *
 * @name updateSettingsCheckboxes
 * @async
 *
 * @param {object} activeSettings - object of all active settings from chosen table
 * @param {string} formId - table name from form's id
 *
 * @returns {void}
 *
 * @example updateSettingsCheckboxes(activeSettings, formId);
 */
// Define the updateSettingsCheckboxes function
async function updateSettingsCheckboxes(activeSettings, formId) {
  for (const index in activeSettings) {
    const activeVal = activeSettings[index].active;

    // Auto-check corresponding checkbox input
    $(`#${formId}`)
      .find(`input[name=${activeSettings[index].name}-active]`)
      .attr("checked", activeVal)
      .trigger("change"); // Trigger change event to handle disabling

    // Special cases for youtube limitation settings form
    if (formId === "youtube-limitations") {
      const followScheduleVal = activeSettings[index].followSchedule;
      const popupVal = activeSettings[index].popup;

      $(`#${formId}`)
        .find(`input[name=${activeSettings[index].name}-followSchedule]`)
        .attr("checked", followScheduleVal)
        .trigger("change"); // Trigger change event to handle disabling

      $(`#${formId}`)
        .find(`input[name=${activeSettings[index].name}-popup]`)
        .attr("checked", popupVal);
    }
  }
}

// Gets attributes of all newly checked checkboxes
/**
 * Description
 *
 * @name functionName
 * @global
 *
 * @param {type} name - description
 *
 * @returns {type}
 *
 * @example functionName(params);
 *
 */
function getCheckedSettings(formId) {
  const $changedInputs = $(`#${formId} fieldset input.changed`);

  let groupedByName = {};

  for (const setting of $changedInputs) {
    const $id = $(setting).val();
    const $property = $(setting).attr("data-property");
    const $name = $(setting).attr("data-name");
    const $isChecked = $(setting).is(":checked");

    if (!groupedByName[$name]) {
      groupedByName[$name] = {};
    }

    groupedByName[$name] = $isChecked;
    groupedByName[$name]["id"] = parseInt($id);
    groupedByName[$name][$property] = $isChecked;
  }

  return groupedByName;
}

// Checks for if any checkbox has been newly checked or unchecked
/**
 * Description
 *
 * @name functionName
 * @global
 *
 * @param {type} name - description
 *
 * @returns {type}
 *
 * @example functionName(params);
 *
 */
function checkForChangedCheckboxes(checkbox, formId) {
  // Toggle the "changed" class on the clicked checkbox
  $(checkbox).toggleClass("changed");

  // Check if any inputs within #youtube-limitations have the "changed" class
  const $changedCheckbox = $(`#${formId} input[type="checkbox"]`).hasClass(
    "changed"
  );

  return $changedCheckbox;
}

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(function () {
  /**
   * Warns user that there are unsaved changes for preferred creators
   *
   * This event listener toggles the "changed" class on checkboxes and displays a notification if there are unsaved changes.
   */
  const formClassName = "settings-form";
  $(`.${formClassName}`)
    .find('input[type="checkbox"]')
    .on("click", function () {
      const formId = $(this).closest(`.${formClassName}`).attr("id");
      const isChanged = checkForChangedCheckboxes(this, formId);

      // Fade in or fade out the unsaved message based on the presence of the "changed" class
      if (isChanged) {
        displayNotifications(
          "Ensure to save your changed settings.",
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
  $(".save-settings").on("click", async function (event) {
    event.preventDefault();

    // Disable the save button
    const $buttonId = $(this).attr("id");
    const $formId = $(this).closest("form").attr("id");

    console.log($formId);

    toggleButtonAnimation(`#${$buttonId}`, true);

    // Hide unsaved message
    $("#notif-msg").fadeOut();

    // Retrieve current values of the form inputs: name, id, isActive, isQuickAdd
    const newRecords = getChangedSettings($formId);

    if (Object.keys(newRecords).length == 0) {
      displayNotifications("No changes to save.", "#40a6ce", "info", 2500);

      // Disables button animation
      toggleButtonAnimation(`#${$buttonId}`, false);

      return;
    } else {
      $(`#${$formId}`).find('input[type="checkbox"]').removeClass("changed");
    }

    // 2 second timeout to show the saving animation - solely for UX
    setTimeout(async function () {
      // Iterates through changed settings to update accordingly
      const updateResult = await prepareDatabaseUpdate($formId, newRecords);

      // Start animation on status message, depending saving outcome
      if (!updateResult.error) {
        displayNotifications(
          "Saved settings successfully!",
          "#390",
          "verified",
          2000
        );
      } else {
        displayNotifications(
          "Unsuccessfully update. Check error logs.",
          // updateSettingsResults.message,
          "#d92121",
          "release_alert",
          5000
        );
      }

      // Re-enable button after animation
      toggleButtonAnimation(`#${$buttonId}`, false);
    }, 2000);
  });

  /**
   * Clears all settings
   *
   * This event listener clears all settings by resetting all checkboxes to unchecked and saving the settings.
   * It asks the user to confirm the action before proceeding.
   */
  $(".clear-settings").on("click", async function (event) {
    event.preventDefault();
    /**
     * Unchecks limitation inputs
     *
     * This function unchecks all limitation inputs by setting their checked property to false.
     */
    function uncheckCheckboxes(formId) {
      const $checkboxes = $(`form#${formId}`).find("fieldset input");

      $checkboxes.each(function (_, element) {
        $(`input[name='${element.name}']`).prop("checked", false);
      });
    }

    try {
      const $formId = $(this).attr("id");

      // Ask user to confirm choice
      if (window.confirm("Confirm to reset ALL settings...")) {
        const resetResult = await resetTableGlobal(`${$formId}`);

        if (!resetResult.error) {
          displayNotifications(
            "Cleared Settings Successfully!",
            "#390",
            "verified",
            2000
          );

          // Sets all checkboxes to unchecked
          uncheckCheckboxes($formId);
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
