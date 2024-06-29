/**
 * @LenchetoFC 
 * @description This controls the settings pages and accurately
 *  displays current settings and user information for the general settings
 * 
 */

/**
 * to access storage from console, run this command...
 * chrome.storage.sync.get((result) => { console.log(result) });
 */

/**
 * SECTION - INITIAL VARIABLES AND FUNCTION CALLS
 */

// Adds all activities from storage to HTML
addActivityHTML();

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
 */

/** FUNCTION - retrieves the 'activities' setting and adds each activity to the HTML */
function addActivityHTML() {
  getSettings("activities", (result) => {
    if (result != undefined) {
      result.forEach((element, index) => {
        insertActivityHTML(element);
      });
    }
  });
}

/** FUNCTION - Creates a new HTML element for an activity and adds it to the 'activity-section' in the document */
function insertActivityHTML (activity) {
  let activityItem = document.createElement("li");
  activityItem.innerHTML = `
      <div class="activity-item" id="${activity}">
        ${activity}
        <button>
          <img class="icon-delete" src="/images/icon-delete.svg" alt="x delete button">
        </button>
      </div>
  `;

  $('#activity-section').append(activityItem);
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

// TODO: function description
function addActivityEventHandler() {
  let activityNumEvent = 0;
  let activityInput = document.getElementById("activity-input");

  // Gets current number of activities
  getSettings("activities", (result) => {
    try {
      activityNumEvent = result.length;
    } catch {
      activityNumEvent = 0;
    }

    if(activityInput.value.length > 0 && activityNumEvent < 4){
      insertActivityHTML(activityInput.value);
      addActivityStorage(activityInput.value);
      activityInput.value = "";
    }
  });
}

// TODO: function description
function removeActivityInput() {}

// TODO: function description
function insertActivityInput() {}

// TODO: function description
function hideActivityInput() {
  $('#input-btn-box').slideUp();
  $('#activity-add').slideDown();
}


/** SECTION - Mutation Observers */

// Adds event listener to delete buttons of actitivites
// Create a new observer
const removeActivityHTML = new MutationObserver((mutationsList, observer) => {
  // Look through all mutations that just occured
  for(let mutation of mutationsList) {
    // If the addedNodes property has one or more nodes
    if(mutation.addedNodes.length){
      const deleteButtons = document.querySelectorAll('.icon-delete');

      deleteButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
          const activityItem = event.target.closest('li');
          const activityItemId = event.target.closest('div').id;

          removeActivity(activityItemId);

          if (activityItem) {
            activityItem.remove();
          }
        });
      });
    }
  }
});

// Start observing the document with the configured parameters
removeActivityHTML.observe(document, { childList: true, subtree: true });

// Displays or hides activity inputs based on amount of active activities
let inputContainer = document.getElementById("input-container");
let activityBtn = document.getElementById("activity-add");
let inputBtnBox = document.getElementById("input-btn-box");
const showButton = new MutationObserver((mutationsList, observer) => {
  // Look through all mutations that just occured
  for(let mutation of mutationsList) {
    // If the addedNodes property has one or more nodes
    if(mutation.addedNodes.length || mutation.removedNodes.length){

      const activityItems = document.querySelectorAll('.activity-item');

      if (activityItems.length < 4) {
        // inputContainer.style.visibility = "hidden"
        activityBtn.style.display = "block"
        activityBtn.style.visibility = "visible"; 
        inputBtnBox.style.visibility = "visible";
        // inputBtnBox.style.height = "40px";
      } else {
        // inputContainer.style.visibility = "hidden";
        activityBtn.style.display = "none"
        activityBtn.style.visibility = "hidden"; 
        // inputBtnBox.style.height = "0";
      }
    }
  }
});

// Start observing the document with the configured parameters
showButton.observe(document, { childList: true, subtree: true });


/** SECTION - Event Listeners */

// DOM Elements to be modified below
// let inputContainer = document.getElementById("input-container");
// let activityBtn = document.getElementById("activity-add");
// let inputBtnBox = document.getElementById("input-btn-box");
// let activityInput = document.getElementById("activity-input");

/**
 * SECTION - CHECKBOX FUNCTIONALITIES
 * This block of code gets all form checkbox inputs, adds listeners to them, and changes their visuals based on the stored settings.
 * For each checkbox input, it retrieves the corresponding setting from storage.
 * If the setting is true, it checks the checkbox. Otherwise, it unchecks the checkbox.
 * It also adds a click event listener to each checkbox to update the corresponding setting whenever the checkbox is clicked.
 */
const addictiveForm = document.querySelectorAll("form input");
addictiveForm.forEach((element) => {
  if (element.name.includes('quick')) {
    toggleCheckboxes("quick-actions", element);
  } else {
    toggleCheckboxes("addictive-elements", element);
  }
});

function toggleCheckboxes(setting, element) {
  getSettings(setting, (result) => {
    // Visually displays the status of the setting
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
      $(`.${element.value}`).slideToggle()
    });
  });
}

// TODO: add description
$('#activity-add button').on("click", function() {
  $('#input-btn-box').slideDown( function() {
    $('#input-container').trigger("focus");
  });
  $('#activity-add').slideUp();
});

// Removes activity input and reshows add activity button
$('#activity-cancel').on("click", function() {
  hideActivityInput()
});

// "Enter" event listener for new activity
$('#activity-input').on("keydown", function ( event ) {
  if (event.which == 13) {
    addActivityEventHandler();
    hideActivityInput();
  }
});

// "Save button" event listener for new activity
$('#activity-save').on("click", function() {
  addActivityEventHandler();
  hideActivityInput();
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
