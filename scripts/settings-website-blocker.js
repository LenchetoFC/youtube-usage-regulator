/**
 * @file settings-website-blocker.js
 * @description Controls the website blocker section of the settings page
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @requires module:global-functions
 * @see {@link module:global-functions.displayNotifications}
 * @see {@link module:global-functions.selectRecordByIdGlobal}
 * @see {@link module:global-functions.deleteRecordByIdGlobal}
 * @see {@link module:global-functions.selectAllRecordsGlobal}
 * @see {@link module:global-functions.insertRecordsGlobal}
 * @see {@link module:global-functions.updateRecordByPropertyGlobal}
 * @see {@link module:global-functions.resetTableGlobal}
 */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

/**
 * TODO
 */

/**
 * Removes website from database and web page when delete button is pressed
 *
 * @name attachEditEvents
 *
 * @param {int} websiteItemId - website ID from database, just a number
 *
 * @returns {void}
 *
 * @example attachEditEvents(2, "social-media");
 */
function attachEditEvents(websiteItemId) {
  $(`button[data-website-id='blocked-website-${websiteItemId}']`).on(
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
        let websiteObj = await selectRecordByIdGlobal(
          "additional-websites",
          websiteItemId
        );

        // Open edit website popup
        populateWebsitePopup(websiteObj, false);

        return true;
      } catch (error) {
        console.error(error);
        // Optionally, you can display an error message to the user here
      }
    }
  );

  $(`input[data-website-id='blocked-website-${websiteItemId}']`).on(
    "click",
    async function () {
      try {
        const $isActive = $(this).is(":checked");

        // Get website data from storage using ID
        /**
         * active: boolean
         */
        // Updates current website's data
        const updateResult = await updateRecordByPropertyGlobal(
          "additional-websites",
          "id",
          parseInt(websiteItemId),
          { active: $isActive }
        );

        // Gets status message from update
        if (updateResult.error) {
          displayNotifications(
            "Could not update this website. Try again later.",
            "#d92121",
            "release_alert",
            5000
          );
          throw new Error(updateResult.message);
        } else {
          console.log(updateResult.message);

          // Loads in new websites
          // insertAdditionalWebsites();
          // document.getElementById("popover-new-blocked-website").hidePopover();

          displayNotifications(
            `Successfully ${$isActive ? "enabled" : "disabled"} website!`,
            "#390",
            "verified",
            2000
          );
        }

        return true;
      } catch (error) {
        console.error(error);
        // Optionally, you can display an error message to the user here
      }
    }
  );
}

/**
 * Delete an additional website
 *
 * This function deletes a website from the "additional-websites" table in the service worker's storage.
 * It asks the user to confirm the deletion, sends a message to the service worker to delete the record,
 * and updates the DOM accordingly. If the deletion is unsuccessful, it displays an error message.
 *
 * @name deleteAdditionalWebsite
 * @async
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
    console.log(websiteObj.id);
    if (window.confirm("Permanently delete this website?")) {
      let deleteWebsite = await deleteRecordByIdGlobal(
        "additional-websites",
        websiteObj.id
      );

      // Displays error message if deleting is unsuccessful
      if (deleteWebsite.error) {
        displayNotifications(
          "Unsuccessfully deleted website. Try again later.",
          "#d92121",
          "release_alert",
          5000
        );

        throw new Error(`${deleteWebsite.message}`);
      } else {
        document.getElementById("popover-new-blocked-website").hidePopover();

        displayNotifications(
          "Successfully deleted website!",
          "#390",
          "verified",
          2000
        );
      }
    }
    return true;
  } catch (error) {
    console.error(error);
    // Optionally, you can display an error message to the user here

    return false;
  }
}

/**
 * Reformats website type into a header. "social-media" -> "Social Media"
 *
 * @name reformatWebsiteType
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

/**
 * Inserts all websites from database into DOM
 *
 * @name insertAdditionalWebsites
 * @async
 *
 * @returns {void}
 *
 * @example insertAdditionalWebsites();
 */
async function insertAdditionalWebsites() {
  /**
   * Append website item
   *
   * This function appends a new website item to the website table.
   * It creates a new table row element with the website's name, URL, type, and a button to edit item.
   *
   * @name appendWebsiteItem
   *
   * @param {Object} websiteObj - The website object to be appended, containing properties such as id, name, url, and type.
   *
   * @returns {void}
   *
   * @example appendWebsiteItem({ id: 1, name: "Example Site", url: "https://example.com", type: "social-media" });
   */
  function appendWebsiteItem(websiteObj) {
    const websiteListElem = $("#website-table tbody");

    let watchTimeItem = $(`<tr class="search-item">
                            <td>${websiteObj.name}</td>
                            <td>${websiteObj.url}</td>
                            <td>${reformatWebsiteType(websiteObj.type)}</td>
                            
                            <td>
                              <label class="side-checkbox-container">
                                <input ${websiteObj.active ? "checked" : ""}
                                  data-website-id="blocked-website-${
                                    websiteObj.id
                                  }" type="checkbox">
                                <span class="checkmark">
                                  <span class="material-symbols-rounded" >check</span>
                                </span>
                              </label>
                            </td>
                            <td>
                              <button class="button-brand edit" data-website-id="blocked-website-${
                                websiteObj.id
                              }">
                                Edit
                              </button>
                            </td>
                          </tr>`);

    websiteListElem.prepend(watchTimeItem);
  }

  /** Main body */
  // Ensures the container is empty
  $("#website-table tbody").html("");

  // Retrieve all additional websites
  let allWebsites = await selectAllRecordsGlobal("additional-websites");

  // If there are no websites in database, display the empty content HTML
  if (Object.keys(allWebsites).length === 0) {
    $("#website-table").css("display", "none");
    $("#additional-websites #website-buttons").css("display", "none");
    $("#additional-websites .empty-content").css("display", "flex");

    return; // Skip the rest of the code
  } else {
    $("#website-table").css("display", "block");
    $("#additional-websites #website-buttons").css("display", "flex");
    $("#additional-websites .empty-content").css("display", "none");
  }

  // Inserts each website item into table, sorted by added date
  allWebsites.forEach((websiteObj) => {
    // Creates website items and inserts it into the fieldset
    appendWebsiteItem(websiteObj);

    // Adds an event listener to website item to be able delete them from DOM and database
    attachEditEvents(websiteObj.id, websiteObj.type);
  });
}

/**
 * Populate website popup
 *
 * This function populates the website popup form with the provided website information.
 * If adding a new website, it leaves the form blank, hides the delete button, and sets the submit button for adding a new website.
 * If editing an existing website, it populates the form with the website's information, shows the delete button, and sets the submit button for saving the existing website.
 *
 * @name populateWebsitePopup
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
    $("#delete-website, label:has(input)").hide().prop("disabled", true);
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
    $("#delete-website")
      .show()
      .attr("data-website-id", websiteObj.id)
      .prop("disabled", false);
    $("#popover-new-blocked-website header h1").html("Edit Website");
    $("#website-name").val(websiteObj.name);
    $("#website-url").val(websiteObj.url);
    $("#website-type").val(websiteObj.type);
    $("#new-blocked-website-form #block-new-website").hide();
    $("#new-blocked-website-form #update-website")
      .show()
      .attr("data-website-id", websiteObj.id);

    $("#enabled-website").prop("checked", websiteObj.active);
  }

  document.getElementById("popover-new-blocked-website").showPopover();
}

/**
 * Save website to database
 *
 * This function saves a website to the "additional-websites" table in the service worker's storage.
 * It validates the form, retrieves the form values, and either inserts a new website or updates an existing website.
 * It also handles form submission, button state, and displays notifications based on the result.
 *
 * @name saveWebsiteToDatabase
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
  /**
   * Check if form is valid
   *
   * This function checks if the form is valid and reports validity if not.
   *
   * @name isFormValid
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

  /**
   * Get data-website-id attribute
   *
   * This function retrieves the data-website-id attribute from the submit button.
   *
   * @name getDataWebsiteID
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

  /**
   * Get form values
   *
   * This function retrieves the values from the form inputs.
   *
   * @name getFormValues
   *
   * @param {string} buttonID - The ID of the submit button.
   *
   * @returns {Object} Returns an object containing the form values.
   */
  function getFormValues(buttonID) {
    return {
      active: true,
      name: $("#website-name").val(),
      url: $("#website-url").val(),
      type: $("#website-type").val(),
      active: $("#enabled-website").is(":checked"),
      id: parseInt(getDataWebsiteID(buttonID)),
    };
  }

  /**
   * Get website details
   *
   * This function validates the form and retrieves the form values.
   *
   * @name getWebsiteDetails
   *
   * @param {string} buttonID - The ID of the submit button.
   *
   * @returns {Object} Returns an object containing the website details.
   */
  function getWebsiteDetails(buttonID) {
    // Get the form element
    const form = document.getElementById("new-blocked-website-form");

    // Check if the form is valid
    let formValidity = isFormValid(form);

    // Get form values
    if (formValidity) {
      const newWebsiteObj = getFormValues(buttonID);

      return newWebsiteObj;
    } else {
      return false;
    }
  }

  /** Saves new additional website to database */
  try {
    // Disable default form submission event; prevents automatic page reload
    formEvent.preventDefault();

    // Disable the submit button
    toggleButtonAnimation(`#${buttonID}`, true);

    // Saves website to database
    // -- new site will create a new website id; existing site will use the ID to update website data
    setTimeout(async function () {
      let saveWebsiteResult;
      let websiteObj = getWebsiteDetails(buttonID);

      // If form is invalid, end function
      if (!websiteObj) {
        // Re-enable button after animation
        toggleButtonAnimation(`#${buttonID}`, false);

        return;
      }

      if (isNewWebsite) {
        // Inserts new website object into database
        saveWebsiteResult = await insertRecordsGlobal("additional-websites", [
          websiteObj,
        ]);
      } else {
        // Updates current website's data
        saveWebsiteResult = await updateRecordByPropertyGlobal(
          "additional-websites",
          "id",
          parseInt(websiteObj.id),
          websiteObj
        );
      }

      // Re-enable button after animation
      toggleButtonAnimation(`#${buttonID}`, false);

      // Gets status message from insertion
      if (saveWebsiteResult.error) {
        displayNotifications(
          `Could not ${
            isNewWebsite ? "add" : "update"
          } this website. Try again later.`,
          "#d92121",
          "release_alert",
          5000
        );
        throw new Error(saveWebsiteResult.message);
      } else {
        console.log(saveWebsiteResult.message);

        // Loads in new websites
        insertAdditionalWebsites();
        document.getElementById("popover-new-blocked-website").hidePopover();

        displayNotifications(
          `Successfully ${isNewWebsite ? "added" : "updated"} new website!`,
          "#390",
          "verified",
          2000
        );
      }

      return true;
    }, 2000);
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
  /** ONLOAD FUNCTION CALL: Inserts all websites from database into DOM */
  insertAdditionalWebsites();

  /**
   * Saves new additional website to database
   *
   * This event listener triggers the saveWebsiteToDatabase function to save a new website to the database.
   * It passes the form submission event, a boolean indicating it's a new website, and the button ID to the function.
   *
   * @name saveNewWebsiteEventListener
   *
   * @param {Event} event - The form submission event.
   */
  $("#block-new-website").on("click", async function (event) {
    saveWebsiteToDatabase(event, true, event.target.id);
  });

  /**
   * Saves existing website to database
   *
   * This event listener triggers the saveWebsiteToDatabase function to save an existing website to the database.
   * It passes the form submission event, a boolean indicating it's an existing website, and the button ID to the function.
   *
   * @name saveExistingWebsiteEventListener
   *
   * @param {Event} event - The form submission event.
   */
  $("#update-website").on("click", async function (event) {
    saveWebsiteToDatabase(event, false, event.target.id);
  });

  /**
   * Opens the website popup for adding a new website
   *
   * This event listener triggers the populateWebsitePopup function to open the website popup form for adding a new website.
   * It passes an empty object and a boolean indicating it's a new website to the function.
   *
   * @name openNewWebsitePopupEventListener
   */
  $(".add-new-website").on("click", function () {
    populateWebsitePopup({}, true);
  });

  /**
   * Deletes an existing website
   *
   * This event listener triggers the deleteAdditionalWebsite function to delete an existing website from the database.
   * It retrieves the website ID from the data-website-id attribute and passes the website object to the function.
   *
   * @name deleteWebsiteEventListener
   *
   * @param {Event} event - The form submission event.
   */
  $("#delete-website").on("click", async function (event) {
    event.preventDefault();
    let websiteItemId = $(this).attr("data-website-id");

    let websiteObj = await selectRecordByIdGlobal(
      "additional-websites",
      parseInt(websiteItemId)
    );

    let isSuccessful = await deleteAdditionalWebsite(websiteObj);

    if (isSuccessful) {
      insertAdditionalWebsites();

      if ($(`#website-table`).children().length === 0) {
        $(`#website-table`).css("display", "none");

        $("#additional-websites .empty-content")
          .fadeIn()
          .css("display", "flex");

        $("#additional-websites #website-buttons").css("display", "none");
      }
    }
  });

  /**
   * Resets the additional websites table
   *
   * This event listener triggers the resetTable function to reset the "additional-websites" table in the database.
   *
   * @name resetWebsitesTableEventListener
   */
  $("#clear-websites").on("click", async function () {
    try {
      // Ask user to confirm choice
      if (window.confirm("Confirm to delete ALL blocked websites...")) {
        const result = await resetTableGlobal("additional-websites");

        if (!result.error) {
          displayNotifications(
            "Deleted websites successfully!",
            "#390",
            "verified",
            2000
          );

          insertAdditionalWebsites();
        } else {
          displayNotifications(result.message, "#d92121", "error", 5000);
        }
      }
    } catch (error) {
      console.error(error);
    }
  });
});
/** !SECTION */
