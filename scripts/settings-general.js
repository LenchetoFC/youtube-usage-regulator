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

/** NOTE: List of Imported Functions from global-functions.js
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
  let allActiveLimitations = await sendMessageToServiceWorker({
    operation: "filterRecords",
    table: "youtube-limitations",
    property: "active",
    value: true,
  });

  return allActiveLimitations;
}

/** FUNCTION: Get all active quick activations for youtube limitations
 *
 * @returns {array} Returns array of records with active quick activations
 *
 * @example let allQuickActiviations = getActiveQuickActivations();
 */
async function getActiveQuickActivations() {
  let allQuickActivations = await sendMessageToServiceWorker({
    operation: "filterRecords",
    table: "youtube-limitations",
    property: "quick-add",
    value: true,
  });

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

/** FUNCTION: Update a specific record by ID
 *
 * @param {int} id - record id i.e. 1
 *
 * @param {array} newRecords - records, can be some or all properties
 *        within an existing table  i.e. { allDay: true }
 *
 * @returns {boolean} Returns if the process was successful or not
 *
 * @example let isValid = updateLimitationsDB(3, { quick-add: true });
 */
async function updateLimitationsDB(id, newRecords) {
  console.log(
    `Updating limitations DB for id: ${id} with new records: ${JSON.stringify(
      newRecords
    )}`
  );
  try {
    let sendUpdatedRecords = await sendMessageToServiceWorker({
      operation: "updateRecordByColumn",
      table: "youtube-limitations",
      column: "id",
      value: id,
      newRecords: newRecords,
    });

    if (sendUpdatedRecords.error) {
      console.error(
        `Error updating record for id: ${id}`,
        sendUpdatedRecords.message
      );
      return false;
    } else {
      console.log(
        `Record updated successfully for table youtube-limitations with column id, ${id} with new records ${JSON.stringify(
          newRecords
        )}.`
      );
      return true;
    }
  } catch (error) {
    console.error(`Error updating limitations DB for id: ${id}`, error);
    return false;
  }
}

/** FUNCTION: Check if the checkbox form choices are valid (boolean and settings saved successfully)
 *
 * @param {array} id - array of settings records
 *
 * @returns {boolean} Returns validity value
 *
 * @example const settings = [{name: 'home-page-quick', id: 1, isActive: true, isQuickAdd: true}, {name: 'shorts-page-quick', id: 2, isActive: true, isQuickAdd: true}];
 *          let isValid = isValidLimitations(3, settings);
 */
async function isValidLimitations(limitationChoices) {
  let isValid = true;
  for (const limitation of limitationChoices) {
    let quick;
    limitation.isQuickAdd ? (quick = true) : (quick = false);

    if (limitation.isQuickAdd) {
      isValid = await updateLimitationsDB(limitation.id, {
        "quick-add": limitation.isActive,
      });

      if (!isValid) {
        console.error("invalid");
        break;
      }
    } else {
      isValid = await updateLimitationsDB(limitation.id, {
        active: limitation.isActive,
      });

      if (!isValid) {
        console.error("invalid");
        break;
      }
    }
  }
}

// NOTE: ADDITIONAL WEBSITES FUNCTIONS

/** FUNCTION: Removes website from database and web page when delete button is pressed
 *
 * @param {int} websiteItemId - website ID from database, just a number
 *
 * @param {string} websiteType - website type from database
 *
 * @returns {void}
 *
 * @example attachWebsiteEditEvent(2, "social-media");
 */
function attachWebsiteEditEvent(websiteItemId, websiteType) {
  $(`[data-website-id='blocked-website-${websiteItemId}']`).on(
    "click",
    async function () {
      try {
        // Get website data from storage using ID
        /**
         * id: int,
         * name: string,
         * type: string,
         * url: string
         */
        let websiteObj = await sendMessageToServiceWorker({
          operation: "selectById",
          table: "additional-websites",
          index: websiteItemId,
        });

        // Open edit website popup
        populateWebsitePopup(websiteObj, false);

        return true;
      } catch (error) {
        console.error(error);
        // Optionally, you can display an error message to the user here
      }
    }
  );
}

/** ASYNC FUNCTION: Delete an additional website
 *
 * This function deletes a website from the "additional-websites" table in the service worker's storage.
 * It asks the user to confirm the deletion, sends a message to the service worker to delete the record,
 * and updates the DOM accordingly. If the deletion is unsuccessful, it displays an error message.
 *
 * @param {Object} websiteObj - The website object to be deleted, containing properties such as id and type.
 *
 * @returns {boolean} Returns true if the deletion is successful.
 *
 * @example await deleteAdditionalWebsite({ id: 1, type: "social" });
 */
async function deleteAdditionalWebsite(websiteObj) {
  try {
    // Asks user to confirm deletion
    if (window.confirm("Permanently delete this website?")) {
      let deleteWebsite = await sendMessageToServiceWorker({
        operation: "deleteRecordById",
        table: "additional-websites",
        id: parseInt(websiteObj.id),
      });

      // Displays error message if deleting is unsuccessful
      if (deleteWebsite.error) {
        displayNotifications(
          "Unsuccessfullly Deleted Website. Try Again Later.",
          "#d92121",
          "release_alert",
          5000
        );

        throw new Error(`${deleteWebsite.message}`);
      } else {
        document.getElementById("popover-new-blocked-website").hidePopover();

        // Removes website from DOM if deleting is successful
        let isWebsiteTypeEmpty =
          $(`#website-${websiteObj.type} li`).length === 1;

        if (!isWebsiteTypeEmpty) {
          $(`#blocked-website-${websiteObj.id}`).remove();
        } else {
          $(`#website-${websiteObj.type} + hr`).remove();
          $(`#website-${websiteObj.type}`).remove();

          // Displays empty content if there is no websites left
          if ($(`#additional-websites .content`).children().length === 0) {
            $(`#additional-websites .content`).css("display", "none");

            $("#additional-websites .empty-content")
              .fadeIn()
              .css("display", "flex");

            $("#additional-websites .dual-buttons").css("display", "none");
          }
        }

        displayNotifications(
          "Successfullly Deleted Website.",
          "#390",
          "verified",
          1000
        );
      }
    }
    return true;
  } catch (error) {
    console.error(error);
    // Optionally, you can display an error message to the user here
  }
}

/** FUNCTION: Checks if any websites are still in the website type group; if so, remove group from DOM
 *
 * @param {string} websiteType - website type from database, but follows 'website-' string
 *
 * @returns {void}
 *
 * @example isWebsiteTypeEmpty(`website-shopping`);
 */
function isWebsiteTypeEmpty(websiteType) {
  console.log($(`#${websiteType} li`).length);
  if ($(`#${websiteType} li`).length === 1) {
    $(`#${websiteType}`).slideUp(function () {
      // Removes the horizontal line below the website type group, then removes the group element
      $(`#${websiteType} + hr`).remove();
      $(`#${websiteType}`).remove();

      // Displays empty content if there is no websites left
      if ($(`#additional-websites .content`).children().length === 0) {
        $(`#additional-websites .content`).css("display", "none");

        $("#additional-websites .empty-content")
          .fadeIn()
          .css("display", "flex");
      }
    });
  }
}

/** FUNCTION: Reformts website type into a header. "social-media" -> "Social Media"
 *
 * @param {string} websiteType - website type from database - "social-media"
 *
 * @returns {string} formattedWord - "Social Media"
 *
 * @example reformatWebsiteType(`social-media`);
 */
function reformatWebsiteType(websiteType) {
  // Split the string by hyphens
  let splitArray = websiteType.split("-");

  // Capitalize the first letter of each word and join them with spaces
  let formattedType = splitArray
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return formattedType;
}

// NOTE: TODO: Split feature functions into their own JS files
/** FUNCTION: Inserts all websites from database into DOM
 *
 * @returns {void}
 *
 * @example insertAdditionalWebsites();
 */
async function insertAdditionalWebsites() {
  /** FUNCTION: Append website type
   *
   * This function appends a new website type group to the content container in the DOM.
   * It reformats the website type with proper capitalization, creates a new fieldset element,
   * and appends it to the content container. If the website type is not the last item, it also
   * appends a horizontal line after the type group.
   *
   * @param {string} type - The website type to be appended.
   * @param {boolean} isLastItem - A boolean indicating whether this is the last item.
   *
   * @returns {void}
   *
   * @example appendWebsiteType("social", false);
   */
  function appendWebsiteType(type, isLastItem) {
    // Website list container
    let websiteListElem = $("#additional-websites .content");

    // Reformats website type from database with proper capitalization
    let reformattedType = reformatWebsiteType(type);

    // Website Type Group Item
    let websiteTypeItem = $(`
      <fieldset id="website-${type}">
      </fieldset>`).append(`<legend>${reformattedType}</legend> <ul></ul>`);

    // Append new website type group into content container
    websiteListElem.append(websiteTypeItem);

    // Appends horizontal lines after each type besides the last one
    if (!isLastItem) {
      websiteListElem.append("<hr class='horizontal-line'>");
    }
  }

  /** FUNCTION: Append website item
   *
   * This function appends a new website item to its corresponding website type group in the DOM.
   * It creates a new list item element with the website's name and URL, and an edit button.
   * The new website item is then appended to the corresponding website type group and displayed with a slide-down effect.
   *
   * @param {Object} websiteObj - The website object to be appended, containing properties such as id, name, url, and type.
   *
   * @returns {void}
   *
   * @example appendWebsiteItem({ id: 1, name: "Example Site", url: "https://example.com", type: "social" });
   */
  function appendWebsiteItem(websiteObj) {
    // Website Item and it's children elements
    let websiteItem = $(`<li id="blocked-website-${websiteObj.id}"></li>`);
    websiteItem.append(`<span>
                          <h1>${websiteObj.name}</h1>
                          <p>${websiteObj.url}</p>
                        </span>`);
    websiteItem.append(`<button class="edit" data-website-id="blocked-website-${websiteObj.id}">
                          Edit
                        </button>`);

    // Append new website item to its corresponding website type group
    $(`#website-${websiteObj.type} ul`).append(websiteItem);
    websiteItem.slideDown();
  }

  /** FUNCTION: Group websites by type
   *
   * This function groups websites by their type for better DOM insertion.
   * It iterates over the array of websites and creates a new object where each key is a type
   * and the value is an array of websites that belong to that type.
   *
   * @param {Array} websites - Array of website objects to be grouped.
   *
   * @returns {Object} An object where each key is a type and the value is an array of websites that belong to that type.
   *
   * @example let groupedWebsites = groupWebsitesByType([{ id: 1, name: "Example Site", url: "https://example.com", type: "social" }]);
   */
  function groupWebsitesByType(websites) {
    return websites.reduce((acc, currentWebsite) => {
      const { type, ...rest } = currentWebsite;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(rest);
      return acc;
    }, {});
  }

  // Retrieve all additional websites
  let allWebsites = await sendMessageToServiceWorker({
    operation: "selectAll",
    table: "additional-websites",
  });

  // If there are no websites in database, display the empty content HTML
  if (Object.keys(allWebsites).length === 0) {
    $("#additional-websites .content").css("display", "none");
    $("#additional-websites .dual-buttons").css("display", "none");
    $("#additional-websites .empty-content").css("display", "flex");

    return; // Skip the rest of the code
  }

  let groupedByType = groupWebsitesByType(allWebsites);

  // Get the keys of the grouped object
  let types = Object.keys(groupedByType);

  // Iterates through each website and inserts the website data into DOM
  types.forEach((type, index) => {
    // Creates new fieldset for the website type
    let isLastItem = index === types.length - 1;
    appendWebsiteType(type, isLastItem);

    // Puts each website in the current website type in the recently created fieldset
    let websitesOfType = groupedByType[type];
    websitesOfType.forEach((currentWebsite) => {
      // Puts website data into its own object
      const websiteObj = {
        id: currentWebsite.id,
        name: currentWebsite.name,
        url: currentWebsite.url,
        type: type,
      };

      // Creates website items and inserts it into the fieldset
      appendWebsiteItem(websiteObj, isLastItem);

      // Adds an event listener to website item to be able delete them from DOM and database
      attachWebsiteEditEvent(websiteObj.id, websiteObj.type);
    });
  });
}

/** ASYNC FUNCTION: Resets the additional websites table back to default
 *
 * This function sends a message to the service worker to reset the "additional-websites" table to its default state.
 *
 * @returns {void}
 *
 * @example clearAllWebsites();
 */
async function clearAllWebsites() {
  let result = await sendMessageToServiceWorker({
    operation: "resetTable",
    table: "additional-websites",
  });

  return result;
}

/** FUNCTION: Populate website popup
 *
 * This function populates the website popup form with the provided website information.
 * If adding a new website, it leaves the form blank, hides the delete button, and sets the submit button for adding a new website.
 * If editing an existing website, it populates the form with the website's information, shows the delete button, and sets the submit button for saving the existing website.
 *
 * @param {Object} websiteObj - The website object containing properties such as id, name, url, and type.
 * @param {boolean} isNewWebsite - A boolean indicating whether this is a new website (true) or an existing website (false).
 *
 * @returns {void}
 *
 * @example populateWebsitePopup({ id: 1, name: "Example Site", url: "https://example.com", type: "social" }, false);
 */
function populateWebsitePopup(websiteObj, isNewWebsite) {
  // If adding new website, leave form blank,
  // --- hide delete website button, set submit button id to "block-website"
  if (isNewWebsite) {
    $("#delete-website").hide();
    $("#popover-new-blocked-website header h1").html("New Website");
    $("#new-blocked-website-form input").val("");
    $("#new-blocked-website-form select").val("");
    $("#new-blocked-website-form #update-website").hide();
    $("#new-blocked-website-form #block-new-website")
      .show()
      .attr("data-website-id", null);
  } else {
    // If editing existing website, populate form with website info,
    // --- show delete website button and attach website id, set submit button id to "save-website"
    $("#delete-website").show().attr("data-website-id", websiteObj.id);
    $("#popover-new-blocked-website header h1").html("Edit Website");
    $("#website-name").val(websiteObj.name);
    $("#website-url").val(websiteObj.url);
    $("#website-type").val(websiteObj.type);
    $("#new-blocked-website-form #block-new-website").hide();
    $("#new-blocked-website-form #update-website")
      .show()
      .attr("data-website-id", websiteObj.id);
  }

  document.getElementById("popover-new-blocked-website").showPopover();
}

/** FUNCTION: Save website to database
 *
 * This function saves a website to the "additional-websites" table in the service worker's storage.
 * It validates the form, retrieves the form values, and either inserts a new website or updates an existing website.
 * It also handles form submission, button state, and displays notifications based on the result.
 *
 * @param {Event} formEvent - The form submission event.
 * @param {boolean} isNewWebsite - A boolean indicating whether this is a new website (true) or an existing website (false).
 * @param {string} buttonID - The ID of the submit button.
 *
 * @returns {boolean} Returns true if the save operation is successful.
 *
 * @example saveWebsiteToDatabase(event, true, "block-new-website");
 */
function saveWebsiteToDatabase(formEvent, isNewWebsite, buttonID) {
  /** FUNCTION: Check if form is valid
   *
   * This function checks if the form is valid and reports validity if not.
   *
   * @param {HTMLFormElement} form - The form element to be validated.
   *
   * @returns {boolean} Returns true if the form is valid, false otherwise.
   */
  function isFormValid(form) {
    if (!form.checkValidity()) {
      form.reportValidity();
      return false;
    }
    return true;
  }

  /** FUNCTION: Get data-website-id attribute
   *
   * This function retrieves the data-website-id attribute from the submit button.
   *
   * @param {string} buttonID - The ID of the submit button.
   *
   * @returns {string|null} Returns the data-website-id attribute value or null if not found.
   */
  function getDataWebsiteID(buttonID) {
    return (
      $(`#new-blocked-website-form #${buttonID}`).attr("data-website-id") ||
      null
    );
  }

  /** FUNCTION: Get form values
   *
   * This function retrieves the values from the form inputs.
   *
   * @param {string} buttonID - The ID of the submit button.
   *
   * @returns {Object} Returns an object containing the form values.
   */
  function getFormValues(buttonID) {
    return {
      name: $("#website-name").val(),
      url: $("#website-url").val(),
      type: $("#website-type").val(),
      id: parseInt(getDataWebsiteID(buttonID)),
    };
  }

  /** FUNCTION: Get website details
   *
   * This function validates the form and retrieves the form values.
   *
   * @param {string} buttonID - The ID of the submit button.
   *
   * @returns {Object} Returns an object containing the website details.
   */
  function getWebsiteDetails(buttonID) {
    // Get the form element
    const form = document.getElementById("new-blocked-website-form");

    // Check if the form is valid
    isFormValid(form);

    // Get form values
    const newWebsiteObj = getFormValues(buttonID);

    return newWebsiteObj;
  }

  /** Saves new additional website to database */
  try {
    // Disable default form submission event; prevents automatic page reload
    formEvent.preventDefault();

    // Disable the submit button
    const $button = $(`#${buttonID}`);
    $button.prop("disabled", true);
    $button.parent().toggleClass("spin-animation");

    // Saves website to database
    // -- new site will create a new website id; existing site will use the ID to update website data
    setTimeout(async function () {
      let saveWebsiteResult;
      let websiteObj = getWebsiteDetails(buttonID);

      if (isNewWebsite) {
        // Inserts new website object into database
        saveWebsiteResult = await sendMessageToServiceWorker({
          operation: "insertRecords",
          table: "additional-websites",
          records: [websiteObj],
        });
      } else {
        // Updates current website's data
        saveWebsiteResult = await sendMessageToServiceWorker({
          operation: "updateRecordByColumn",
          table: "additional-websites",
          column: "id",
          value: websiteObj.id,
          newRecords: websiteObj,
        });
      }

      // Re-enable button after animation
      $button.parent().toggleClass("spin-animation");
      $button.prop("disabled", false);

      // Gets status message from insertion
      if (saveWebsiteResult.error) {
        displayNotifications(
          "Could not update this website. Try again later.",
          "#d92121",
          "release_alert",
          5000
        );
        throw new Error(`${saveWebsiteResult.message}`);
      } else {
        console.log(saveWebsiteResult.data);

        // Reload webpage to load in new website
        location.reload();
      }

      return true;
    }, 2000);
  } catch (error) {
    console.error(error);
    return false;
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

  /** ONLOAD FUNCTION CALL: Inserts all websites from database into DOM */
  insertAdditionalWebsites();

  /** !SECTION */

  /** SECTION - EVENT LISTENERS */

  /** EVENT LISTENER: Popover won't close when cancel button is pressed if the form is incomplete in any way */
  $(".cancel").on("click", function () {
    const popoverId = $(this).attr("data-popover");
    document.querySelector(`#${popoverId}`).togglePopover();
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

    console.log(limitationChoices);

    if (limitationChoices.length == 0) {
      displayNotifications("No Changes to Save.", "#40a6ce", "info", 2500);

      // Re-enable button after animation
      $button.prop("disabled", false);
      $button.parent().toggleClass("spin-animation");

      return;
    } else {
      $('#limitation-settings input[type="checkbox"]').removeClass("changed");
    }
    console.log(limitationChoices);

    // FIXME: isValid returns promise, not a boolean value
    // replicate this by clearing storage, then trying to save to non-existant storage
    // NOTE: possibly use .then()
    let isValid = isValidLimitations(limitationChoices);

    setTimeout(function () {
      // Start animation on status message, depending saving outcome
      if (isValid) {
        displayNotifications("Saved Successfully", "#390", "verified", 2000);

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

  //
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
        ? displayNotifications("Saved Successfully", "#390", "verified", 2000)
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

  /** EVENT LISTENER: Saves new additional website to database
   *
   * This event listener triggers the saveWebsiteToDatabase function to save a new website to the database.
   * It passes the form submission event, a boolean indicating it's a new website, and the button ID to the function.
   *
   * @param {Event} event - The form submission event.
   */
  $("#block-new-website").on("click", async function (event) {
    saveWebsiteToDatabase(event, true, event.target.id);
  });

  /** EVENT LISTENER: Saves existing website to database
   *
   * This event listener triggers the saveWebsiteToDatabase function to save an existing website to the database.
   * It passes the form submission event, a boolean indicating it's an existing website, and the button ID to the function.
   *
   * @param {Event} event - The form submission event.
   */
  $("#update-website").on("click", async function (event) {
    saveWebsiteToDatabase(event, false, event.target.id);
  });

  /** EVENT LISTENER: Opens the website popup for adding a new website
   *
   * This event listener triggers the populateWebsitePopup function to open the website popup form for adding a new website.
   * It passes an empty object and a boolean indicating it's a new website to the function.
   */
  $(".add-new-website").on("click", function () {
    populateWebsitePopup({}, true);
  });

  /** EVENT LISTENER: Deletes an existing website
   *
   * This event listener triggers the deleteAdditionalWebsite function to delete an existing website from the database.
   * It retrieves the website ID from the data-website-id attribute and passes the website object to the function.
   *
   * @param {Event} event - The form submission event.
   */
  $("#delete-website").on("click", async function (event) {
    event.preventDefault();
    let websiteItemId = $(this).attr("data-website-id");

    let websiteObj = await sendMessageToServiceWorker({
      operation: "selectById",
      table: "additional-websites",
      index: parseInt(websiteItemId),
    });

    deleteAdditionalWebsite(websiteObj);
  });

  /** EVENT LISTENER: Resets the additional websites table
   *
   * This event listener triggers the resetTable function to reset the "additional-websites" table in the database.
   */
  $("#clear-websites").on("click", async function () {
    clearAllWebsites();

    location.reload();
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
    if (window.confirm("Confirm to reset ALL settings.")) {
      // Sets all checkboxes to unchecked
      clearLimitationInputs();

      // Save settings
      const limitationInputs = getLimitationInputs();

      console.log(limitationInputs);

      // FIXME: isValid returns promise, not a boolean value
      // replicate this by clearing storage, then trying to save to non-existant storage
      // NOTE: possibly use .then()
      let isValid = isValidLimitations(limitationInputs);

      console.log(isValid);

      setTimeout(function () {
        // Start animation on status message, depending saving outcome
        if (isValid) {
          displayNotifications("Saved Successfully", "#390", "verified", 2000);

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

/** !SECTION */
