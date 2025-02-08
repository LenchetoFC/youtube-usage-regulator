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
 * loadNavBar()
 * Loads nav bar layout html from separate files to more easily
 * update the nav bar whenever all at once for all settings and
 * dashboard pages
 *
 * NOTE: Working, but disabled while the demo UI is still being reworked
 */
function loadNavBar() {
  const $pageId = $("nav.fetch-nav").attr("id");
  const $navTarget = $(`nav.fetch-nav`);

  fetch(`/modules/nav-bar.html`)
    .then((res) => {
      if (res.ok) {
        return res.text();
      }
    })
    .then((navBarLayout) => {
      $navTarget.html(navBarLayout);
    })
    .then(() => {
      // Adds current-page styles to nav bar anchor and
      $("nav")
        .find(`a[data-id="${$pageId}"]`)
        .addClass("current-page")
        .attr("href", "#");
    });
}

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
    .fadeOut(function () {
      // Fade in the selected section after the fade-out completes
      $(`#${selectedTabId}`).fadeIn().css("display", "flex");
    });
}
/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(function () {
  // Fetch nav bar from nav-bar.html and insert into page
  loadNavBar();

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

  /** SECTION - SEARCH BAR */
  // Focuses on search bar input when the parent container is pressed since input box is invisible
  $(".search-bar").on("click", function () {
    $("#search-input").trigger("focus");
  });

  // Filters all .search-item according to current search bar input
  $("#search-input").on("input", function () {
    // .search-item is the parent container of each setting option
    function filterSearchItems(searchBarElem) {
      const inputVal = $(searchBarElem).val();

      // Hide search items if it does not container search bar input value
      $(".search-item").each(function () {
        if (
          $(this)
            .find("p")
            .text()
            .toLowerCase()
            .includes(inputVal.toLowerCase())
        ) {
          $(this).show();
        } else {
          $(this).hide();
        }

        // If all options in a fieldset are set to display: none, hide the fieldset title as well
        const $fieldset = $(this).closest("fieldset");
        if ($(this).css("display") !== "none") {
          $fieldset.show();
        } else {
          const allItemsHidden =
            $fieldset.find(".search-item").filter(function () {
              return $(this).css("display") !== "none";
            }).length === 0;
          if (allItemsHidden) {
            $fieldset.hide();
          }
        }
      });
    }

    filterSearchItems($(this));
  });
});

/** !SECTION */
