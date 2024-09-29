/** INFORMATION
 * @LenchetoFC 
 * @description This controls the settings pages and accurately
 *  displays current settings and user information for the schedule settings
 * 
 */

// TODO: Better name class and id names
// FIXME: new schedule overlay - when times are added, the next time the overlay pops up, it will not have the any time lines

/**
 * SECTION - INITIAL VARIABLES AND FUNCTION CALLS
 */

/** Initial Variable Instances */
const scheduleDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
let timeIntervalAmt = 1;

/** Initial Function Calls */
isTimeChoiceValid($('#schedule-start-time'), $('#schedule-end-time')); //Adds invalid test to first default interval
hidesTimeInterval();
insertSchedule();

// TODO:
// let allDayBtn = document.getElementById("schedule-all-day");
// let addTimeInterval = document.getElementById("add-new-time-btn");
let newTimeContainer = document.getElementById("new-time-container");
// let submitSchedule = document.getElementById("submit-schedule");

const scheduleDayForm = document.querySelectorAll("form input");
// const firsttimeIntervalLine = $('#time-container section:first-child');


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
  let scheduleGrid = $("#schedules");  
    // Actions for when time selection delete button is pressed
    $('#schedules').on('click', '.schedule-delete', function() {
    // Retrieves the ID stored in the button's data-id attribute
    let containerId = $(this).data('id');
    
    // Deletes the container with the matching ID
    $("#" + containerId).remove();
    console.log(containerId);

    let dayToDelete = containerId.slice("schedule-".length);
    setNestedSetting('schedule-days', dayToDelete, [false]);

    // Eliminates extra space if there are no active schedules
    if ($('#schedules').children().length === 0) {
      $('#schedules').css("display", "none");
      $('#schedule-title').css("display", "none");
    }
  });

  // Checks each day for schedules and displays any that exist on page
  $.each(scheduleDays, (index, day) => {
    let dayCapitalize =  day[0].toUpperCase() + day.slice(1);
    
    // Gets the stored schedules (if any) from schedule days settings
    getSettings(`schedule-days`, (schedules) => {
      let schedule = schedules[day];

      // Immediately skips day if there are no schedules
      if (schedule.length === 1 && schedule[0] === false) return;

      let scheduleItem = $("<section>").addClass("schedule-item flex-col").attr("id", `schedule-${day}`);
      let scheduleItemHeader = $("<section>").addClass("schedule-item-header").html(`
        <section class="schedule-item-day">${dayCapitalize}</section>
      `);
  
      scheduleItem.append(scheduleItemHeader);
      
      let scheduleTimeList = $("<section>").addClass("schedule-time-list");
  
      // Adds either all day (schedule[0] = true) or all scheduled times (false) 
      if (schedule[0]) {
        let scheduleTime = $("<section>").addClass("schedule-time").html(`
          <div class="schedule-start-time"></div>
          <div>All Day</div> 
          <div class="schedule-end-time"></div>
        `);
  
        scheduleTimeList.append(scheduleTime);
        scheduleItem.append(scheduleTimeList);
      } else if (schedule[0] === false && schedule.length > 1) {
        console.log("adds time")
        $.each(schedule.slice(1), (index, time) => {
          // Converts military time to 12-hour clock
          let convertedTime = convertMilToTwelveHour(time[0], time[1]);
  
          let scheduleTime = $("<section>").addClass("schedule-time").html(`
            <div class="schedule-start-time">${convertedTime[0]}</div>
            <div>to</div> 
            <div class="schedule-end-time">${convertedTime[1]}</div>
          `);
          scheduleTimeList.append(scheduleTime);
        });
  
        scheduleItem.append(scheduleTimeList);
      }

      // Creates and appends schedule delete button
      let deleteBtnIcon = $("<img>")
        .addClass("icon-delete schedule-delete")
        .attr("src", "/images/icon-trash.svg")
        .attr("alt", "X delete button")
        .attr("data-id", scheduleItem.attr("id"));      

      let scheduleDeleteBtn = $("<button>").append(deleteBtnIcon);

      // Creates and appends schedule edit button 
      let editBtnIcon = $("<img>").addClass("icon-in-btn").attr("src", "/images/icon-edit-simple.svg").attr("alt", "pencil edit button");
      let scheduleEditBtn = $("<button>").append(editBtnIcon);

      // Creates and appends button container to schedule item
      let buttonContainer = $("<div>").addClass("schedule-btn-container");
      
      buttonContainer.append(scheduleDeleteBtn);
      buttonContainer.append(scheduleEditBtn);
      scheduleItem.append(buttonContainer);

      // Adds header and schedule items to grid if there is at least one schedule
      if (schedule[0] || schedule.length > 1) {
        scheduleGrid.append(scheduleItem);

        // Displays schedule grid and header
        scheduleGrid.css("display", "grid");
      }
    });
  });
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
function deselectDaySelections(scheduleDays) {
  $(scheduleDays).each(function() {
    $(this).prop('checked', false);
  });

  $('#schedule-all-day').prop('checked', false);
  addsTimeInterval();
}

/** FUNCTION - Hides entire time selection container */
function hidesTimeInterval() {
  $('#add-new-time-btn').css('display', 'flex');
  $('#schedule-time-container').slideUp();
  $('#schedule-all-day').prop('checked', false);
  $('#new-time-container').text = "";
}

/** FUNCTION - Reinserts first time selection line when "all day" button is deselected */
function addsTimeInterval () {
  $('#add-new-time-btn').fadeIn();
  $('.schedule-time-container').css('padding', '1rem 0');
  $('.schedule-time-container').slideDown();
}

/** FUNCTION - Removes all but one time selection line when "all day" button is selected */
function removesTimeInterval (scheduleType) {
  $('.schedule-time-container').slideUp();
  $('#add-new-time-btn').fadeOut();
  $('.schedule-time-container').css('padding', '0');
  console.log(scheduleType)
  
  // Keeps first time selection child to avoid miscounting children after deselecting all day btn
  while (newTimeContainer.lastChild.id !== `first-time-selection-${scheduleType}`) {
    newTimeContainer.removeChild(newTimeContainer.lastChild);
  } 

  removeTimeValues();

  timeIntervalAmt = 1;
}

/** TODO: Function description */
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

/** TODO: Function description */
function getSelectedTimeValue(times) {
  let selectedTimes = [];
  times.each(function() {
    let startTimeValue = $(this).children().eq(0).val();
    let endTimeValue = $(this).children().eq(2).val();
    if (startTimeValue != "" && endTimeValue != "") {
      selectedTimes.push([startTimeValue, endTimeValue]);
    } else selectedTimes = "";
  });
  console.log(selectedTimes)

  return selectedTimes;
}

/** FUNCTION - hides overlays */
/** TODO: better description */
function hideOverlay (formOverlayID) {
  $('#overlay').css("display", "none");
  $(formOverlayID).css("display", "none");
  $('html').css('overflow', '');
}

// FIXME: sometimes gets stuck in endless alert loop
/** FUNCTION - Checks if time selections are valid (i.e. start time is always less than end time) */
function isTimeChoiceValid(startTime, endTime) {
  // Checks if start time is later than end time
  startTime.on('blur', () => {
    if (startTime.val() && endTime.val() && startTime.val() > endTime.val()) {
      // Alerts user of their error
      startTime.css('borderColor', 'var(--red)');
      endTime.css('borderColor', 'var(--red)');
      alert("Start time is later than end time. Update times before adding schedule");
    } else {
      startTime.css('borderColor', 'var(--grey)');
      endTime.css('borderColor', 'var(--grey)');
    }
  });

  // Checks if start time is later than end time
  endTime.on('blur', () => {
    if (startTime.val() > endTime.val()) {
      // Alerts user of their error
      startTime.css('borderColor', 'var(--red)');
      endTime.css('borderColor', 'var(--red)');
      alert("Start time is later than end time. Update times before adding schedule");
    } else {
      startTime.css('borderColor', 'var(--grey)');
      endTime.css('borderColor', 'var(--grey)');
    } 
  });
}

/**TODO: Function description */
function populateScheduleTimes() {

}

/** TODO: Function description */
// TODO: get initial timeIntervalAmt of what is already there for edit schedule
function addTimeInterval(scheduleType) {
  timeIntervalAmt++;

  // console.log(`${scheduleType} time interval`);
  // let scheduleType = "new"
  // Creates new element and appends time selection to schedule container 

  let timeInterval = $('<section>', {
    class: 'schedule-new-time',
    id: `${scheduleType}-time-line-${timeIntervalAmt}`,
    css: {
      display: 'none'
    },
    html: `
      <input id="schedule-start-time" name="schedule-start-time" placeholder="Start time" type="time">
        <div>to</div>
      <input id="schedule-end-time" name="schedule-end-time" placeholder="End time" type="time">

      <button class="btn">
        <img class="icon-delete" src="/images/icon-trash.svg" alt="Trash can delete button">
      </button>
    `
  });
  
  $('#new-time-container').append(timeInterval);
  $(`#${scheduleType}-time-line-${timeIntervalAmt}`).slideDown();

  // Actions for when time selection delete button is pressed
  // let deleteBtn = timeInterval.querySelector(".btn");
  $(`#new-time-line-${timeIntervalAmt} .btn`).on("click", function () {
    // Deletes time selection line the delete button is associated to
    $(`#new-time-line-${timeIntervalAmt}`).slideUp(function() {
      $(this).remove();
    });
    timeIntervalAmt--;

    // Displays "all time" button if the count is not at max 
    if (timeIntervalAmt < 5) $('#add-new-time-btn').fadeIn();
  });

  // Checks if start time is less than end time
  let startTime = timeInterval.find("#schedule-start-time");
  let endTime = timeInterval.find("#schedule-end-time");  
  isTimeChoiceValid(startTime, endTime);

  // Removes "add time" button so user can't add more intervals
  if (timeIntervalAmt == 5) $('#add-new-time-btn').fadeOut();
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
  removesTimeInterval();
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
      hidesTimeInterval();
    }
  });
});

/** Add new time selection line "add time" btn is pressed and passes scheduleType (edit or new) */
$('.add-time-btn').on('click', function() {
  let scheduleType = $(this).val();
  // console.log(scheduleType)
  addTimeInterval(scheduleType);
})

/** Remove or insert time selection when "all day" button is clicked in new/edit schedule overlay */
$('#schedule-all-day').on("click", function () {
  let scheduleType = $('#schedule-all-day').prop("value");
  // console.log(`Schedule type: ${scheduleType}`)
  if ($('#schedule-all-day').is(":checked")) {
    removesTimeInterval(scheduleType);
  } else {
    addsTimeInterval();
  }
})

// TODO: make reusable for edit schedule
/** Actions for when user is submitting schedule times */
$('.submit-schedule').on("click", function () {
  // Gets selected time values and pushes them to an array
  let scheduleType = $(this).val();
  let times = $(`.schedule-${scheduleType}-time`);
  let selectedTimes;
  // console.log(times)

  if ($('#schedule-all-day').is(":checked")) {
    selectedTimes = true // if all day is selected
  } {
    selectedTimes = getSelectedTimeValue(times);
    // console.log(selectedTimes)
  }

  // Gets selected schedule days
  let selectedDays = [];
  let scheduleDays = $(".schedule-day label input");

  // Filters out unselected days
  let filteredDays = Array.from(scheduleDays, (day) => ({[day.name]: day.checked})).filter(day => day[Object.keys(day)[0]]);

  // Gets rid of true boolean values and only keeps selected days
  filteredDays.forEach((element) => {
    selectedDays.push(Object.keys(element)[0]);
  });  

  // Alerts error and breaks from block if any invalid combo is selected
  if ((!($('#schedule-all-day').is(":checked")) && selectedTimes === "") || selectedDays.length === 0) {
    alert("Please choose a valid schedule selection...");
    return;
  }

  // FIXME: cannot do multiple days at once
  // FIXME: Adding time intervals do not work - it may register as if all day button has been selected when it hasnt been
  /** SECTION - ADDING SCHEDULES TO STORAGE */
  // Add new schedule day to schedule list
  let scheduleGrid = $("#schedules");  
  selectedDays.forEach((day, index) => {
    getSettings("schedule-days", (schedules) => {
      let currentTimes = schedules[day];
      // console.log("\n")
      // console.log(`Day: ${day}`)
      // console.log(`Times Length: ${times.length}`)
      // console.log(`Is all day checked? ${$('#schedule-all-day').is(":checked")}`)
      // console.log(`Selected times is blanked? ${selectedTimes === ""}`)
      // console.log(`Current times: ${currentTimes}`)
      // console.log(`all day checked? ${!($('#schedule-all-day').is(":checked")) && selectedTimes == ""}`)


      console.log(currentTimes[0])
      console.log(currentTimes)
      console.log(selectedTimes)

      if (!($('#schedule-all-day').is(":checked")) && selectedTimes === "") {
        alert("Select times or \"All Day\" before clicking \"Done\"");
      } else {
        // Runs this code if "all day" or times have been selected 
        if (currentTimes[0] == true || currentTimes == true) {
          alert(`To add new times to ${day.toUpperCase()}., delete the day's current schedule and try again.`);
        }
         // If all day button is selected
        else if ((currentTimes[0] == false || currentTimes == false) && $('#schedule-all-day').is(":checked")) {
          // Replaces currently stored times with true value for "all day" schedule to schedule day
          console.log($('#schedule-all-day').is(":checked"))
          setNestedSetting('schedule-days', day, [$('#schedule-all-day').is(":checked")], () => {
            hideOverlay('.schedule-overlay');
  
            // console.log("if all day button is selected")
  
            // Only displays schedules and hides selection after the last schedule day has been handled
            // console.log(`index: ${index}`);
            // console.log(`selected days: ${selectedDays}`);
            // console.log(`selected days length: ${selectedDays.length - 1}`);
            if (index == (selectedDays.length - 1)) {
              $("#schedules").empty();
              deselectDaySelections(scheduleDays);
              insertSchedule();
            }
          });

        } 
        // if any times have been selected
        else {
          console.log("if any times have been selected")
          
          // Pushes each time selection to currentTime array  
          selectedTimes.forEach((time) => {
            currentTimes.push(time);
          })

          console.log(currentTimes)
          
          // Sorts the currentTimes array by the first element of each nested array
          currentTimes.sort((a, b) => {
            if (typeof a === 'boolean' || typeof b === 'boolean') {
              return 0;
            }
            return a[0].localeCompare(b[0]);
          });
          
          // Stores new and current times to schedule day
          // console.log(currentTimes)
          setNestedSetting('schedule-days', day, currentTimes, () => {
            hideOverlay('.schedule-overlay');

            // Only displays schedules and hides selection after the last schedule day has been handled
            if (index === (selectedDays.length - 1)) {
              scheduleGrid.html("");
              deselectDaySelections(scheduleDays);
              removesTimeInterval(scheduleType);
              insertSchedule();
              timeIntervalAmt = 1;
            }
          });


        }
      }
      // console.log("\n")
    })
  })
})

//TODO: add function to check if any of the selected schedules are already set
// if so, set an alert before adding new schedules to allow user to 
// also, only push one alert after every day is checked to list all days affected 