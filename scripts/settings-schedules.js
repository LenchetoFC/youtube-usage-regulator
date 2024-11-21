/**
 * @file settings-schedules.js
 * @description Controls the calendar and the scheduling on settings page
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @requires module:global-functions
 * @see {@link module:global-functions.selectRecordByIdGlobal}
 * @see {@link module:global-functions.deleteRecordByIdGlobal}
 * @see {@link module:global-functions.selectAllRecordsGlobal} x 2
 * @see {@link module:global-functions.insertRecordsGlobal}
 * @see {@link module:global-functions.updateRecordByPropertyGlobal} x 6
 * @see {@link module:global-functions.resetTableGlobal} x 2
 * @see {@link module:global-functions.displayNotifications} x 8
 * @see {@link module:global-functions.toggleButtonAnimation} x 4
 *
 *
 * @notes
 */

/** TODO:
 * - add editability via dragging (eventDrop) and resizing events (eventResize)
 * - group schedules to change all at the same time
 * - active all day event will darken the whole day to signify
 */

/** FIXME:
 * - weird behavior when updating events from all-day to times within the same day, and vice versa
 */

/**
 * SECTION - HANDLING SCHEDULE STORAGE
 */

/**
 * Closes the popover and resets the schedule form.
 *
 * @name closePopover
 *
 * @returns {void} Closes the popover and resets the form.
 */
function closePopover() {
  document.getElementById("popover-schedule-event").hidePopover();
  $("#schedule-form")[0].reset();
  $("#overlay").css("display", "none");
}

/**
 * Fetches events for a specific day.
 *
 * @name fetchEventsInDay
 *
 * @param {number} dayId - The ID of the day to fetch events for.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of events for the specified day.
 */
async function fetchEventsInDay(dayId) {
  return await filterRecordsGlobal("schedule-events", "dayId", parseInt(dayId));
}

/**
 * Checks the active status of each day and updates it accordingly.
 *
 * @name checkActiveDayStatus
 *
 * @returns {void} Updates the active status of each day.
 */
async function checkActiveDayStatus() {
  let results;
  console.log("Checking status of active days...");
  for (let dayId = 0; dayId < 7; dayId++) {
    // Gets all events in the current day
    let eventsWithDayId = await fetchEventsInDay(dayId);
    let dayObj = await selectRecordByIdGlobal("schedule-days", dayId);

    if (eventsWithDayId.length == 0 && dayObj["all-day"] == false) {
      // set day to inactive
      results = await updateRecordByPropertyGlobal(
        "schedule-days",
        "id",
        parseInt(dayId),
        { active: false }
      );
    } else {
      // set day to active
      results = await updateRecordByPropertyGlobal(
        "schedule-days",
        "id",
        parseInt(dayId),
        { active: true }
      );
    }

    console.log(results.message);
  }
  console.log("Completed checking status of active days!");
}

/**
 * Resets the schedule for a specific day.
 *
 * @name resetScheduleDay
 *
 * @returns {void} Resets the schedule for the specified day.
 */
async function resetScheduleDay() {
  const dayId = $("#delete-schedule").attr("data-day-id");

  // Gets all events in that day
  let eventsWithDayId = await fetchEventsInDay(dayId);

  const defaultScheduleObj = {
    active: false,
    additionalSites: false,
    "all-day": false,
    dayId: parseInt(dayId),
    id: parseInt(dayId),
  };

  // If there are at least 1 event left in the day, schedule-day will be set to active
  if (eventsWithDayId > 0) {
    defaultScheduleObj.active = true;
  }

  let updateResult = await updateRecordByPropertyGlobal(
    "schedule-days",
    "id",
    parseInt(dayId),
    defaultScheduleObj
  );

  console.log(updateResult.message);
}

/**
 * Deletes a schedule event.
 *
 * @name deleteScheduleEvent
 *
 * @returns {void} Deletes the specified schedule event.
 */
async function deleteScheduleEvent() {
  // Delete record via event id
  const eventId = $("#delete-schedule").attr("data-event-id");
  let results = await deleteRecordByIdGlobal(
    "schedule-events",
    parseInt(eventId)
  );
  console.log(results.message);

  // Gets all events in that day
  const dayId = $("#delete-schedule").attr("data-day-id");
  let eventsWithDayId = await fetchEventsInDay(dayId);

  // If there are no events left in the day, schedule-day with id {dayId} will be set to default
  if (eventsWithDayId == 0) {
    resetScheduleDay();
  }
}

/**
 * Creates an array of schedule events.
 *
 * @name createScheduleEventsObj
 *
 * @returns {Promise<Array>} A promise that resolves to an array of schedule events.
 */
async function createScheduleEventsObj() {
  let scheduleEvents = [];

  // Individual Events
  let events = await selectAllRecordsGlobal("schedule-events");
  events.forEach((element) => {
    let title = element.additionalSites
      ? "YouTube + Additional Sites Restricted"
      : "YouTube Restricted";

    let eventObj = {
      id: element.id,
      title: title,
      startTime: element.startTime,
      endTime: element.endTime,
      daysOfWeek: [element.dayId],
      extendedProps: {
        additionalSites: element.additionalSites,
        dayId: element.dayId,
      },
    };

    scheduleEvents.push(eventObj);
  });

  return scheduleEvents;
}

/**
 * Creates an array of all-day schedule events.
 *
 * @name createScheduleDayObj
 *
 * @returns {Promise<Array>} A promise that resolves to an array of all-day schedule events.
 */
async function createScheduleDayObj() {
  let scheduleDays = [];

  let events = await selectAllRecordsGlobal("schedule-days");
  let allDaySchedules = events.filter((day) => day["all-day"]);

  allDaySchedules.forEach((element) => {
    let title = element.additionalSites
      ? "YouTube + Additional Sites Restricted"
      : "YouTube Restricted";

    let eventObj = {
      id: element.dayId,
      title: title,
      allDay: element["all-day"],
      daysOfWeek: [element.dayId],
      extendedProps: {
        additionalSites: element.additionalSites,
        dayId: element.dayId,
      },
    };

    scheduleDays.push(eventObj);
  });

  return scheduleDays;
}

/**
 * Fetches all schedule events, combining individual and all-day events.
 *
 * @name fetchScheduleEvents
 *
 * @returns {Promise<Array>} A promise that resolves to an array of all schedule events.
 */
async function fetchScheduleEvents() {
  // Combines individual events and all day events into one array
  let events = [
    ...(await createScheduleEventsObj()),
    ...(await createScheduleDayObj()),
  ];

  return events;
}

/**
 * Inserts a new event into the schedule.
 *
 * @name insertNewEvent
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the event was successfully inserted, false otherwise.
 */
async function insertNewEvent() {
  try {
    // Disable the submit button
    toggleButtonAnimation(`#save-schedule`, true);

    // Saves website to database
    // -- new site will create a new website id; existing site will use the ID to update website data
    setTimeout(async function () {
      let updateEventResult;
      let newEventResult;

      const form = document.getElementById("schedule-form");
      let formValidity = isFormValid(form);

      // Re-enable button after animation
      toggleButtonAnimation(`#save-schedule`, false);

      // If form is invalid, end function
      if (!formValidity) {
        displayNotifications(
          "Please select at least one day and choose event times.",
          "#d92121",
          "release_alert",
          5000
        );
        return;
      }

      // Get form values
      const eventObj = getScheduleFormValues();

      // Iterates through all selected days
      for (let dayId of eventObj.days) {
        // Deletes days array from & adds dayId to event object copy
        let event = eventObj;
        delete event.days;
        event.dayId = dayId;

        // Updates schedule-day day with active = true
        if (eventObj["all-day"]) {
          updateEventResult = await updateAllDayEvent(event);
        } else {
          // Deletes any unnecessary properties
          delete event["all-day"];

          // Updates schedule-day with an active status
          /** schedule-event record
           * additionalSites: BOOLEAN
           * dayId: INT
           * endTime: TIMESTAMP
           * startTime: TIMESTAMP
           */
          updateEventResult = await updateRecordByPropertyGlobal(
            "schedule-days",
            "id",
            parseInt(event.dayId),
            { active: true }
          );

          // Insert event into database
          newEventResult = await insertRecordsGlobal("schedule-events", [
            event,
          ]);
        }
      }

      checkActiveDayStatus();

      // Gets status message from insertion
      if (updateEventResult.error) {
        // Displays failure notification
        displayNotifications(
          "Could not add event. Try again later.",
          "#d92121",
          "release_alert",
          5000
        );

        throw new Error(updateEventResult.message);
      } else if (newEventResult?.error) {
        // Displays failure notification
        displayNotifications(
          "Could not add event. Try again later.",
          "#d92121",
          "release_alert",
          5000
        );

        throw new Error(newEventResult.message);
      } else {
        console.log(updateEventResult.message);

        // Rerenders calendar
        renderCalendar();

        // Closes popover
        closePopover();

        // Displays success notification
        displayNotifications(
          "Successfully Added New Event!",
          "#390",
          "verified",
          2000
        );
      }

      return true;
    }, 1500);
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * Updates an all-day event in the schedule.
 *
 * @name updateAllDayEvent
 *
 * @param {Object} event - The event object to update.
 *
 * @returns {Promise<Object>} A promise that resolves to the result of the update operation.
 */
async function updateAllDayEvent(event) {
  const DAYNAMES = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  // Deletes any unnecessary properties
  delete event.startTime;
  delete event.endTime;

  // Adds missing schedule-day properties
  event.active = true;
  event.id = event.dayId;
  event.name = DAYNAMES[event.dayId];

  // Updates schedule day in database
  /** schedule-day record
   * active: BOOLEAN
   * additionalSites: BOOLEAN
   * all-day: BOOLEAN
   * dayId: INT
   * id: INT
   * name: string
   */
  return await updateRecordByPropertyGlobal(
    "schedule-days",
    "id",
    parseInt(event.dayId),
    event
  );
}

/**
 * Updates an existing schedule event.
 *
 * @name updateScheduleEvent
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the event was successfully updated, false otherwise.
 */
async function updateScheduleEvent() {
  /** Saves new additional website to database */
  try {
    // Disable the submit button
    toggleButtonAnimation(`#update-schedule`, false);

    // Saves website to database
    // -- new site will create a new website id; existing site will use the ID to update website data
    setTimeout(async function () {
      let saveEventResult;

      // Re-enable button after animation
      toggleButtonAnimation(`#update-schedule`, false);

      const form = document.getElementById("schedule-form");
      let formValidity = isFormValid(form);

      // If form is invalid, end function
      if (formValidity.includes(false)) {
        let notifMessages = [
          "Please choose both event times.",
          "Please select at least one day.",
          "Please select an end time that is after start time.",
        ];

        displayNotifications(
          notifMessages[formValidity.findIndex((result) => result == false)],
          "#d92121",
          "release_alert",
          5000
        );
        return;
      }

      // Get form values
      const eventObj = getScheduleFormValues();
      getExistingEventFormValues(eventObj);

      // Iterates through all selected days
      for (let dayId of eventObj.days) {
        // Deletes days array from & adds dayId to event object copy
        let event = eventObj;
        delete event.days;
        event.dayId = dayId;

        // Updates schedule-day day with active = true
        if (eventObj["all-day"]) {
          saveEventResult = await updateAllDayEvent(event);
        } else {
          // Deletes any unnecessary properties
          delete event["all-day"];

          // Insert event into database
          /** schedule-event record
           * id: INT
           * additionalSites: BOOLEAN
           * dayId: INT
           * endTime: TIMESTAMP
           * startTime: TIMESTAMP
           */
          saveEventResult = await updateRecordByPropertyGlobal(
            "schedule-events",
            "id",
            parseInt(event.id),
            event
          );
        }
      }

      checkActiveDayStatus();

      // Gets status message from insertion
      if (saveEventResult.error) {
        displayNotifications(
          "Could not update event. Try again later.",
          "#d92121",
          "release_alert",
          5000
        );

        throw new Error(saveEventResult.message);
      } else {
        console.log(saveEventResult.message);

        // Rerenders calendar
        renderCalendar();

        // Closes popover
        closePopover();

        displayNotifications(
          "Successfully Updated Event!",
          "#390",
          "verified",
          2000
        );
      }

      return true;
    }, 1500);
  } catch (error) {
    console.error(error);
    return false;
  }
}

/** !SECTION */

/** SECTION - PREPARING TO SAVE SCHEDULE */

/**
 * Checks if the form is valid.
 *
 * @name isFormValid
 *
 * @param {HTMLFormElement} form - The form element to be validated.
 *
 * @returns {boolean} Returns true if the form is valid, false otherwise.
 */
function isFormValid(form) {
  let formValidity = form.checkValidity();
  let checkboxesValidity = areDayCheckboxesChecked();
  let timeInputValidity = isTimeInputValid();

  if (!formValidity || !checkboxesValidity || !timeInputValidity) {
    form.reportValidity();
  }
  return [formValidity, checkboxesValidity, timeInputValidity];
}

/**
 * Checks if the end time is before start time in form
 *
 * @name isTimeInputValid
 *
 * @returns {boolean} Returns true if end time is set to a time before start time, false otherwise.
 */
function isTimeInputValid() {
  let startTime = $("#schedule-form #startTime");
  let endTime = $("#schedule-form #endTime");
  return startTime.val() <= endTime.val();
}

/**
 * Checks if any day checkboxes are checked.
 *
 * @name areDayCheckboxesChecked
 *
 * @returns {boolean} Returns true if any day checkboxes are checked, false otherwise.
 */
function areDayCheckboxesChecked() {
  let isChecked =
    $('#schedule-day-options input[type="checkbox"]:checked').length > 0;

  return isChecked;
}

/**
 * Gets the values from the schedule form.
 *
 * @name getScheduleFormValues
 *
 * @returns {Object} Returns an object containing the form values.
 */
function getScheduleFormValues() {
  const eventObj = {
    days: [],
    "all-day": false,
    additionalSites: false,
    endTime,
    startTime,
  };

  // Gets all checked days
  const checkedDays = document.querySelectorAll(
    "#schedule-form #schedule-day-options input[type='checkbox']:checked"
  );

  checkedDays.forEach((input) => {
    eventObj.days.push(parseInt(input.value));
  });

  // Gets start time, end time, and additional schedule options
  const scheduleTimes = document.querySelectorAll(
    "#schedule-form input[type='time']"
  );

  scheduleTimes.forEach((input) => {
    eventObj[input.name] = `${input.value}:00`;
  });

  // Get all day and additional websites values
  eventObj.additionalSites = $("#additionalSites").prop("checked");
  eventObj["all-day"] = $("#all-day").prop("checked");

  return eventObj;
}

/**
 * Gets the values of an existing event from the form.
 *
 * @name getExistingEventFormValues
 *
 * @param {Object} eventObj - The event object to populate with form values.
 *
 * @returns {void} Populates the event object with form values.
 */
function getExistingEventFormValues(eventObj) {
  const updateButton = $("#schedule-form #update-schedule");

  eventObj["id"] = parseInt(updateButton.attr("data-event-id"));
}

/** !SECTION */

/** SECTION - POPULATING FORM */
/**
 * Populates the event overlay with event information.
 *
 * @name populateEventOverlay
 *
 * @param {Object} eventInfo - The event information to populate the overlay with.
 *
 * @returns {void} Populates the event overlay with the provided event information.
 */
function populateEventOverlay(eventInfo) {
  const DAYNAMES = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  // Create eventObj depending on event creation method type (update or select)
  const eventObj = createEventObject(eventInfo);

  let startStr = eventObj.startStr;
  let endStr = eventObj.endStr;

  let startDate = startStr.getDate();
  let endDate = endStr != "" ? endStr.getDate() : startDate;
  let startDay = startStr.getDay();
  let endDay = endStr != "" ? endStr.getDay() : startDay;

  // Sets startDay to correct day
  // - because startDay technically starts on day before selection
  // - so sunday through wednesday would be 6 through 3
  if (eventObj.isAllDay) {
    // Accommodates for selection starting on Sunday
    // Accommodates for all week selection
    if (startDay > endDay || (startDay == endDay && startDate != endDate)) {
      startDay = 0;
    } else if (endStr == "") {
      // Accommodates or existing all-day events
      startDay++;
      endDay++;
    } else {
      startDay++;
    }
  } else {
    // Reformats start and end time & sets time inputs
    $("#startTime").val(formatEventStartTime(startStr));
    $("#endTime").val(formatEventEndTime(endStr));
  }

  // Checks all selected days
  for (let dayId = startDay; dayId <= endDay; dayId++) {
    $(`#${DAYNAMES[dayId]}`).attr("checked", true);
  }

  // Populates form
  insertScheduleFormHeader(eventObj.isAdditionalSitesChecked);
  $("#additionalSites").attr("checked", eventObj.isAdditionalSitesChecked);
  $("#all-day").attr("checked", eventObj.isAllDay);

  hideTimeContainer(eventObj.isAllDay);
  determineFormFooterButtons(eventObj);
}

/**
 * Creates an event object based on event information.
 *
 * @name createEventObject
 *
 * @param {Object} eventInfo - The event information to create the event object from.
 *
 * @returns {Object} Returns the created event object.
 */
function createEventObject(eventInfo) {
  const eventObj = {
    startStr: "",
    endStr: "",
    dayId: 0,
    isAllDay: false,
    isAdditionalSitesChecked: false,
    isNewEvent: false,
    eventId: 0,
  };

  // eventInfo.event is null for events created through selecting times on calendar
  let isEventInfoNull = eventInfo.event == null;

  // assigns event info depending on creating via updating or selecting times
  let event = isEventInfoNull ? eventInfo : eventInfo.event;

  // Assigns start time, end time, and isAllDay
  eventObj.startStr = new Date(event.startStr);
  if (event.endStr != "") {
    eventObj.endStr = new Date(event.endStr);
  }
  eventObj.isAllDay = event.allDay;

  eventObj.eventId = parseInt(event.id);

  // Assigns the other proprties that depend on the creation method
  if (isEventInfoNull) {
    eventObj.dayId = eventObj.startStr.getDay();
    eventObj.isNewEvent = true;
  } else {
    eventObj.dayId = event.extendedProps.dayId;
    eventObj.isAdditionalSitesChecked = event.extendedProps.additionalSites;
  }

  // Only if the new event is an all day, add 1 to the day id to get the correct day
  if (eventObj.isAllDay && eventObj.isNewEvent) {
    eventObj.dayId++;
  }

  return eventObj;
}

/**
 * Hides or shows the time container based on the all-day status.
 *
 * @name hideTimeContainer
 *
 * @param {boolean} isAllDay - Indicates whether the event is an all-day event.
 *
 * @returns {void} Hides or shows the time container based on the all-day status.
 */
function hideTimeContainer(isAllDay) {
  if (isAllDay) {
    $("#new-time-container").css("display", "none");
  } else {
    $("#new-time-container").css("display", "flex");
  }
}

/**
 * Determines the form footer buttons based on the event object.
 *
 * @name determineFormFooterButtons
 *
 * @param {Object} eventObj - The event object to determine the form footer buttons for.
 *
 * @returns {void} Determines the form footer buttons based on the event object.
 */
function determineFormFooterButtons(eventObj) {
  if (eventObj.isNewEvent) {
    // Hides delete and update buttons, and shows save button
    $("span:has(> #save-schedule)").css("display", "flex");
    $("#delete-schedule").css("display", "none");
    $("span:has(> #update-schedule)").css("display", "none");
  } else {
    // Adds event details as data attributes to delete button
    $("#delete-schedule").attr("data-event-id", eventObj.eventId);
    $("#delete-schedule").attr("data-is-all-day", eventObj.isAllDay);
    $("#delete-schedule").attr("data-day-id", eventObj.dayId);

    // Adds event details as data attributes to update button
    $("#update-schedule").attr("data-event-id", eventObj.eventId);

    // Shows delete and update buttons, and hides save button
    $("#delete-schedule").css("display", "flex");
    $("span:has(> #update-schedule)").css("display", "flex");
    $("span:has(> #save-schedule)").css("display", "none");
  }
}

/**
 * Inserts the correct schedule block type title on the event form.
 *
 * @name insertScheduleFormHeader
 *
 * @param {boolean} isAdditionalSitesChecked - Indicates whether additional sites are checked.
 *
 * @returns {void} Inserts the correct schedule block type title on the event form.
 */
function insertScheduleFormHeader(isAdditionalSitesChecked) {
  let headerText = isAdditionalSitesChecked
    ? "YouTube + Additional Sites Restricted"
    : "YouTube Restricted";
  $("#popover-schedule-event > header h1").html(headerText);
}

/**
 * Formats the start time of an event.
 *
 * @name formatEventStartTime
 *
 * @param {Date} startString - The start time of the event.
 *
 * @returns {string} Returns the formatted start time.
 */
function formatEventStartTime(startString) {
  let startHours = startString.getHours().toString().padStart(2, "0");
  let startMinutes = startString.getMinutes().toString().padStart(2, "0");
  return `${startHours}:${startMinutes}`;
}

/**
 * Formats the end time of an event.
 *
 * @name formatEventEndTime
 *
 * @param {Date} endString - The end time of the event.
 *
 * @returns {string} Returns the formatted end time.
 */
function formatEventEndTime(endString) {
  let endHours = endString.getHours().toString().padStart(2, "0");
  let endMinutes = endString.getMinutes().toString().padStart(2, "0");
  return `${endHours}:${endMinutes}`;
}

/**
 * Opens the event overlay for creating or updating an event.
 *
 * @name openEventOverlay
 *
 * @param {Object} [eventInfo={}] - The event information to populate the overlay with.
 *
 * @returns {void} Opens the event overlay for creating or updating an event.
 */
function openEventOverlay(eventInfo = {}) {
  // Sets all checkboxes to false and deletes any selected times
  clearEventForm();

  // Populates overlay if updating existing event
  if (Object.keys(eventInfo).length != 0) {
    populateEventOverlay(eventInfo);
  }

  // Opens popover for schedule form
  document.querySelector("#popover-schedule-event").showPopover();
  $("#overlay").css("display", "flex");
}

/**
 * Clears the event form.
 *
 * @name clearEventForm
 *
 * @returns {void} Clears the event form.
 */
function clearEventForm() {
  $(`#popover-schedule-event input[type='checkbox']`).attr("checked", false);
  $("#startTime").val("");
  $("#endTime").val("");
}

/** !SECTION */

/**
 * SECTION - CALENDAR FUNCTIONS
 */

/**
 * Renders the calendar with the current schedule events.
 *
 * @name renderCalendar
 *
 * @returns {Promise<void>} A promise that resolves when the calendar is rendered.
 */
async function renderCalendar() {
  var calendarElement = document.getElementById("calendar");
  var calendarOptions = {
    contentHeight: "75dvh",
    customButtons: {
      // Add new schedule event via top-right button
      addNewEvent: {
        text: "Add Event",
        click: function () {
          let eventObj = {
            isNewEvent: true,
          };
          openEventOverlay();
          determineFormFooterButtons(eventObj);
          hideTimeContainer(false);
        },
      },
      // refreshCal: {
      //   text: "Refresh",
      //   click: function () {
      //     renderCalendar();
      //     displayNotifications(
      //       "Successfully refreshed calendar!",
      //       "#390",
      //       "verified",
      //       2000
      //     );
      //   },
      // },
      navToCurrentDay: {
        text: "Today",
        click: function () {
          calendar.today();
        },
      },
      resetCalendar: {
        text: "Clear Calendar",
        click: function () {
          if (window.confirm("Confirm to clear the entire calendar...")) {
            resetTableGlobal("schedule-days");
            resetTableGlobal("schedule-events");
            renderCalendar();
          }
        },
      },
    },
    initialView: "timeGridWeek",
    nowIndicator: true,
    headerToolbar: {
      left: "timeGridWeek,timeGridDay prev,navToCurrentDay,next",
      center: "title",
      right: "addNewEvent,resetCalendar",
    },
    buttonText: {
      prev: "<",
      next: ">",
    },
    slotDuration: "00:15",
    navLinks: true, // can click day/week names to navigate views
    // editable: true, // can resize and drag events
    selectable: true,
    unselectAuto: false,
    selectMirror: true,
    dayMaxEvents: true, // allow "more" link when too many events
    events: await fetchScheduleEvents(),
    eventClick: function (info) {
      // open event update overlay when clicked
      openEventOverlay(info);
    },
    select: function (info) {
      // open new event overlay when clicked
      openEventOverlay(info);
    },
    selectAllow: function (info) {
      // Restricts selecting times to a single day
      let startDay = new Date(info.startStr).getDate();
      let endDay = new Date(info.endStr).getDate();

      // endDay - startDay restricts it to one day
      // !info.allDay allows to select times across days for all-day schedules
      let isDifferentDay = endDay - startDay != 0 && !info.allDay;
      return !isDifferentDay;
    },
  };

  calendar = new FullCalendar.Calendar(calendarElement, calendarOptions);
  calendar.render();
}

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
var calendar;

$(document).ready(async function () {
  // Renders calendar at start
  await renderCalendar();

  /** SECTION - EVENT LISTENERS */
  // If all day is clicked, hide/show time-container
  $("#all-day").on("click", function () {
    $("#new-time-container").slideToggle(function () {
      $("#startTime").prop("required", !$("#startTime").prop("required"));
      $("#endTime").prop("required", !$("#endTime").prop("required"));
    });
  });

  // Change schedule form header text according to additional sites checkbox
  $("#additionalSites").on("click", function () {
    insertScheduleFormHeader($(this).prop("checked"));
  });

  // Saves schedule event to database
  $("#save-schedule").on("click", async function (event) {
    // Disable default form submission event; prevents automatic page reload
    event.preventDefault();

    await insertNewEvent();
  });

  // Updates schedule event to database
  $("#update-schedule").on("click", async function (event) {
    // Disable default form submission event; prevents automatic page reload
    event.preventDefault();

    await updateScheduleEvent();
  });

  // Saves schedule event to database
  $("#cancel-schedule").on("click", function (event) {
    // Disable default form submission event; prevents automatic page reload
    event.preventDefault();

    // Closes popover
    closePopover();

    // Unselects any time from calendar
    calendar.unselect();
  });

  // Unselects any time from calendar when popup is closed via clicking outside popup
  $("#overlay").on("click", function () {
    calendar.unselect();
  });

  // Deletes existing schedule from database
  $("#delete-schedule").on("click", async function (event) {
    // Disable default form submission event; prevents automatic page reload
    event.preventDefault();

    if (window.confirm("Confirm to delete this schedule...")) {
      let isEventAllDay = $(this).attr("data-is-all-day");

      if (isEventAllDay === "true") {
        await resetScheduleDay();
      } else {
        await deleteScheduleEvent();
      }

      // Closes popover
      closePopover();

      // Rerenders calendar
      renderCalendar();
    }
  });

  /** !SECTION */
});

/** !SECTION */
