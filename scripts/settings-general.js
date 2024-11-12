/**
 * @LenchetoFC
 * @description This controls the settings pages and accurately
 *  displays current settings and user information for the general settings
 *
 */

/**
 * NOTE: to access storage from browser console, run this command...
 * chrome.storage.sync.get((result) => { console.log(result) });
 */

/** SECTION - FUNCTION DECLARATIONS */
/** FUNCTION: Switch to the selected settings tab page
 *
 * This function hides all non-selected settings sections and fades in the selected section
 *
 * @returns {void}
 */
function switchSettingsTab(selectedTabId) {
  $(".general-body > section")
    .not(`#${selectedTabId}`)
    .hide(function () {
      // Ensure all sections are hidden before fading in the selected section
      $(".general-body > section").hide();
      // Fade in the selected section after the fade-out completes
      $(`#${selectedTabId}`).fadeIn().css("display", "flex");
    });
}
/** !SECTION */

/** SECTION - ONLOAD FUNCTION CALLS */
$(document).ready(function () {
  /** EVENT LISTENER: Popover won't close when cancel button is pressed if the form is incomplete in any way */
  $(".cancel").on("click", function () {
    const popoverId = $(this).attr("data-popover");
    document.querySelector(`#${popoverId}`).togglePopover();
  });

  /** EVENT LISTENER: Tab Functionality */
  $("#page-tabs button").on("click", function () {
    const selectedTabId = $(this).val();

    // Remove 'current-tab' class from all buttons and add it to the selected button
    $("#page-tabs button").removeClass("current-tab");
    $(this).addClass("current-tab");

    // Fade out all sections except the selected one
    switchSettingsTab(selectedTabId);
  });
});

/** !SECTION */
