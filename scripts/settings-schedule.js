/** INFORMATION
 * @LenchetoFC 
 * @description This controls the settings pages and accurately
 *  displays current settings and user information for the schedule settings
 * 
 */

// TODO: Better name class and id names

/**
 * SECTION - INITIAL VARIABLES AND FUNCTION CALLS
 */

/** Initial Variable Instances */
const scheduleDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
let timeSelectionAmt = 1;
let startTimeChoice = document.querySelector("#schedule-start-time");
let endTimeChoice = document.querySelector("#schedule-end-time");

/** Initial Function Calls */
isTimeChoiceValid(startTimeChoice, endTimeChoice);
hideTimeSelection();
insertSchedule();

// TODO:
// let allDayBtn = document.getElementById("schedule-all-day");
let addTimeInterval = document.getElementById("add-time-btn");
let newTimeContainer = document.getElementById("new-time-container");
let submitSchedule = document.getElementById("submit-schedule");

const scheduleDayForm = document.querySelectorAll("form input");
const firstTimeSelectionLine = $('#time-container section:first-child');


// Important queries for hiding and showing 'add new schedule' popup
// let overlay = document.querySelector("#overlay");
// let newScheduleOverlay = document.querySelector(".schedule-overlay");
// let entireHTML = document.querySelector("html");


/**
 * SECTION - FUNCTION DECLARATIONS
 */

/** FUNCTION
 * Converts military time in string type into the 12 hour format in string type
 * 
 * @param {string} startTime - the beginning of the schedule time
 * @param {string} endTime - the end of the schedule time
 * 
 * @returns {array} Returns an array of both times in 12-Hour format
 * 
 * @example convertMilToTwelveHour("12:42", "18:00");
 */
function convertMilToTwelveHour (startTime, endTime) {
  // Convert start time to AM/PM format
  let startHour = parseInt(startTime.slice(0, 2));
  let startMinutes = startTime.slice(3);
  let startPeriod = startHour >= 12 ? "PM" : "AM";
  if (startHour > 12) {
    startHour -= 12;
  }
  startTime = `${startHour}:${startMinutes} ${startPeriod}`;
  
  // Convert end time to AM/PM format
  let endHour = parseInt(endTime.slice(0, 2));
  let endMinutes = endTime.slice(3);
  let endPeriod = endHour >= 12 ? "PM" : "AM";
  if (endHour > 12) {
    endHour -= 12;
  }
  endTime = `${endHour}:${endMinutes} ${endPeriod}`;

  // Returns an array of both times in 12-Hour format
  return [startTime, endTime];
}

/** FUNCTION - adds schedules to the schedule grid in DOM */
function insertSchedule () {
  let scheduleGrid = document.getElementById("schedules");  
  let header = document.getElementById("schedule-title");

  // Checks each day for schedules and displays any that exist on page
  scheduleDays.forEach((day) => {
    let dayCapitalize =  day[0].toUpperCase() + day.slice(1);
  
    // Gets the stored schedules (if any) from schedule days settings
    getSettings(`schedule-${day}`, (schedule) => {
      // Immediately skips day if there are no schedules
      if (schedule.length === 1 && schedule[0] === false) return;

      let scheduleItem = document.createElement("section");
      scheduleItem.className = "schedule-item flex-col";
      scheduleItem.id = `schedule-${day}`;
      let scheduleItemHeader = document.createElement("section");
      scheduleItemHeader.className = "schedule-item-header";
      scheduleItemHeader.innerHTML = `
        <section class="schedule-item-day">${dayCapitalize}</section>
      `;
  
      scheduleItem.append(scheduleItemHeader);
      
      let scheduleTimeList = document.createElement("section");
      scheduleTimeList.className = "schedule-time-list";
  
      // Adds either all day (schedule[0] = true) or all scheduled times (false) 
      if (schedule[0]) {
        let scheduleTime = document.createElement("section");
        scheduleTime.className = "schedule-time";
        scheduleTime.innerHTML = `
          <div class="schedule-start-time"></div>
          <div>All Day</div> 
          <div class="schedule-end-time"></div>
        `;
  
        scheduleTimeList.append(scheduleTime);
        scheduleItem.append(scheduleTimeList);
      } else if (schedule[0] === false && schedule.length > 1) {
        schedule.slice(1).forEach((time) => {
          // Converts military time to 12-hour clock
          let convertedTime = convertMilToTwelveHour(time[0], time[1]);
  
          let scheduleTime = document.createElement("section");
          scheduleTime.className = "schedule-time";
          scheduleTime.innerHTML = `
            <div class="schedule-start-time">${convertedTime[0]}</div>
            <div>to</div> 
            <div class="schedule-end-time">${convertedTime[1]}</div>
          `;
          scheduleTimeList.append(scheduleTime);
        })
  
        scheduleItem.append(scheduleTimeList);
      }

      // Creates and appends schedule delete button
      let deleteBtnIcon = document.createElement("img");
      deleteBtnIcon.className = "icon-delete";
      deleteBtnIcon.src = "/images/icon-trash.svg";
      deleteBtnIcon.alt = "X delete button";
      let scheduleDeleteBtn = document.createElement("button");
      scheduleDeleteBtn.append(deleteBtnIcon);

      // Actions for when time selection delete button is pressed
      // let deleteBtn = scheduleItemHeader.querySelector(".icon-delete");
      // TODO: Fade out schedule item
      $('.icon-delete').on("click", function () {
        // Deletes time selection line the delete button is associated to
        scheduleItem.remove();
        setSetting(`schedule-${day}`, [false]);

        // Eliminates extra space if there are no active schedules
        if (scheduleGrid.childNodes.length === 0) {
          scheduleGrid.style.display = "none";
          header.style.display = "none";
        };

        return;
      });

      // Creates and appends schedule edit button 
      let editBtnIcon = document.createElement("img");
      editBtnIcon.className = "icon-in-btn";
      editBtnIcon.src = "/images/icon-edit-simple.svg";
      editBtnIcon.alt = "pencil edit button";
      let scheduleEditBtn = document.createElement("button");
      scheduleEditBtn.append(editBtnIcon);

      // Creates and appends button container to schedule item
      let buttonContainer = document.createElement("div");
      buttonContainer.className = "schedule-btn-container";
      
      buttonContainer.append(scheduleDeleteBtn);
      buttonContainer.append(scheduleEditBtn);
      scheduleItem.append(buttonContainer);




      // Adds header and schedule items to grid if there is at least one schedule
      if (schedule[0] || schedule.length > 1) {
        scheduleGrid.append(scheduleItem);

        // Displays schedule grid and header
        scheduleGrid.style.display = "grid";
        // header.style.display = "flex";
      }
    })
    
  })
}

/** FUNCTION
 * Essentially resets the time selection by to default by hiding 
 *  the time selectors and unchecking all day checkboxes
 * 
 * @param {array} scheduleDays - an array of the checkboxes to uncheck
 * 
 * @returns {array} Returns an array of both times in 12-Hour format
 * 
 * @example deselectDaySelections(["schedule-mon", "schedule-fri"]);
 */
function deselectDaySelections (scheduleDays) {
  scheduleDays.forEach(element => {
    element.checked = false;
    hideTimeSelection();
  })
} 

/** FUNCTION - Hides entire time selection container */
function hideTimeSelection() {
  $('#add-time-btn').css('display', 'flex');
  $('#schedule-new-container').slideUp();
  $('#schedule-all-day').checked = false;
  $('#time-container').text = "";
}

/** FUNCTION - Reinserts first time selection line when "all day" button is deselected */
function addsTimeSelection () {
  $('#add-time-btn').fadeIn();
  $('.schedule-time-container').css('padding', '1rem 0');
  $('.schedule-time-container').slideDown();
}

/** FUNCTION - Removes all but one time selection line when "all day" button is selected */
function removesTimeSelection (scheduleType) {
  $('.schedule-time-container').slideUp();
  $('#add-time-btn').fadeOut();
  $('.schedule-time-container').css('padding', '0');
  
  // Keeps first time selection child to avoid miscounting children after deselecting all day btn
  while (newTimeContainer.lastChild.id !== `first-time-selection-${scheduleType}`) {
    newTimeContainer.removeChild(newTimeContainer.lastChild);
  } 

  removeTimeValues();

  timeSelectionAmt = 1;
}

function removeTimeValues () {
  // Removes values from the first child
  $(`#new-time-container section:first-child input`)[0].value = ""
  $(`#new-time-container section:first-child input`)[1].value = ""
  $(`#edit-time-container section:first-child input`)[0].value = ""
  $(`#edit-time-container section:first-child input`)[1].value = ""
}

/** FUNCTION - hides the new schedule popup and resetting the schedule form */
function hideNewSchedulePopup () {
  $('#overlay').fadeOut();
  $('.new-overlay').fadeOut();
  $('html').css('overflow', '');

  let selectedDays = document.querySelectorAll(".checkbox-circle label input");
  deselectDaySelections(selectedDays);

}

function getSelectedTimeValue (times) {
  let selectedTimes = [];
  times.forEach(element => {
    let startTimeValue = element.children[0].value;
    let endTimeValue = element.children[2].value;
    if (startTimeValue != "" && endTimeValue != "") {
      selectedTimes.push([startTimeValue, endTimeValue]);
    } else selectedTimes = "";
  });

  return selectedTimes;
}

/** FUNCTION - hides overlays */
function hideOverlays (formOverlayID) {
  $('#overlay').css("display", "none");
  $(formOverlayID).css("display", "none");
  $('html').css('overflow', '');
}

/** FUNCTION - Checks if time selections are valid (i.e. start time is always less than end time) */
function isTimeChoiceValid(startTime, endTime) {
  // Checks if start time is later than end time
  startTime.addEventListener("blur", () => {
    if (startTime.value && endTime.value && startTime.value > endTime.value) {
      // Alerts user of their error
      startTime.style.borderColor = "var(--red)";
      endTime.style.borderColor = "var(--red)";
      alert("Start time is later than end time. Update times before adding schedule");
    } else {
      startTime.style.borderColor = "var(--grey)";
      endTime.style.borderColor = "var(--grey)";
    }
  });

  // Checks if start time is later than end time
  endTime.addEventListener("blur", () => {
    if (startTime.value > endTime.value) {
      // Alerts user of their error
      startTime.style.borderColor = "var(--red)";
      endTime.style.borderColor = "var(--red)";
      alert("Start time is later than end time. Update times before adding schedule");
    } else {
      startTime.style.borderColor = "var(--grey)";
      endTime.style.borderColor = "var(--grey)";
    }
  });
}


/** SECTION - Event Listeners */
// Shows the new schedule overlay when add new schedule button is clicked
$('#add-new-schedule-btn').on("click", function() {
  $('#overlay').first().fadeIn();
  $('.new-overlay').first().fadeIn();
  $('html').css('overflow', 'hidden');
})

/** Hides popup when the overlay outside of the popup or 'X' btn are clicked */
$('#overlay').on("click", function() {
  hideNewSchedulePopup();
  removeTimeValues();
})
// TODO: error occurs if all day button is selected and then canceled
$('.new-schedule-exit').on("click", function () {
  hideNewSchedulePopup();
  removeTimeValues();
})

/** Shows time selection container when any schedule day is checked */
scheduleDayForm.forEach((element) => {
  element.addEventListener("change", () => {
    // Check if any checkbox is checked
    const isAnyChecked = Array.from(scheduleDayForm).some((checkbox) => checkbox.checked);
    
    // Hides/shows time selections if at least one checkbox is checked
    if (isAnyChecked) {
      $('#schedule-new-container').slideDown();
    } else {
      hideTimeSelection();
    }
  });
});

// TODO: Make into function for edit and new schedule
/** Add new time selection line when "add time" btn is pressed */
$('#add-time-btn').on('click', function() {
  timeSelectionAmt++;

  let scheduleType = "new"
  // Creates new element and appends time selection to schedule container 
  let timeSelection = document.createElement("section");
  timeSelection.className = "schedule-new-time"; 
  timeSelection.id = `${scheduleType}-time-line-${timeSelectionAmt}`;
  timeSelection.style.display = "none";
  timeSelection.innerHTML = `
    <input id="schedule-start-time" name="schedule-start-time" placeholder="Start time" type="time">
      <div>to</div>
    <input id="schedule-end-time" name="schedule-end-time" placeholder="End time" type="time">

    <button class="btn">
      <img class="icon-delete" src="/images/icon-delete.svg" alt="Trash can delete button">
    </button>
  `;
  newTimeContainer.append(timeSelection)
  $(`#${scheduleType}-time-line-${timeSelectionAmt}`).slideDown();

  // Actions for when time selection delete button is pressed
  let deleteBtn = timeSelection.querySelector(".btn");
  $(`#new-time-line-${timeSelectionAmt} .btn`).on("click", function () {
    // Deletes time selection line the delete button is associated to
    $(`#new-time-line-${timeSelectionAmt}`).slideUp(function() {
      $(this).remove();
    });
    timeSelectionAmt--;

    // Displays "all time" button if the count is not at max 
    if (timeSelectionAmt < 5) $('#add-time-btn').css('display', 'flex');
  });

  // Checks if start time is less than end time
  let startTime = timeSelection.querySelector("#schedule-start-time");
  let endTime = timeSelection.querySelector("#schedule-end-time");
  isTimeChoiceValid(startTime, endTime);
  
  // Removes "add time" button and notice user they can't add more
  if (timeSelectionAmt == 5) {
    // addTimeInterval.style.display = "none";
    $('#add-time-btn').css('display', 'none');
    alert("You cannot add more times after this.");
  }
})

/** Remove or insert time selection when "all day" button is clicked in new/edit schedule overlay */
$('#schedule-all-day').on("click", function () {
  let scheduleType = $('#schedule-all-day').prop("value");
  console.log(scheduleType)
  if ($('#schedule-all-day').is(":checked")) {
    removesTimeSelection(scheduleType);
  } else {
    addsTimeSelection();
  }
})

// TODO: BROKEN AS HELL
/** Actions for when user is submitting schedule times */
$('#submit-schedule').on("click", function () {
  // Gets selected schedule days
  let selectedDays = [];
  let scheduleDays = document.querySelectorAll(".checkbox-circle label input");
  
    // Filters out
  let filteredDays = Array.from(scheduleDays, (day) => ({[day.name]: day.checked})).filter(day => day[Object.keys(day)[0]]);

  // Gets rid of true boolean values and only keeps selected days
  filteredDays.forEach((element) => {
    selectedDays.push(Object.keys(element)[0]);
  });

  // Gets selected time values and pushes them to an array
  let scheduleType = "new";
  let times = document.querySelectorAll(`.schedule-${scheduleType}-time`);
  let selectedTimes = getSelectedTimeValue(times);
  
  // TODO: too many times
  /** SECTION - ADDING SCHEDULES TO STORAGE */
  // Add new schedule day to schedule list
  let scheduleGrid = document.getElementById("schedules");  
  selectedDays.forEach((day, index) => {
    getSettings(day, (currentTimes) => {
      console.log(day)
      console.log(times.length)
      console.log(($('#schedule-all-day').is(":checked")))
      console.log(selectedTimes === "")
      console.log(currentTimes)
      console.log(currentTimes[0])

      if (!($('#schedule-all-day').is(":checked")) && selectedTimes === "") {
        alert("Select times or \"All Day\" before clicking \"Done\"");
      } else {
        // Runs this code if "all day" or times have been selected 
        if (currentTimes[0] == true) {
          alert(`To add new times to ${day[9].toUpperCase()}${day.slice(10)}., delete the day's current schedule and try again.`);
        }
        else if (currentTimes[0] == false && times.length === 0) { // If all day button is selected
          // Replaces currently stored times with true value for "all day" schedule to schedule day
          setSetting(day, [$('#schedule-all-day').is(":checked")]);

          // Disables both overlays for adding new schedules
          // overlay.style.display = "none";
          // newScheduleOverlay.style.display = "none";
          // entireHTML.style.overflow = "";
          hideOverlays('.schedule-overlay');

          console.log("if all day button is selected")

          // Only displays schedules and hides selection after the last schedule day has been handled
          if (index === (selectedDays.length - 1)) {
            scheduleGrid.innerHTML = "";
            deselectDaySelections(scheduleDays);
            insertSchedule();
          }
        } 
        // if any times have been selected
        else {
          // Disables both overlays for adding new schedules
          console.log("if any times have been selected")
          hideOverlays('.schedule-overlay');

          // Pushes each time selection to currentTime array  
          selectedTimes.forEach((time) => {
            currentTimes.push(time);
          })

          // Sorts the currentTimes array by the first element of each nested array
          currentTimes.sort((a, b) => {
            if (typeof a === 'boolean' || typeof b === 'boolean') {
              return 0;
            }
            return a[0].localeCompare(b[0]);
          });

          // Stores new and current times to schedule day
          setSetting(day, currentTimes);

          // Only displays schedules and hides selection after the last schedule day has been handled
          if (index === (selectedDays.length - 1)) {
            scheduleGrid.innerHTML = "";
            deselectDaySelections(scheduleDays);
            removesTimeSelection(scheduleType);
            insertSchedule();
            timeSelectionAmt = 1;
          }
        }
      }
      console.log("\n")
    })
  })
})