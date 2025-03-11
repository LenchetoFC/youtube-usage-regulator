/**
 * @file settings-spoiler-detection.js
 * @description This file contains spoiler-detection-related functions and event listeners for the spoilers free page.
 * It handles saving, deleting, and editing spoiler groups .
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 */

/**
 * SECTION - SPECIALIZED POPOVER-RELATED FUNCTIONS
 */

/**
 * Gets all existing groups from database and inserts them into page
 *
 * @name insertGroupsIntoPage
 * @async
 *
 * @returns {void}
 *
 * @example insertGroupsIntoPage();
 *
 */
async function insertGroupsIntoPage() {
  // Function to generate HTML for a group
  function generateGroupHTML(group) {
    const { name, desc, id, active } = group;
    return `
      <article class="keyword-widget search-item" id="spoiler-group-${id}">
          <header>
              <h1 id="spoiler-group-name">${name}</h1>
              <h2 id="spoiler-group-desc">${desc}</h2>
          </header>
          <div class="keyword-group" id="spoiler-keywords">
              <p>Keywords</p>
              <ul></ul>
          </div>
          <!-- Footer Buttons -->
          <span class="max-width space-between">
              <a class='edit-item' data-item-id="${id}"><p>Edit</p></a>
              <label class="side-checkbox-container">
                  <input class="enable-item" name="active-${id}"
                  data-item-id="${id}" 
                  data-table="spoiler-groups" type="checkbox"
                  ${active ? "checked" : ""} />

                  <span class="checkmark white-border">
                    <span class="material-symbols-rounded">check</span>
                  </span>
                  <p>Enable</p>
              </label>
          </span>
      </article>`;
  }

  let allGroups = await selectAllRecords("spoiler-groups");

  const amtOfGroups = Object.keys(allGroups).length;
  if (amtOfGroups === 0) {
    // show empty content
    $(".keyword-widget-container")
      .siblings(".empty-content")
      .removeClass("hidden");

    return;
  } else {
    // show group of buttons
    $(".keyword-widget-container")
      .siblings(".group-of-buttons")
      .removeClass("hidden");
  }

  // Iterates through all groups and insert them into page one at a time
  allGroups.forEach((group) => {
    // Generate the HTML for each group
    const baseHtml = generateGroupHTML(group);

    // Append base HTML to widget container
    $(".keyword-widget-container#spoiler-groups").append(baseHtml);

    // Get the group element
    const $groupElement = $(`#spoiler-group-${group.id}`);

    // Set the background color
    $groupElement.css("background", group.color);

    // Append keywords
    const $keywordList = $groupElement.find("#spoiler-keywords ul");
    group.keywords.forEach((keyword) => {
      const keywordItem = $(`<li>${keyword}</li>`);
      $keywordList.append(keywordItem);
    });
  });

  // Adds event listener to edit group
  $(".edit-item").on("click", async function () {
    const groupId = $(this).attr("data-item-id");

    // prepare popover
    const groupData = await selectRecordById("spoiler-groups", groupId);
    populatePopover(groupData);
    determineFormFooterButtons(false, groupData);

    // open popover
    const popover = document.querySelector("#popover-new-spoiler-group");
    popover.showPopover();
  });

  // Toggle active state of website in database
  $(".enable-item").on("click", async function () {
    const $isActive = $(this).is(":checked");

    // Calls function in settings-popover-form-controls to enable item
    let results = await enableItem(this);

    if (results) {
      displayNotifications(
        `Successfully ${$isActive ? "enabled" : "disabled"} spoiler group!`,
        "#390",
        "verified",
        2000
      );
    } else {
      displayNotifications(
        "Could not update this spoiler group. Try again later.",
        "#d92121",
        "release_alert",
        5000
      );
    }
  });
}

/**
 * Fills in the popover's form with existing data to modify
 *
 * @name populatePopover
 *
 * @param {object} groupData - description
 *
 * @returns {void}
 *
 * @example const data = {id: 0, name: 'item name', desc: 'this is it'...}
 *          populatePopover(data);
 *
 */
function populatePopover(groupData) {
  const { id, name, desc, keywords, color, active } = groupData;

  const $popover = $("#popover-new-spoiler-group");
  const $form = $popover.find("form");
  const $header = $popover.find("header h1");
  const $groupNameInput = $popover.find("input#spoiler-group-name");
  const $groupDescInput = $popover.find("input#spoiler-group-desc");
  const $keywordsTextarea = $popover.find("textarea#keywords");
  const $colorSchemeInputs = $popover.find("input.color-scheme");
  const $activeCheckbox = $popover.find("input#active");

  // Fills inputs with group info
  $form.attr("data-item-id", id);
  $header.text("Update Spoiler Keyword Group");
  $groupNameInput.val(name);
  $groupDescInput.val(desc);
  $keywordsTextarea.val(keywords.join(", "));

  // Unchecks all color inputs and then select existing option
  $colorSchemeInputs.prop("checked", false);
  $colorSchemeInputs.filter(`[value="${color}"]`).prop("checked", true);

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
    name: $form.find("#spoiler-group-name").val(),
    desc: $form.find("#spoiler-group-desc").val(),
    keywords: $form
      .find("#keywords")
      .val()
      .split(",")
      .map((keyword) => keyword.trim()),
    active: $form.find("#active").is(":checked"),
    color: $form.find("input[name='spoiler-group-color']:checked").val(),
  };

  const dataGroupId = $form.attr("data-item-id");
  if (dataGroupId) {
    formValues.id = parseInt(dataGroupId, 10);
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
  const $popover = $("#popover-new-spoiler-group");
  const $header = $popover.find("header h1");
  const $colorSchemeInputs = $popover.find("input.color-scheme");
  const $activeCheckbox = $popover.find("input#active");
  const $firstColorInput = $popover.find(`input.color-scheme:first-child`);

  $header.text("New Spoiler Keyword Group");

  // Unchecks all color inputs and then select existing option
  $colorSchemeInputs.prop("checked", false);
  $firstColorInput.prop("checked", true);

  $activeCheckbox.prop("checked", true);

  // Clear all text input in form
  clearFormValues("new-spoiler-group");

  // Decides to show update, add, or delete item buttons based on existing or new item
  // ... in this case, only shows add button
  determineFormFooterButtons(true, {});
}

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(async function () {
  const propertiesToCheck = ["active"];

  // getActiveSettings() from database-control-buffer.js
  const activeSettings = await getActiveSettings(
    "spoiler-detection",
    propertiesToCheck
  );

  // updateSettingsCheckboxes() from settings-form-control.js
  updateSettingsCheckboxes(activeSettings, "spoiler-detection");

  // Inserts all groups from database into page
  await insertGroupsIntoPage();

  /** Form Button Event Listeners */
  // Reset the popover form whenever a new group is intended to be added
  $(".add-item").on("click", function () {
    resetForm();
  });
});

/** !SECTION */
