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

// For determining if a YT element either fades or slides out of yt page examples
const ytFadeToggleElements = ["all-pages", "home-page", "search-bar", "shorts-btn"]

// Adds all activities from storage to HTML on load
retrieveActivityFromStorage();

// Gets initial num of activities and displays add button if not reached max
getSettings("activities", (result) => {
  let activityNum = 0;
  try {
    activityNum = result.length;
  } catch {
    activityNum = 0;
  }
});

// Displays current time usage count in HTML
getSettings("all-time", (result) => {
  $('#all-time-count').text(convertTimeToText(result));
});

// Gets initial num of activities and displays add button if not reached max
getSettings("activities", (result) => {
  let activityNum = 0;
  try {
    activityNum = result.length;
  } catch {
    activityNum = 0;
  }
});


/**
 * SECTION - FUNCTION DECLARATIONS
 *
 */

/** FUNCTION - retrieves the 'activities' setting and adds each activity to the HTML */
function retrieveActivityFromStorage() {
  getSettings("activities", (result) => {
    if (result != undefined) {
      result.forEach((element, index) => {
        insertActivityHTML(element);
      });
    }
  });
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

  activityItem.css("display", "none")

  $('#activity-section').append(activityItem);
  activityItem.slideDown();
};

/** FUNCTION - Adds an activity to the 'activities' setting in storage. If the 'activities' setting does not exist, it creates a new one */
function addActivityStorage (activity) {
  getSettings("activities", (result) => {
    // Saves new activity to exisiting storage 
    result.unshift(activity);
    setSetting("activities", result);
  });
}

/** FUNCTION - Removes a specific activity from the 'activities' setting in storage */
function removeActivity (value) {
  getSettings("activities", (result) => {
    // Get index of key activity and removes it
    // let activityIndex = result.indexOf(activity);
    result.splice(result.indexOf(value), 1);

    // Saves updated array to storage 
    setSetting("activities", result);
  });
}

/** FUNCTION - Inserts activity from storage into HTML to and adds them to storage */
// NOTE: Not exactly sure if this is even necessary 
function addActivityEventHandler() {
  let activityNumEvent = 0;
  let activityInput = $("#activity-input");

  // Gets current number of activities
  getSettings("activities", (result) => {
    try {
      activityNumEvent = result.length;
    } catch {
      activityNumEvent = 0;
    }

    if(activityInput.val().length > 0 && activityNumEvent < 4){
      insertActivityHTML(activityInput.val());
      addActivityStorage(activityInput.val());
      activityInput.val("");
    }
  });
}

/** FUNCTION - Displays or hides 'add activity' button or "activity input" only under the right conditions */
function toggleActivityBtns() {
  let activityItemAmt = $('#activity-section').children().length;

  console.log(activityItemAmt);
  console.log($('#input-btn-box').css("visibility"))
  
  if (activityItemAmt < 4 && $('#input-btn-box').css("visibility") == "visible") {
    // $('#activity-add').css("display", "block");
    // $('#activity-add').css("visibility", "visible");
    // $('#input-btn-box').css("visibility", "visible");
    $('#activity-add').slideToggle();
    $('#input-btn-box').slideToggle();
  } else if (activityItemAmt < 4 && $('#input-btn-box').css("visibility") == "hidden") {
    // $('#activity-add').css("display", "none");
    // $('#activity-add').css("visibility", "hidden");
    $('#activity-add').slideToggle();
    $('#input-btn-box').slideToggle();
  } else {

  }
}

/** FUNCTION - Displays or hides activity inputs based on amount of active activities */
function showActivityInput () {
  let activityItemAmt = $('#activity-section').length;
  
  if (activityItemAmt < 4 && $('#input-btn-box').css("visibility") == "hidden") {
    $('#activity-add').css("display", "block");
    $('#activity-add').css("visibility", "visible");
    $('#input-btn-box').css("visibility", "visible");
  } else {
    $('#activity-add').css("display", "none");
    $('#activity-add').css("visibility", "hidden");
  }
}

/** FUNCTION - Toggles all checkboxes based on the settings value (true == checked or false == unchecked) */
function toggleCheckboxes(setting, element) {
  getSettings(setting, (result) => {
    // Visually displays the status of the setting on load
    if (result[element.value]) {
      element.checked = true; // Auto-updates checkbox status
      $(`.${element.value}`).slideToggle() // Auto-updates YT UI example
    } else {
      element.checked = false;
    }

    // Updates settings for whichever button is pushed
    element.addEventListener("click", (event) => {
      setNestedSetting(setting, element.name, element.checked);

      // Displays change in YT UI example
      ytFadeToggleElements.includes(element.value) ? $(`.${element.value}`).fadeToggle() : $(`.${element.value}`).slideToggle() 
    });
  });
}


/** 
 * SECTION - Event Listeners 
 * 
 */

// Deletes activity through 'x' button
$(document).on('click', '.icon-delete', function(event) {
  const activityItem = $(this).closest('li');
  const activityItemId = $(this).closest('div').attr('id');

  removeActivity(activityItemId);

  if (activityItem.length) {
    activityItem.slideUp(function() {
      $(this).remove();
    });
  }
});

// Triggers toggleCheckboxes with the type of checkbox on every checkbox within a form
const addictiveForm = document.querySelectorAll("form input");
addictiveForm.forEach((element) => {
  if (element.name.includes('quick')) {
    toggleCheckboxes("quick-actions", element);
  } else {
    toggleCheckboxes("addictive-elements", element);
  }
});

// Displays activity input text box and auto-focuses on it
$('#activity-add button').on("click", function() {
  $('#input-btn-box').slideDown( function() {
    $('#input-container').trigger("focus");
  });
  $('#activity-add').slideUp();
});

// Removes activity input and reshows add activity button
$('#activity-cancel').on("click", function() {
  toggleActivityBtns();
});

// "Enter" event listener for new activity
$('#activity-input').on("keydown", function ( event ) {
  let inputTextLen = $(this).val().length;
  if (event.which == 13 && inputTextLen > 0) {
    addActivityEventHandler();
    toggleActivityBtns();
  }
});

// "Save button" event listener for new activity
$('#activity-save').on("click", function() {
  let inputTextLen = $('#activity-input').val().length;
  if (inputTextLen > 0) {
    addActivityEventHandler();
    toggleActivityBtns();
  }
})

// Resets all time usage to 0 and updates the displayed count
$('#reset-usage').on("click", function() {
  setSetting("all-time-usage", 0);
  $('#all-time-count').text('0 seconds');
  console.log("ALL TIME USAGE RESET TO 0");
})

// Opens and closes horizontal nav bar
// document.querySelector(".hamburger-input").addEventListener("click", () => {
//   let checked = document.querySelector(".hamburger-input").checked;
//   let nav = document.querySelector("nav");
//   let contentWrapper = document.querySelector(".content-wrapper");
  
//   if (window.matchMedia("(max-width: 630px)").matches) {
//     if (checked) {
//       nav.style.transform = "translateY(83.5px)";
//       contentWrapper.style.transform = "translateY(110px)";
//     } else {
//       nav.style.transform = "translateY(-30px)";
//       contentWrapper.style.transform = "none";
//     }
//   }
// })

// When the horizontal nav bar is open and then closed, this code
//  makes sure the vertical nav bar is not affected by "display: none"
//  when the horizontal nav bar is closed
// Basically a reset for vertical nav bar
// window.addEventListener("resize", () => {
//   let nav = document.querySelector("nav");
//   let contentWrapper = document.querySelector(".content-wrapper");

//   contentWrapper.style.transform = "none";
//   document.querySelector(".hamburger-input").checked = false;
//   window.matchMedia("(min-width: 631px)").matches ? nav.style.transform = "none" : nav.style.transform = "translateY(-30px)";
// })
