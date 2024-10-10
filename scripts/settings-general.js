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

/**
 * SECTION - INITIAL VARIABLES AND FUNCTION CALLS
 *
 */

// TODO: Change settings retrievals and sets to await promises like functions in content.js
//        to be able to use the values outside of the callback

// Adds all activities from storage to HTML on load
retrieveActivityFromStorage();

/**
 * SECTION - FUNCTION DECLARATIONS
 *
 */

/** FUNCTION - retrieves the 'activities' setting and adds each activity to the HTML */
function retrieveActivityFromStorage() {
  try {
    getSettings("activities", (result) => {
      if (result != undefined) {
        result.forEach((element, index) => {
          insertActivityHTML(element);
        });
      }
    });
  } catch (error) {
    console.log(`Error getting activities ${error}`);
  }
}

/** FUNCTION - Creates a new HTML element for an activity and adds it to the 'activity-section' in the document */
function insertActivityHTML(activity) {
  let activityItem = $("<li></li>").html(`
      <div class="activity-item" id="${activity}">
        ${activity}
        <button>
          <img class="icon-delete" src="/images/icon-delete.svg" alt="x delete button">
        </button>
      </div>
  `);

  activityItem.css("display", "none");

  $("#activity-section").append(activityItem);
  activityItem.slideDown();
}

/** FUNCTION - Adds an activity to the 'activities' setting in storage. If the 'activities' setting does not exist, it creates a new one */
function addActivityStorage(activity) {
  try {
    getSettings("activities", (result) => {
      // Saves new activity to exisiting storage
      result.unshift(activity);
      setSetting("activities", result);
    });
  } catch (error) {
    console.log(`Error getting activities ${error}`);
  }
}

/** FUNCTION - Toggles all checkboxes based on the settings value (true == checked or false == unchecked) */
function toggleCheckboxes(setting, element) {
  // For determining if a YT element either fades or slides out of yt page examples
  const ytFadeToggleElements = [
    "all-pages",
    "home-page",
    "search-bar",
    "shorts-btn",
  ];

  try {
    getSettings(setting, (result) => {
      // Visually displays the status of the setting on load
      if (result[element.value]) {
        element.checked = true; // Auto-updates checkbox status
        $(`.${element.value}`).slideToggle(); // Auto-updates YT UI example
      } else {
        element.checked = false;
      }

      // Updates settings for whichever button is pushed
      element.addEventListener("click", (event) => {
        setNestedSetting(setting, element.name, element.checked);

        // Displays change in YT UI example
        ytFadeToggleElements.includes(element.value)
          ? $(`.${element.value}`).fadeToggle()
          : $(`.${element.value}`).slideToggle();
      });
    });
  } catch (error) {
    console.log(`Error getting settings ${error}`);
  }
}

/**
 * SECTION - EVENT LISTENERS
 *
 */

// Triggers toggleCheckboxes with the type of checkbox on every checkbox within a form
const addictiveForm = document.querySelectorAll("fieldset input");
addictiveForm.forEach((element) => {
  if (element.name.includes("quick")) {
    toggleCheckboxes("quick-actions", element);
  } else {
    toggleCheckboxes("addictive-elements", element);
  }
});

// Resets all time usage to 0 and updates the displayed count
$("#reset-usage").on("click", function () {
  setSetting("all-time-usage", 0);
  $("#all-time-count").text("0 seconds");
  console.log("ALL TIME USAGE RESET TO 0");
});

// NOTE: Below is all new code

// jQuery animation for displaying button statuses
function btnStatusAnim(statusMsgId, isSuccess) {
  const delayTime = isSuccess ? 1000 : 5000;
  $(statusMsgId)
    .fadeIn(1000)
    .css("display", "flex")
    .delay(delayTime)
    .fadeOut(1000);
}

// Popover won't close when cancel button is pressed if the form is incomplete in any way
$(".cancel").on("click", function () {
  const popoverId = $(this).attr("data-popover");
  document.querySelector(`#${popoverId}`).togglePopover();
});

// Saves restrictive settings and displays status message
$("#save-settings").on("click", function () {
  $("#settings-unsaved-msg").fadeOut();

  const $button = $(this);
  $button.prop("disabled", true);

  // TODO: requires function to save all creators
  // Call function to save all creators
  // Return function status

  setTimeout(function () {
    //NOTE - temporary
    const btnSuccess = false; // Simulated save outcome

    // Start animation on status message, depending saving outcome
    btnSuccess
      ? btnStatusAnim("#settings-success-msg", true)
      : btnStatusAnim("#settings-failure-msg", false);

    $button.prop("disabled", false); // Re-enable button after operation
  }, 2000);
});

// Saves preferred creators and displays status message
$("#save-creators").on("click", function () {
  $("#creators-unsaved-msg").fadeOut();

  const $button = $(this);
  $button.prop("disabled", true);

  // TODO: requires function to save all creators
  // Call function to save all creators
  // Return function status

  setTimeout(function () {
    //NOTE - temporary
    const btnSuccess = true; // Simulated save outcome

    // Start animation on status message, depending saving outcome
    btnSuccess
      ? btnStatusAnim("#creators-success-msg", true)
      : btnStatusAnim("#creators-failure-msg", false);

    $button.prop("disabled", false); // Re-enable button after operation
  }, 2000);
});

// Warns user that there are unsaved changes for restrictive settings
$('#limitation-settings input[type="checkbox"]').on("click", function () {
  $("#settings-unsaved-msg").fadeIn(1000).css("display", "flex");
});

// Warns user that there are unsaved changes for preferred creators
$('#creators-list input[type="checkbox"]').on("click", function () {
  $("#creators-unsaved-msg").fadeIn(1000).css("display", "flex");
});

// Removes blocked website from HTML list
// TODO: Delete from database
$("[id^='blocked-website-'] button").on("click", function () {
  const websiteId = $(this).attr("data-website-id");

  if (window.confirm("Permanently delete this website?")) {
    $(`#${websiteId}`).slideUp("slow", function () {
      $(this).remove();
    });
  }
});
