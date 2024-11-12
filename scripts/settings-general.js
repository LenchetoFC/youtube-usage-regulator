/**
 * @file settings-general.js
 * @description This file contains general functions and event listeners for the settings page.
 * It handles tab switching, form interactions, and other settings-related functionalities.
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @notes
 * - To access storage from the browser console, run this command:
 *   chrome.storage.sync.get((result) => { console.log(result) });
 * - Ensure that jQuery is loaded before this script.
 * - This file is part of the settings module and should be included in the settings page.
 */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

/**
 * Switch to the selected settings tab page
 *
 * This function hides all non-selected settings sections and fades in the selected section.
 *
 * @name switchSettingsTab
 *
 * @param {string} selectedTabId - The ID of the selected tab to switch to.
 *
 * @returns {void}
 *
 * @example switchSettingsTab("general-settings");
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

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
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
