/**
 * @file settings-website-blocker.js
 * @description Standard popup on toolbar to show the user's YouTube usage,
 *  and the ability to enable any limitation they set to appear here.
 *
 * @version 1.0.0
 * @date original: 2023-09-05
 * @author LenchetoFC
 *
 * @requires module:global-functions
 * @see {@link module:global-functions.displayNotifications}
 * @see {@link module:global-functions.getCurrentWatchMode}
 * @see {@link module:global-functions.updateRecordByPropertyGlobal}
 * @see {@link module:global-functions.convertTimeToText} x2
 * @see {@link module:global-functions.getCurrentWatchTimes}
 * @see {@link module:global-functions.getTotalWatchTime}
 */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

/**
 * Get total watch time and today's watch time, reformats them, and inserts them into DOM
 *
 * @name insertWatchTimes
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

/**
 * Reformats website type into a header. "social-media" -> "Social Media"
 *
 * @name reformatSettingName
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

/**
 * Get active watch mode and its properties and inserts it into DOM
 *
 * @name insertCurrentWatchMode
 * @async
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

/**
 * Get all active quick activations for youtube limitations
 *
 * @name getActiveQuickActivations
 * @async
 *
 * @returns {array} Returns array of objects with active quick activations
 *
 * @example let allQuickActiviations = getActiveQuickActivations();
 */
async function getActiveQuickActivations() {
  let allQuickActivations = await filterRecordsGlobal(
    "youtube-limitations",
    "quick-add",
    true
  );

  return allQuickActivations;
}

/**
 * Attach event listeners to every quick activation button on form
 *
 * @name attachQuickActEvents
 * @async
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
    await updateRecordByPropertyGlobal(
      "youtube-limitations",
      "id",
      quickActInputObj.id,
      {
        active: quickActInputObj.isActive,
      }
    );

    // Reminds user to refresh website
    // if ($("#refresh-reminder-msg").css("display") !== "flex")
    //   $("#refresh-reminder-msg")
    //     .fadeIn(1000)
    //     .css("display", "flex")
    //     .delay(2500)
    //     .fadeOut(1000);

    displayNotifications(
      "Refresh YouTube to Apply Changes",
      "#7b3ed2",
      "verified",
      2500
    );
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
