// Author: Lorenzo Ramirez
// Date Created: 2023-09-05
// Purpose: This file is the popup for the extension
/**
 * @LenchetoFC
 * @description This is the standard popup on toolbar to show
 *  the user's YouTube usage, and the ability to enable any
 *  limitation they set to appear here
 */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

/** FUNCTION: Get total watch time and today's watch time, reformats them, and inserts them into DOM
 *
 * @returns {null}
 *
 * @example getWatchTimes();
 */
function insertWatchTimes() {
  // Gets the total watch time for the current day
  getCurrentWatchTimes()
    .then(async (data) => {
      let todayTime = data[0]["total-watch-time"];
      console.log(todayTime);
      $(`#today-watch-time`).html(convertTimeToText(todayTime));
    })
    .catch((error) => {
      $(`#today-watch-time`).html(error);
      console.error(error);
    });

  // Calculates all total watch times from all days
  getTotalWatchTime()
    .then((totalTime) => {
      $(`#total-watch-time`).html(convertTimeToText(totalTime));
    })
    .catch((error) => {
      $(`#total-watch-time`).html(error);
      console.error(error);
    });
}

/** FUNCTION: Reformts website type into a header. "social-media" -> "Social Media"
 *
 * @param {string} name - website type from database - "social-media"
 *
 * @returns {string} reformattedName - "Social Media"
 *
 * @example reformatWebsiteType(`social-media`);
 */
function reformatSettingName(name) {
  // Split the string by hyphens
  let splitArray = name.split("-");

  // Capitalize the first letter of each word and join them with spaces
  let reformattedName = splitArray
    .map((word) => {
      // Shorts recommendations
      if (word.toLowerCase() === "recommendations") {
        return "Recomm.";
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

  return reformattedName;
}

/** ASYNC FUNCTION: Get active watch mode and its properties and inserts it into DOM
 *
 * @returns {null}
 *
 * @example insertCurrentWatchMode();
 */
async function insertCurrentWatchMode() {
  try {
    getCurrentWatchMode()
      .then((data) => {
        $(".current-watch-mode").html(data.name);
        $(".current-watch-mode").css("border-color", data.color);
        $(".current-watch-mode").css("color", data.color);
      })
      .catch((error) => {
        console.error(error);
      });
    return true;
  } catch (error) {
    return false;
  }
}

/** ASYNC FUNCTION: Get all active quick activations for youtube limitations
 *
 * @returns {array} Returns array of objects with active quick activations
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

/** ASYNC FUNCTION: Attach event listeners to every quick activation button on form
 *
 * @returns {null}
 *
 * @example attachQuickActEvents();
 */
async function attachQuickActEvents() {
  $("#quick-act-form input").on("click", async function () {
    let quickActInputObj = {
      id: parseInt($(this).attr("value")),
      active: $(this).prop("checked"),
    };

    // Updates active status of limitation settings
    await updateLimitationsDB(quickActInputObj.id, {
      active: quickActInputObj.active,
    });

    // Reminds user to refresh website
    if ($("#refresh-reminder-msg").css("display") !== "flex")
      $("#refresh-reminder-msg")
        .fadeIn(1000)
        .css("display", "flex")
        .delay(2500)
        .fadeOut(1000);
  });
}

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */

/** ONLOAD FUNCTION CALL: Get all active quick activations records, toggle active quick activation checkboxes, and update YT UI example */
getActiveQuickActivations()
  .then((data) => {
    // Removes quick activation section if there are no buttons to add
    if (data.length === 0) {
      $(".popup-section:has(#quick-act-form)").remove();
    }

    // Iterates through all active quick activations
    for (let quickActObj of data) {
      let checked = quickActObj.active ? "checked" : "";

      // Creates new html element for each quick activation
      let newQuickActHTML = $(
        `<div class="checkbox-item" data-limitation-name="${quickActObj.name}"></div>`
      ).html(`
        <label>
          <input id="${quickActObj.name}" name="${
        quickActObj.name
      }" type="checkbox" value="${quickActObj.id}" ${checked} />
          <span for="${quickActObj.name}">${reformatSettingName(
        quickActObj.name
      )}</span>
        </label>
      `);

      // Appends quick act html to the form
      $("#quick-act-form").append(newQuickActHTML);
    }

    // Attachs event listeners to each button after they are all appended to avoid double listeners per element
    attachQuickActEvents();
  })
  .catch((error) => {
    console.error(error);
  });

/** ONLOAD FUNCTION CALL: Gets total and today's watch times and inserts it into popup */
insertWatchTimes();

/** ONLOAD FUNCTION CALL: Gets current watch mode and inserts it into popup */
insertCurrentWatchMode();

/** !SECTION */
