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

// Combines overlapping schedules
// Remove specific schedule days from storage
// Retrieve schedules from storage
//  Add existing schedules to HTML on load
// Add schedules to storage

//  Hide/Appear time selection when at least 1 day is selected
let newScheduleSelection = document.getElementById("schedule-new-container");
let allDayBtn = document.getElementById("schedule-all-day");
let addTimeBtn = document.getElementById("add-time-btn");
let scheduleNewTimeContainer = document.getElementById("time-container");
let submitSchedule = document.getElementById("submit-schedule");

const scheduleDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const scheduleDayForm = document.querySelectorAll("form input");
scheduleDayForm.forEach((element) => {
  getSettings(element.name, (result) => {
    // Ensures the schedule days are set to default
    console.log(result)
    // setSetting(element.name, [false, []]);

    // Updates settings for whichever button is pushed
    element.addEventListener("click", (event) => {
      setSetting(element.name, element.checked);

      let checkedList = [];

      // Checks checked value for all days
      // Determines if the time selection section is displayed
      scheduleDays.forEach(element => {
        getSettings(`schedule-${element}`, (result) => {
          checkedList.push(result);
          
          // Check if all values have been pushed
          if (checkedList.length === scheduleDays.length) {
            
            if (checkedList.includes(true)) {
              newScheduleSelection.style.display = "flex"
              
            } else {
              addTimeBtn.style.display = "flex";
              newScheduleSelection.style.display = "none"
              allDayBtn.checked = false;
              scheduleNewTimeContainer.innerHTML = "";
            }
          }
        });
      });
    });
  });
});

// Add new time selection line when "add time" btn is pressed
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

  // Checks if start time is later than end time
  endTime.addEventListener("blur", () => {
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
  
  // Removes "add time" button and notice user they can't add more
  if (timeSelectionAmt == 5) {
    addTimeBtn.style.display = "none";
    alert("You cannot add more times after this.");
  }
})

//  Actions for when "all day" button is selected
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

// Actions for when user is submitting schedule times
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

  // Gets selected time values
  let selectedTimes = [];
  let times = document.querySelectorAll(".schedule-new-time");
  times.forEach(element => {
    let startTimeValue = element.children[0].value;
    let endTimeValue = element.children[1].value;
    if (startTimeValue != "" && endTimeValue != "") {
      selectedTimes.push([startTimeValue, endTimeValue]);
    }
  });
  
  // Gets boolean value of "all day" button
  let allDayChecked = allDayBtn.checked;
  if (times.length === 0 && allDayChecked) selectedTimes.push(allDayChecked)
  else if(times.length === 0 && !allDayChecked) alert("Select schedule times or \"All Day\" before clicking \"Done\"");
  
  //  Add new schedule day to schedule list
  selectedDays.forEach((day) => {
    console.log(day)
    console.log(selectedTimes)
    // setSetting(day, [false, selectedTimes]);
  })
  console.log(selectedDays);
  console.log(selectedTimes);

})

//  Add schedule times to existing days
//  Restrict adding new schedule times to "all day" schedules

/**!SECTION */
