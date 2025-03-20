/**
 * @file settings-website-blocker.js
 * @description Controls the prioritize creators section of the settings page
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @requires module:global-functions
 * @see {@link module:global-functions.displayNotifications} x4
 */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(function () {
  /**
   * Warns user that there are unsaved changes for preferred creators
   *
   * This event listener toggles the "changed" class on checkboxes and displays a notification if there are unsaved changes.
   *
   * @name warnUnsavedChangesEventListener
   *
   * @returns {void}
   *
   * @example $('#creators-list input[type="checkbox"]').on("click", warnUnsavedChangesEventListener);
   */
  $('#creators-list input[type="checkbox"]').on("click", function () {
    // Toggle the "changed" class on the clicked checkbox
    $(this).toggleClass("changed");

    // Check if any inputs within #creators-list have the "changed" class
    const hasChanged = $('#creators-list input[type="checkbox"]').hasClass(
      "changed"
    );

    // Fade in or fade out the unsaved message based on the presence of the "changed" class
    if (hasChanged) {
      displayNotifications(
        "page-notif-msg",
        "Save your settings.",
        "#fc0",
        "warning",
        0,
        true
      );
    } else {
      $("#page-notif-msg").fadeOut(1000);
    }
  });

  /** TODO:
   * Saves preferred creators and displays status message
   *
   * This event listener saves the preferred creators and displays a status message based on the outcome.
   *
   * @name saveCreatorsEventListener
   *
   * @returns {void}
   *
   * @example $("#save-creators").on("click", saveCreatorsEventListener);
   */
  $("#save-creators").on("click", function () {
    $('#creators-list input[type="checkbox"]').removeClass("changed");
    $("#page-notif-msg").fadeOut();

    // TODO: change for creators
    // if (limitationChoices.length == 0) {
    //   displayNotifications("No Changes to Save.", "#40a6ce", "info", 2500);

    //   // Re-enable button after animation
    //   $button.parent().toggleClass("spin-animation");
    //   $button.prop("disabled", false);
    //   return;
    // }

    toggleButtonAnimation(`#save-creators`, true);

    // TODO: requires function to save all creators
    // Call function to save all creators
    // Return function status

    setTimeout(function () {
      //NOTE - temporary
      const buttonSuccess = true; // Simulated save outcome

      // Start animation on status message, depending saving outcome
      buttonSuccess
        ? displayNotifications(
            "page-notif-msg",
            "Saved Creators Successfully!",
            "#390",
            "verified",
            2000
          )
        : displayNotifications(
            "page-notif-msg",
            "Unsuccessfully Saved. Try Again Later.",
            "#d92121",
            "release_alert",
            5000
          );

      toggleButtonAnimation(`#save-creators`, false);
    }, 2000);
  });
});
/** !SECTION */
