/**
 * @LenchetoFC 
 * @description This controls the settings pages and accurately
 *  displays current settings and user information for the schedule settings
 * 
 */

/**
 * SECTION - SCHEDULING
 * 
*/

// Used to iterate through schedule days a few times throughout script 
const scheduleDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/**
 * SECTION - INSERTS SCHEDULES INTO DOM
 * 
 */

/**
 * Converts military time in string type into the 12 hour format in string type
 * 
 * @param {string} startTime - the beginning of the schedule time
 * @param {string} endTime - the end of the schedule time
 * 
 * @returns {array} Returns an array of both times in 12-Hour format
 * 
 * @example convertMilToTwelveHour("12:42", "18:00");
 */
const convertMilToTwelveHour = (startTime, endTime) => {
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

/**
 * Adds schedules to the schedule grid in DOM. 
 * 
 * @returns {void} This function does not return anything. It adds schedules to the schedule grid.
 * 
 * @example insertSchedule();
 */
const insertSchedule = () => {
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
      scheduleItem.className = "schedule-item";
      scheduleItem.id = `schedule-${day}`;
      let scheduleItemHeader = document.createElement("section");
      scheduleItemHeader.className = "schedule-item-header";
      scheduleItemHeader.innerHTML = `
        <section class="schedule-item-day">${dayCapitalize}</section>
        <button>
          <img class="icon-delete" src="/images/icon-delete.svg" alt="X delete button">
        </button>
      `;

      // Actions for when time selection delete button is pressed
      let deleteBtn = scheduleItemHeader.querySelector(".icon-delete");
      deleteBtn.addEventListener(("click"), () => {
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
  
      scheduleItem.append(scheduleItemHeader);
      
      let scheduleTimeList = document.createElement("section");
      scheduleTimeList.className = "schedule-time-list";
  
      if (schedule[0] === true) {
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

      // Adds header and schedule items to grid if there is at least one schedule
      if (schedule[0] === true || schedule.length > 1) {
        scheduleGrid.append(scheduleItem);

        // Displays schedule grid and header
        scheduleGrid.style.display = "grid";
        header.style.display = "flex";
      }
    })
    
  })
}

// Displays all schedules
insertSchedule();

/** !SECTION */


/**
 * SECTION - MISC SCHEDULING CODE
 * 
 */

/**
 * Essentially resets the time selection by to default by hiding 
 *  the time selectors and unchecking all day checkboxes
 * 
 * @param {array} scheduleDays - an array of the checkboxes to uncheck
 * 
 * @returns {array} Returns an array of both times in 12-Hour format
 * 
 * @example hideTimeSelection(["schedule-mon", "schedule-fri"]);
 */
const hideTimeSelection = (scheduleDays) => {
  scheduleDays.forEach(element => {
    element.checked = false;
    addTimeBtn.style.display = "flex";
    newScheduleSelection.style.display = "none"
    allDayBtn.checked = false;
    scheduleNewTimeContainer.innerHTML = "";
  })
} 

//  Gets important elements from DOM
let newScheduleSelection = document.getElementById("schedule-new-container");
let allDayBtn = document.getElementById("schedule-all-day");
let addTimeBtn = document.getElementById("add-time-btn");
let scheduleNewTimeContainer = document.getElementById("time-container");
let submitSchedule = document.getElementById("submit-schedule");

const scheduleDayForm = document.querySelectorAll("form input");

// Add event listener to scheduleDayForm checkboxes
scheduleDayForm.forEach((element) => {
  element.addEventListener("change", () => {
    // Check if any checkbox is checked
    const isAnyChecked = Array.from(scheduleDayForm).some((checkbox) => checkbox.checked);
    
    // Hides/shows time selections if at least one checkbox is checked
    if (isAnyChecked) {
      newScheduleSelection.style.display = "flex"
    } else {
      addTimeBtn.style.display = "flex";
      newScheduleSelection.style.display = "none"
      allDayBtn.checked = false;
      scheduleNewTimeContainer.innerHTML = "";
    }
  });
});

/** !SECTION */


/**
 * SECTION - Add new time selection line when "add time" btn is pressed
 * 
 */
let timeSelectionAmt = 0;
addTimeBtn.addEventListener("mouseup", (event) => {
  timeSelectionAmt++;

  // Creates new element and appends time selection to schedule container 
  let timeSelection = document.createElement("section");
  timeSelection.className = "schedule-new-time"; 
  timeSelection.innerHTML = `
    <input id="schedule-start-time" name="schedule-start-time" placeholder="Start time" type="time">
      to
    <input id="schedule-end-time" name="schedule-end-time" placeholder="End time" type="time">

    <button class="btn">
      <img class="icon-delete" src="/images/icon-delete.svg" alt="Trash can delete button">
    </button>
  `;
  scheduleNewTimeContainer.append(timeSelection)

  // Actions for when time selection delete button is pressed
  let deleteBtn = timeSelection.querySelector(".btn");
  deleteBtn.addEventListener(("click"), () => {
    // Deletes time selection line the delete button is associated to
    timeSelection.remove()
    timeSelectionAmt--;

    // Displays "all time" button if the count is not at max 
    if (timeSelectionAmt < 5) addTimeBtn.style.display = "flex";
  });

  // Gets input elements of startTime and endTime time inputs
  let startTime = timeSelection.querySelector("#schedule-start-time");
  let endTime = timeSelection.querySelector("#schedule-end-time");

  // Checks if start time is later than end time
  startTime.addEventListener("blur", () => {
    if (startTime.value && endTime.value && startTime.value > endTime.value) {
      // Alerts user of their error
      startTime.style.borderColor = "red";
      endTime.style.borderColor = "red";
      alert("Start time is later than end time. Update times before adding schedule");
    } else {
      startTime.style.borderColor = "var(--text-grey-accent)";
      endTime.style.borderColor = "var(--text-grey-accent)";
    }
  });

  //FIXME - It gets stuck in an alert loop when the start time is last to be changed
  // Checks if start time is later than end time
  endTime.addEventListener("blur", () => {
    if (startTime.value > endTime.value) {
      // Alerts user of their error
      startTime.style.borderColor = "red";
      endTime.style.borderColor = "red";
      alert("Start time is later than end time. Update times before adding schedule");
    } else {
      startTime.style.borderColor = "var(--text-grey-accent)";
      endTime.style.borderColor = "var(--text-grey-accent)";
    }
  });
  
  // Removes "add time" button and notice user they can't add more
  if (timeSelectionAmt == 5) {
    addTimeBtn.style.display = "none";
    alert("You cannot add more times after this.");
  }
})

/** !SECTION */


/**
 * SECTION - Actions for when "all day" button is selected
 * 
 */
allDayBtn.addEventListener("click", () => {
  let currentDisplay = addTimeBtn.style.display;

  // Resets time selection count, hides "add time" button, & removes all time selections
  //  when "all day" button is checked 
  if (currentDisplay === "none" && timeSelectionAmt < 5) {
    addTimeBtn.style.display = "flex";
  } else {
    addTimeBtn.style.display = "none";
    scheduleNewTimeContainer.innerHTML = "";
    timeSelectionAmt = 0;
  }
})

/** !SECTION */


/**
 * SECTION - Actions for when user is submitting schedule times 
 * 
 */
submitSchedule.addEventListener("click", () => {
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
  let selectedTimes = [];
  let times = document.querySelectorAll(".schedule-new-time");
  times.forEach(element => {
    let startTimeValue = element.children[0].value;
    let endTimeValue = element.children[1].value;
    if (startTimeValue != "" && endTimeValue != "") {
      selectedTimes.push([startTimeValue, endTimeValue]);
    } else selectedTimes = "";
  });
  
  
  /**
   * SECTION - ADDING SCHEDULES TO STORAGE 
   * 
  */
 //  Add new schedule day to schedule list
  let scheduleGrid = document.getElementById("schedules");  
  selectedDays.forEach((day, index) => {
    getSettings(day, (currentTimes) => {
      // Gets boolean value of "all day" button
      let allDayChecked = allDayBtn.checked;
      if((times.length === 0 && !allDayChecked) || selectedTimes === "") alert("Select schedule times or \"All Day\" before clicking \"Done\"");
      else {
        // Runs this code if "all day" or times have been selected 
        if (currentTimes[0] == true) {
          alert(`To add new times to that day, delete the day's current schedule and try again.`);
        }
        else if (currentTimes[0] == false && times.length === 0) { // If all day button is selected
          // Replaces currently stored times with true value for "all day" schedule to schedule day
          setSetting(day, [allDayChecked]);

          // Only displays schedules and hides selection after the last schedule day has been handled
          if (index === (selectedDays.length - 1)) {
            scheduleGrid.innerHTML = "";
            hideTimeSelection(scheduleDays);
            insertSchedule();
          }
        } 
        else { // if any times have been selected
          // Pushes each time selection to currentTime array  
          selectedTimes.forEach((time) => {
            currentTimes.push(time);
          })

          // Stores new and current times to schedule day
          setSetting(day, currentTimes);

          // Only displays schedules and hides selection after the last schedule day has been handled
          if (index === (selectedDays.length - 1)) {
            scheduleGrid.innerHTML = "";
            hideTimeSelection(scheduleDays);
            insertSchedule();
          }
        }
      }
    })
  })
  /** !SECTION */

})

/** !SECTION */


/**!SECTION */