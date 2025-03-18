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
 * loadHelpPopover()
 * Loads Help popover html from module file to more easily
 * update the Help html whenever all at once for all pages
 * using Help popovers
 */
function loadHelpPopover() {
  const $bodyTarget = $("#popover-help");

  fetch(`/modules/help-popover.html`)
    .then((res) => {
      if (res.ok) {
        return res.text();
      }
    })
    .then((helpPopoverLayout) => {
      $bodyTarget.prepend(helpPopoverLayout);
    })
    .then(() => {
      // Adds event listener to download settings
      $("#export-settings").on("click", function (event) {
        event.preventDefault();
        exportSettings();
      });

      // Adds event listener to handle file import
      $("#import-settings").on("click", async function (event) {
        event.preventDefault();

        const fileInput = document.querySelector("#imported-settings");
        const importedRecords = fileInput.files;

        // Imports settings file into chrome sync storage
        const results = await handleImportFile(importedRecords);
        if (results) {
          // Reload page if import is successful
          window.location.reload();
        }
      });

      // Adds event listener to copy email to clipboard
      $(".copy-to-clipboard").on("click", function () {
        navigator.clipboard
          .writeText($(this).attr("value"))
          .then(() => {
            $("#copy-confirm-msg").fadeIn(2000, function () {
              $(this).fadeOut(2000);
            });
          })
          .catch((err) => {
            displayNotifications(
              "Failed to copy to clipboard",
              "#d92121",
              "error",
              5000
            );
            console.error("Failed to copy text: ", err);
          });
      });

      // Drag and drop for importing settings file
      // let dropbox;
      // dropbox = document.getElementById("dropbox");
      // dropbox.addEventListener("dragenter", dragenter, false);
      // dropbox.addEventListener("dragover", dragover, false);
      // dropbox.addEventListener("drop", drop, false);
    });
}

/** SECTION - COLLAPSIBLE NAV BAR */

/**
 * Collapses side nav bar
 *
 * @name collapseNavBar
 *
 * @param collapseButton - jquery object of button to collapse nav bar
 *
 * @returns {void}
 *
 * @example collapseNavBar($('.collapse-nav'));
 *
 */
function collapseNavBar(collapseButton) {
  $(collapseButton).attr("aria-expanded", false);
  $("#aside-nav").addClass("nav-collapsed");
}

/**
 * Expands side nav bar
 *
 * @name expandNavBar
 *
 * @param collapseButton - jquery object of button to collapse nav bar
 *
 * @returns {void}
 *
 * @example expandNavBar($('.collapse-nav'));
 *
 */
function expandNavBar(collapseButton) {
  $(collapseButton).attr("aria-expanded", true);
  $("#aside-nav").removeClass("nav-collapsed");
}

/** !SECTION */

/** SECTION - EXPORT/IMPORT SETTINGS */
/**
 * Retrieves all settings from local storage and exports it to JSON file
 *
 * @name exportSettings
 *
 * @returns {void}
 *
 * @example exportSettings();
 *
 */
async function exportSettings() {
  // Get all settings from local storage
  const allSettings = await sendMessageToServiceWorker({
    operation: "selectAllStorage",
  });

  // Send data to service worker to download JSON file
  const downloadFileResults = await sendMessageToServiceWorker({
    operation: "downloadFile",
    filename: "settings.json",
    data: allSettings,
  });
}

// Handle file drag enter action
// function dragenter(e) {
//   e.stopPropagation();
//   e.preventDefault();
// }

// Handle file drag over action
// function dragover(e) {
//   e.stopPropagation();
//   e.preventDefault();
// }

// Handle file drop action
// function drop(e) {
//   e.stopPropagation();
//   e.preventDefault();

//   const dt = e.dataTransfer;
//   const importedSettings = dt.files[0];

//   handleImportFile(importedSettings);
// }

/**
 * Handles import file by calling service worker to import settings
 *
 * @name handleImportFile
 * @async
 *
 * @param {object} importedRecords - records i.e. JSON object of entire database
 *
 * @returns {boolean}
 *
 * @example handleImportFile(jsonObject);
 *
 */
async function handleImportFile(importedRecords) {
  try {
    if (importedRecords.length > 0) {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const fileContent = JSON.parse(event.target.result);

        const results = await sendMessageToServiceWorker({
          operation: "importSettings",
          records: fileContent,
        });

        if (results != true) {
          throw new Error(results);
        }
      };

      reader.readAsText(importedRecords[0]);
      return true;
    } else {
      throw new Error("No File Selected");
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(function () {
  // Fetch nav bar from nav-bar.html and insert into page
  loadNavBar();

  // Fetch help popover from help-popover.html and insert into page
  loadHelpPopover();

  /** EVENT LISTENER: Popover won't close when cancel button is pressed if the form is incomplete in any way */
  $("button[type='reset'].cancel").on("click", function () {
    const popoverId = $(this).attr("data-popover");
    document.querySelector(`#${popoverId}`)?.togglePopover();
  });

  /** SECTION - SEARCH BAR */
  // Focuses on search bar input when the parent container is pressed since input box is invisible
  $(".search-bar").on("click", function () {
    $("#search-input").trigger("focus");
  });

  // Filters all .search-item according to current search bar input
  // NOTE: for transparency, most of this, especially the highlighting, is A.I. generated.
  $("#search-input").on("input", function () {
    // .search-item is the parent container of each setting option
    function filterSearchItems(searchBarElem) {
      const inputVal = $(searchBarElem).val();
      // Hide search items if it does not container search bar input value
      $(".search-item").each(function () {
        if (
          $(this)
            .find("p, td, h1, h2, li")
            .text()
            .toLowerCase()
            .includes(inputVal.toLowerCase())
        ) {
          $(this).show();
        } else {
          $(this).hide();
        }
        // If all options in a search container are set to display: none, hide the search container entirely (header and all)
        const $searchContainer = $(this).closest(".search-container");
        const $buttonContainer = $(this)
          .closest(".search-container")
          .siblings(".group-of-buttons");

        // If at least one item is visible, show header and setting buttons
        if ($(this).css("display") !== "none") {
          $searchContainer.show();
          $buttonContainer.show();
        } else {
          const allItemsHidden =
            $searchContainer.find(".search-item").filter(function () {
              return $(this).css("display") !== "none";
            }).length === 0;

          // If no items are visible, hide header and setting buttons
          if (allItemsHidden) {
            $searchContainer.hide();
            $buttonContainer.hide();

            displayNotifications(
              "No items found in your search.",
              "#40a6ce",
              "info",
              5000
            );
          }
        }
      });
    }
    filterSearchItems($(this));
  });

  /** !SECTION */

  /** SECTION - COLLAPSIBLE NAV BAR */
  // Controls collapsible nav bar
  $(".collapse-nav").on("click", function () {
    const isExpanded = $(this).attr("aria-expanded");
    isExpanded === "true" ? collapseNavBar(this) : expandNavBar(this);
  });

  // If window is less than 40rem wide, collapse nav bar. Else, expand nav bar
  const isWindowTooNarrow = window.matchMedia("(max-width: 40rem)");
  isWindowTooNarrow.addEventListener("change", function (event) {
    const collapseButton = $(".collapse-nav");
    event.matches
      ? collapseNavBar(collapseButton)
      : expandNavBar(collapseButton);
  });

  /** !SECTION */
});

/** !SECTION */
