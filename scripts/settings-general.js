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
 * SECTION - CHECKBOX FUNCTIONALITIES
 * This block of code gets all form checkbox inputs, adds listeners to them, and changes their visuals based on the stored settings.
 * For each checkbox input, it retrieves the corresponding setting from storage.
 * If the setting is true, it checks the checkbox. Otherwise, it unchecks the checkbox.
 * It also adds a click event listener to each checkbox to update the corresponding setting whenever the checkbox is clicked.
 */
const addictiveForm = document.querySelectorAll("form input");
addictiveForm.forEach((element) => {
  getSettings(element.name, (result) => {
    // Visually displays the status of the setting
    if (result) {
      element.checked = true;
    } else {
      element.checked = false;
    }

    // Updates settings for whichever button is pushed
    element.addEventListener("click", (event) => {
      setSetting(element.name, element.checked);
    });
  });
});

/**!SECTION */


/**
 * SECTION - ALTERNATE ACTIVITIES
 * 
 */
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

/**
 * Creates a new HTML element for an activity and adds it to the 'activity-section' in the document.
 * 
 * @param {any} activity - The activity to create an HTML element for. Also is used for id value
 * 
 * @returns {void} This function does not return anything. It creates a new HTML element for an activity and adds it to the 'activity-section' in the document.
 * 
 * @example insertActivityHTML('myActivity');
 */
const insertActivityHTML = (activity) => {
  let activityItem = document.createElement("li");
  activityItem.innerHTML = `
      <div class="activity-item" id="${activity}">
        ${activity}
        <button>
          <img class="icon-delete" src="/images/icon-delete.svg" alt="x delete button">
        </button>
      </div>
  `;

  let activitySection = document.querySelector("#activity-section");
  activitySection.append(activityItem);
};

/**
 * Retrieves the 'activities' setting and adds each activity to the HTML.
 * 
 * @returns {void} This function does not return anything. It retrieves the 'activities' setting and adds each activity to the HTML.
 * 
 * @example addActivityHTML();
 */
const addActivityHTML = () => {
  getSettings("activities", (result) => {
    if (result != undefined) {
      result.forEach((element, index) => {
        insertActivityHTML(element);
      });
    }
  });
}

/**
 * Adds an activity to the 'activities' setting in storage. If the 'activities' setting does not exist, it creates a new one.
 * 
 * @param {any} activity - The activity to add to the 'activities' setting.
 * 
 * @returns {void} This function does not return anything. It adds an activity to the 'activities' setting in storage.
 * 
 * @example addActivity('myActivity');
 */
const addActivity = (activity) => {
  getSettings("activities", (result) => {
    // Saves new activity to exisiting storage 
    result.unshift(activity);
    setSetting("activities", result);
  });
}

/**
 * Removes a specific activity from the 'activities' setting in storage.
 * 
 * @param {any} activity - The activity to remove from the 'activities' setting.
 * 
 * @returns {void} This function does not return anything. It removes an activity from the 'activities' setting in storage.
 * 
 * @example removeActivity('myActivity');
 */
const removeActivity = (value) => {
  getSettings("activities", (result) => {
    // Get index of key activity and removes it
    // let activityIndex = result.indexOf(activity);
    result.splice(result.indexOf(value), 1);

    // Saves updated array to storage 
    setSetting("activities", result);
  });
}

// Adds all activities from storage to HTML
addActivityHTML();

// DOM Elements to be modified below
let inputContainer = document.getElementById("input-container");
let activityBtn = document.getElementById("activity-btn");
let inputBtnBox = document.getElementById("input-btn-box");
let activityInput = document.getElementById("activity-input");

// Button becomes hidden; input becomes visible if clicked
activityBtn.addEventListener("click", (event) => {
  activityBtn.style.visibility = "hidden"; 
  inputContainer.style.visibility = "visible"
  inputBtnBox.style.height = "40px";
  activityInput.focus();
}); 

// Gets initial num of activities and displays add button if not reached max
getSettings("activities", (result) => {
  try {
    activityNum = result.length;
  } catch {
    activityNum = 0;
  }
});

let activityNum;
// Adds event listener to new activity input
activityInput.addEventListener("keypress", (event) => {
  // Gets current number of activities
  getSettings("activities", (result) => {
    try {
      activityNum = result.length;
    } catch {
      activityNum = 0;
    }

    // Adds new activity to storage if there's room
    if (event.key === "Enter" && activityInput.value.length > 0 && activityNum < 4) {
      insertActivityHTML(activityInput.value);
      addActivity(activityInput.value);
      activityInput.value = "";
    }
  });
});

// Displays or hides activity inputs based on amount of active activities
const showButton = new MutationObserver((mutationsList, observer) => {
  // Look through all mutations that just occured
  for(let mutation of mutationsList) {
    // If the addedNodes property has one or more nodes
    if(mutation.addedNodes.length || mutation.removedNodes.length){

      const activityItems = document.querySelectorAll('.activity-item');

      if (activityItems.length < 4) {
        inputContainer.style.visibility = "hidden"
        activityBtn.style.visibility = "visible"; 
        inputBtnBox.style.height = "40px";
      } else {
        inputContainer.style.visibility = "hidden";
        activityBtn.style.visibility = "hidden"; 
        inputBtnBox.style.height = "0";
      }
    }
  }
});

// Start observing the document with the configured parameters
showButton.observe(document, { childList: true, subtree: true });

/**!SECTION */


/**
 * SECTION - TIME USAGE
 * 
 */
// Displays current time usage count in HTML
let allTimeCount = document.getElementById("all-time-count");
getSettings("all-time-usage", (result) => {
  allTimeCount.innerHTML = convertTimeToText(result);
});

// Resets all time usage to 0 and updates the displayed count
let resetUsageBtn = document.getElementById("reset-usage");
resetUsageBtn.addEventListener("click", () => {
  setSetting("all-time-usage", 0);
  allTimeCount.innerHTML = 0;
  console.log("ALL TIME USAGE RESET TO 0");
})

/**!SECTION */
