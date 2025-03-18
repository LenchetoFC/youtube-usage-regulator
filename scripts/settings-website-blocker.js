/**
 * @file settings-website-blocker.js
 * @description Controls the website blocker section of the settings page
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @requires module:global-functions
 * @see {@link module:global-functions.displayNotifications}
 * @see {@link module:global-functions.updateRecordByPropertyGlobal}
 */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

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
  // Use optional chaining to check if websiteType is not null or undefined
  let splitArray = websiteType?.split("-");

  // If websiteType is null or undefined, return an empty string or handle it as needed
  if (!splitArray) return "";

  // Capitalize the first letter of each word and join them with spaces
  let formattedType = splitArray
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return formattedType;
}

/**
 * Inserts all websites from database into DOM
 *
 * @name insertWebsitesIntoPage
 * @async
 *
 * @returns {void}
 *
 * @example insertWebsitesIntoPage();
 */
async function insertWebsitesIntoPage() {
  // Function to generate HTML for a website
  function generateWebsiteHTML(website) {
    const { id, name, type, url, active } = website;

    return `
      <tr class="search-item" id="${id}">
        <td>${name}</td>
        <td>${url}</td>
        <td>${reformatWebsiteType(type)}</td>
        
        <td>
          <label class="side-checkbox-container">
            <input class="enable-item" ${active ? "checked" : ""}
              name="active-${id}"
              data-item-id="${id}" data-table="additional-websites" type="checkbox">
             
            <span class="checkmark">
              <span class="material-symbols-rounded" >check</span>
            </span>
          </label>
          
        </td>

        <td>
          <button class="button-brand edit-item" data-item-id="${id}">
            Edit
          </button>
        </td>
      </tr>`;
  }

  /** Main body */
  // Gets all additional websites
  const allWebsites = await selectAllRecords("additional-websites");

  // Depends on if there is at least one website, show or hide some content
  const amtOfWebsites = Object.keys(allWebsites)?.length ?? 0;
  displayEmptyContent("#additional-websites", amtOfWebsites);
  if (amtOfWebsites === 0) {
    return;
  }

  // Iterates through all websites and insert them into page one at a time
  (allWebsites ?? []).forEach((website) => {
    // Generate the HTML for each website
    const baseHtml = generateWebsiteHTML(website);

    // Append base HTML to widget container
    $("#website-table tbody").append(baseHtml);
  });

  // Toggle active state of website in database
  $(".edit-item").on("click", async function () {
    const websiteId = $(this).attr("data-item-id");

    // prepare popover
    const websiteData = await selectRecordById(
      "additional-websites",
      websiteId
    );
    populatePopover(websiteData);
    determineFormFooterButtons(false, websiteData);

    // open popover
    const popover = document.querySelector("#popover-new-website-item");
    popover?.showPopover();
  });

  // Toggle active state of website in database
  $(".enable-item").on("click", async function () {
    const $isActive = $(this).is(":checked");

    // Calls function in settings-popover-form-controls to enable item
    let results = await enableItem(this);

    if (results) {
      displayNotifications(
        "page-notif-msg",
        `Successfully ${$isActive ? "enabled" : "disabled"} website!`,
        "#390",
        "verified",
        2000
      );
    } else {
      displayNotifications(
        "page-notif-msg",
        "Could not update this item. Try again later.",
        "#d92121",
        "release_alert",
        5000
      );
    }
  });
}

/**
 * Displays buttons and content if there are any existing in database
 *
 * @name displayEmptyContent
 *
 * @param {string} parentContainerId - ID of parent container that contains all affected elements
 * @param {number} childrenNum - Number of content items found to append to DOM
 *
 * @returns {void}
 *
 * @example displayEmptyContent("#additional-websites", 2);
 */
function displayEmptyContent(parentContainerId, childrenNum) {
  if (childrenNum === 0) {
    // show empty content
    $(`${parentContainerId}`)
      .find(".empty-content")
      .removeClass("hidden")
      .attr("data-visible", "true");
  } else {
    // Show group of buttons && website table
    $(`${parentContainerId}`)
      .find(".group-of-buttons")
      .removeClass("hidden")
      .attr("data-visible", "true");
    $(`${parentContainerId}`)
      .find("#website-table")
      .removeClass("hidden")
      .attr("data-visible", "true");
  }
}

/**
 * Populate website popup
 *
 * This function populates the website popup form with the provided website information.
 * If adding a new website, it leaves the form blank, hides the delete button, and sets the submit button for adding a new website.
 * If editing an existing website, it populates the form with the website's information, shows the delete button, and sets the submit button for saving the existing website.
 *
 * @name populatePopover
 *
 * @param {Object} websiteObj - The website object containing properties such as id, name, url, and type.
 *
 * @returns {void}
 *
 * @example populatePopover({ id: 1, name: "Example Site", url: "https://example.com", type: "social" }, false);
 */
function populatePopover(websiteObj) {
  const { id, name, type, url, active } = websiteObj;

  // Finds all required form elements
  const $popover = $("#popover-new-website-item");
  const $form = $popover.find("form");
  const $header = $popover.find("header h1");
  const $websiteNameInput = $popover.find("input#website-name");
  const $websiteUrlInput = $popover.find("input#website-url");
  const $websiteTypeInput = $popover.find("select#website-type");
  const $activeCheckbox = $popover.find("input#active");

  // Fills inputs with website info
  $form.attr("data-item-id", id);
  $header.text("Update Website");
  $websiteNameInput.val(name);
  $websiteUrlInput.val(url);
  $websiteTypeInput.val(type);

  // Checks if active is true
  $activeCheckbox.prop("checked", active);
}

/**
 * This function retrieves the values from the form inputs.
 *
 * @name getFormValues
 *
 * @param {string} $form - jquery object of the form.
 *
 * @returns {Object} Returns an object containing the form values.
 *
 * @example const formValues = getFormValues($('#form-id'))
 *
 * @note custom getFormValues() for this page's forms only
 *
 */
function getFormValues($form) {
  const formValues = {
    name: $form.find("#website-name").val(),
    url: $form.find("#website-url").val(),
    type: $form.find("#website-type").val(),
    active: $form.find("#active").is(":checked"),
  };

  // if updating website, add website ID to object
  // missing ID means this is a new site and will create a new ID when adding to database
  const websiteId = $form.attr("data-item-id");
  if (websiteId) {
    formValues.id = parseInt(websiteId, 10);
  }

  return formValues;
}

/**
 * Resets header titles and checkboxes that form.reset() can't do
 *
 * @name resetForm
 *
 * @returns {void}
 *
 * @example resetForm()
 *
 */
function resetForm() {
  const $popover = $("#popover-new-website-item");
  const $header = $popover.find("header h1");
  const $activeCheckbox = $popover.find("input#active");

  $header.text("New Website");

  $activeCheckbox.prop("checked", true);

  // Clear all text input in form
  clearFormValues("new-website-item");

  // Decides to show update, add, or delete item buttons based on existing or new item
  // ... in this case, only shows add button
  determineFormFooterButtons(true, {});
}

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(async function () {
  /** ONLOAD FUNCTION CALL: Inserts all websites from database into DOM */
  await insertWebsitesIntoPage();

  /** Form Button Event Listeners */
  // Reset the popover form whenever a new website is intended to be added
  $(".add-new-item").on("click", function () {
    resetForm();
  });
});
/** !SECTION */
