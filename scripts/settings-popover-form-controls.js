/**
 * @file settings-popover-form-controls.js
 * @description This file contains popover form related functions to control the form or iteract with database
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 */

/**
 * Update item through the enabled checkbox on item table or grid
 *
 * @name enableItem
 *
 * @param {string} $button - jquery object of the button that was pressed to get all the attributes
 *
 * @returns {boolean} Returns true if the update operation is successful.
 *
 * @example let results = enableItem($button);
 */
async function enableItem($button) {
  try {
    const $table = $($button).attr("data-table");
    const $itemId = $($button).attr("data-item-id");
    const $isActive = $($button).is(":checked");

    // Updates current groups's data
    const updateResult = await updateRecordByPropertyGlobal(
      $table,
      "id",
      parseInt($itemId),
      { active: $isActive }
    );

    // Gets status message from update
    if (updateResult.error) {
      throw new Error(updateResult.message);
    }

    return true;
  } catch (error) {
    console.error(error);

    return false;
  }
}

/**
 * Save website to database
 *
 * This function updates a table with values from a form in the service worker's storage.
 * It validates the form, retrieves the form values, and either inserts a new table item or updates an existing item.
 * It also handles form submission, button state, and displays notifications based on the result.
 *
 * @name saveItemToDatabase
 *
 * @param {string} table - table name that will be updated
 * @param {string} formId - the ID of the form to get details
 * @param {string} buttonID - The ID of the submit button.
 *
 * @returns {boolean} Returns true if the save operation is successful.
 *
 * @example saveItemToDatabase('spoiler-groups', 'new-spoiler-groups', "update-item");
 */
function saveItemToDatabase(table, formId, buttonID) {
  /**
   * Check if form is valid
   *
   * This function checks if the form is valid and reports validity if not.
   *
   * @name checkFormValid
   *
   * @param {string} formId - The ID of the form to be validated.
   *
   * @returns {boolean} Returns true if the form is valid, false otherwise.
   */
  function checkFormValid(formId) {
    const form = document.querySelector(`#${formId}`);
    if (!form?.checkValidity() ?? false) {
      form?.reportValidity() ?? false;
      return false;
    }
    return true;
  }

  /** Saves new or existing item to database */
  try {
    // Disable the submit button
    toggleButtonAnimation(`button#${buttonID}`, true);

    // Saves item to database
    // -- new item will create a new item id; existing item will use the ID to update item data
    setTimeout(async function () {
      let results;
      let newItemObj;

      // Check if the form is valid
      let isFormValid = checkFormValid(formId);

      // Get form values
      if (isFormValid) {
        // NOTE: Requires getFormValues() from base page javascript
        const $form = $(`#${formId}`);
        newItemObj = getFormValues($form);
      } else {
        toggleButtonAnimation(`button#${buttonID}`, false);
        return false;
      }

      const isNewItem = !newItemObj.id;

      if (isNewItem) {
        // Inserts new item object into database
        results = await insertRecordsGlobal(table, [newItemObj]);
      } else {
        // Updates existing item's data
        results = await updateRecordByPropertyGlobal(
          table,
          "id",
          parseInt(newItemObj.id),
          newItemObj
        );
      }

      // Re-enable button after animation
      toggleButtonAnimation(`button#${buttonID}`, false);

      // Gets status message from insertion
      if (results.error) {
        displayNotifications(
          `Could not ${
            isNewItem ? "add" : "update"
          } this item. Try again later.`,
          "#d92121",
          "release_alert",
          5000
        );
        throw new Error(results.message);
      } else {
        // Reloads webpage
        window.location.reload();
      }

      return true;
    }, 2000);
  } catch (error) {
    console.error(error);
    return false;
  }
}

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
function clearFormValues(formId) {
  const form = document.querySelector(`#${formId}`);
  form?.removeAttribute("data-group-id");
  form?.reset();
}

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
function determineFormFooterButtons(isNewItem, itemData) {
  const { id } = itemData;
  if (isNewItem) {
    // Shows 'add new group' button and sets container to flex end (default)
    $("#add-item").css("display", "flex");
    $(".overlay-buttons:has(#delete-item)").css("justify-content", "flex-end");

    // Hides delete and update buttons
    $("#delete-item").css("display", "none");
    $("#update-item").css("display", "none");
  } else {
    // Shows delete button and adds group id as attribute value
    $("#delete-item").attr("data-item-id", id);
    $("#delete-item").css("display", "flex");

    // Shows update button and adds group id as attribute value
    $("#update-item").attr("data-item-id", id);
    $("#update-item").css("display", "flex");

    // Hides 'add new group' button and container to space between
    $("#add-item").css("display", "none");
    $(".overlay-buttons:has(#delete-item)").css(
      "justify-content",
      "space-between"
    );
  }
}

/** WINDOW ONLOAD FUNCTIONS - ASSIGN EVENT LISTENERS */
$(document).ready(async function () {
  // Submit group form through submit button in popovers
  $('.popover button[type="submit"]').on("click", function (event) {
    // Disable default form submission event; prevents automatic page reload
    event.preventDefault();

    const table = $(this).attr("data-table");
    const formId = $(this).closest("form").attr("id");

    saveItemToDatabase(table, formId, $(this).attr("id"));
  });

  // Allows user to press 'enter' key to submit form
  $("form").on("keypress", function (event) {
    // 13 equals 'enter' key
    if (event.which === 13) {
      // Disable default form submission event; prevents automatic page reload
      event.preventDefault();

      const table = $(this).attr("data-table");
      const formId = $(this).closest("form").attr("id");

      saveItemToDatabase(
        table,
        formId,
        $(this).find('button[type="submit"]').attr("id")
      );
    }
  });

  // Delete current item
  $("#delete-item").on("click", function (event) {
    // Disable default form submission event; prevents automatic page reload
    event.preventDefault();

    const table = $(this).closest("form").attr("data-table");
    const itemId = $(this).attr("data-item-id");

    deleteItemFromDatabase(table, itemId);
  });
});
