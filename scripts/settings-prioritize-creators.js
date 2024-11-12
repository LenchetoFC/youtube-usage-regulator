/**
 * @LenchetoFC
 * @description This controls the prioritize creators section of the settings page
 *
 */

/** TODO: NOTE: List of Imported Functions from global-functions.js
 * - displayNotifications();
 */

/** SECTION - FUNCTION DECLARATIONS */

/** !SECTION */

/** SECTION - ONLOAD FUNCTION CALLS */
$(document).ready(function () {
  /** EVENT LISTENER: Warns user that there are unsaved changes for preferred creators */
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

  /** TODO: EVENT LISTENER: Saves preferred creators and displays status message */
  $("#save-creators").on("click", function () {
    $('#creators-list input[type="checkbox"]').removeClass("changed");
    $("#notif-msg").fadeOut();

    // TODO: change for creators
    // if (limitationChoices.length == 0) {
    //   displayNotifications("No Changes to Save.", "#40a6ce", "info", 2500);

    //   // Re-enable button after animation
    //   $button.parent().toggleClass("spin-animation");
    //   $button.prop("disabled", false);
    //   return;
    // }

    const $button = $(this);
    $button.parent().toggleClass("spin-animation");
    $button.prop("disabled", true);

    // TODO: requires function to save all creators
    // Call function to save all creators
    // Return function status

    setTimeout(function () {
      //NOTE - temporary
      const buttonSuccess = true; // Simulated save outcome

      // Start animation on status message, depending saving outcome
      buttonSuccess
        ? displayNotifications(
            "Saved Creators Successfully!",
            "#390",
            "verified",
            2000
          )
        : displayNotifications(
            "Unsuccessfully Saved. Try Again Later.",
            "#d92121",
            "release_alert",
            5000
          );

      $button.parent().toggleClass("spin-animation");
      $button.prop("disabled", false); // Re-enable button after operation
    }, 2000);
  });
});
/** !SECTION */
