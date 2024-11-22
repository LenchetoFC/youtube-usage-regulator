/**
 * @file settings-dashboard.js
 * @description Dashboard that shows user quick information regarding watch times, scheduling, and current watch modes
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @requires module:global-functions
 * @see {@link module:global-functions.selectAllRecordsGlobal}
 * @see {@link module:global-functions.resetTableGlobal}
 * @see {@link module:global-functions.displayNotifications}
 * @see {@link module:global-functions.getCurrentWatchMode}
 * @see {@link module:global-functions.convertTimeToText} x 7
 * @see {@link module:global-functions.getCurrentWatchTimes} x 2
 * @see {@link module:global-functions.getTotalWatchTime} x 5
 */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

/**
 * TODO: convert error messages to be same as settings-schedules.js
 */

/**
 * Get active watch mode and its properties and inserts it into DOM
 *
 * @name getWatchTypeComparisons
 * @async
 *
 * @returns {Object} an object that holds the percentages of watch types
 *
 * @example getWatchTypeComparisons();
 */
async function getWatchTypeComparisons() {
  try {
    let totalLongFormTime = 0;
    let totalShortFormTime = 0;

    let allWatchTimes = await getAllWatchTimes();

    // Gets all long form and short form times
    for (let index in allWatchTimes) {
      totalLongFormTime += allWatchTimes[index]["long-form-watch-time"];
      totalShortFormTime += allWatchTimes[index]["short-form-watch-time"];
    }

    // Calculates percentages and fixes them to 2 decimal places
    let totalTime = totalLongFormTime + totalShortFormTime;
    let longFormPercentage = 0;
    let shortFormPercentage = 0;

    // Prevents typeError: cannot read props of null
    if (totalTime != 0) {
      longFormPercentage = (totalLongFormTime / totalTime).toFixed(2);
      shortFormPercentage = (totalShortFormTime / totalTime).toFixed(2);
    }

    // Create object to be returned
    let watchTypeComparisons = {
      "long-form-percentage": longFormPercentage,
      "short-form-percentage": shortFormPercentage,
    };

    return watchTypeComparisons;
  } catch (error) {
    console.error(error);
  }
}

/**
 * Get active watch mode and its properties and inserts it into DOM
 *
 * @name insertCurrentWatchMode
 * @async
 *
 * @returns {void}
 *
 * @example insertCurrentWatchMode();
 */
async function insertCurrentWatchMode() {
  try {
    getCurrentWatchMode()
      .then((data) => {
        $("#db-current-watch-mode h1").html(data.name);
        $("#db-current-watch-mode p").html(data.desc);
        $("#db-current-watch-mode").css("background-color", data.color);
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
 * Create circular bar for the percentage of watched long-form and short-form videos
 *
 * @name createProgressBar
 *
 * @param {string} selector - the selector tag id to connect the bar with
 * @param {string} fromColor - the start color of the bar while it's animating to its set percentage
 * @param {string} toColor - the end color of the bar after the percentage has reached its set number
 * @param {string} fontSize - the size of the font inside of the progress bar
 *
 * @returns {Object} Progress bar object to be animated
 *
 * @example
 * const longFormBar = createProgressBar("#progress-long-form", "#d92121", "#d92121", "2rem");
 *
 * @notes progressbar.js@1.0.0 version is used
 * @notes Docs: http://progressbarjs.readthedocs.org/en/1.0.0/
 */
function createProgressBar(selector, fromColor, toColor, fontSize) {
  const element = document.querySelector(selector);

  const bar = new ProgressBar.Circle(element, {
    strokeWidth: 6,
    trailWidth: 3,
    easing: "easeInOut",
    duration: 1400,
    text: {
      autoStyleContainer: false,
    },
    from: { color: fromColor, width: 4 },
    to: { color: toColor, width: 6 },
    step: function (state, circle) {
      circle.path.setAttribute("stroke", state.color);
      circle.path.setAttribute("stroke-width", state.width);

      var value = Math.round(circle.value() * 100);
      if (value === 0) {
        circle.setText("");
      } else {
        circle.setText(`${value}%`);
      }
    },
  });

  bar.text.style.fontSize = fontSize;
  return bar;
}

/**
 * Calculate total watch time for a specific video type
 *
 * @name getTotalWatchTime
 *
 * @param {Array} watchTimes - Array of watch time objects.
 * @param {string} videoType - The type of video watch time to calculate ('long-form-watch-time', 'short-form-watch-time', 'total-watch-time').
 *
 * @returns {number} The total watch time for the specified video type.
 *
 * @example
 * let totalWatchTime = getTotalWatchTime(watchTimes, "long-form-watch-time");
 */
function getTotalWatchTime(watchTimes, videoType) {
  let totalTime = 0;

  for (let index in watchTimes) {
    totalTime += watchTimes[index][videoType];
  }

  return totalTime;
}

/**
 * Convert seconds to hours
 *
 * @name convertSecondsToHours
 *
 * @param {int} seconds - The time in seconds.
 *
 * @returns {float|int} The time in hours, formatted to 2 decimal places if necessary.
 *
 * @example
 * let hours = convertSecondsToHours(3600); // returns 1
 */
function convertSecondsToHours(seconds) {
  const hours = seconds / 3600;
  const formattedHours = parseFloat(hours.toFixed(2));
  return formattedHours % 1 === 0 ? Math.floor(formattedHours) : formattedHours;
}

/**
 * Prepare watch times for chart
 *
 * This function retrieves all watch times, filters them within the specified timeframe, and returns the filtered watch times.
 *
 * @name prepareWatchTimesForChart
 * @async
 *
 * @param {string} startDate - The start date in the format 'yyyy-mm-dd'.
 * @param {string} endDate - The end date in the format 'yyyy-mm-dd'.
 * @param {string} videoType - The type of video watch time to filter ('long-form-watch-time', 'short-form-watch-time', 'total-watch-time').
 *
 * @returns {Array} The filtered watch times within the specified timeframe.
 *
 * @example
 * let filteredWatchTimes = await prepareWatchTimesForChart("2024-11-04", "2024-11-06", "long-form-watch-time");
 */
async function prepareWatchTimesForChart(startDate, endDate, videoType) {
  // Get all watch times
  let allWatchTimes = await getAllWatchTimes();

  // Get the watch times within the set timeframe
  let filteredWatchTimes = filterWatchTimeFrame(
    allWatchTimes,
    startDate,
    endDate,
    videoType
  );

  return filteredWatchTimes;
}

/**
 * Filter watch times within the specified timeframe and keep only the chosen videoType
 *
 * @name filterWatchTimeFrame
 *
 * @param {Array} allWatchTimes - array of watch time objects
 * @param {string} startDate - start date in the format 'yyyy-mm-dd'
 * @param {string} endDate - end date in the format 'yyyy-mm-dd'
 * @param {string} videoType - the type of video watch time to keep ('long-form-watch-time', 'short-form-watch-time', 'total-watch-time')
 *
 * @returns {Array} array of watch time objects within the specified timeframe and with only the chosen videoType
 *
 * @example
 * let filteredWatchTimes = filterWatchTimeFrame(allWatchTimes, "2024-11-04", "2024-11-06", "long-form-watch-time");
 */
function filterWatchTimeFrame(allWatchTimes, startDate, endDate, videoType) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return allWatchTimes
    .filter((watchTime) => {
      const watchDate = new Date(watchTime.date);
      return watchDate >= start && watchDate <= end;
    })
    .map((watchTime) => {
      return {
        date: watchTime.date,
        [videoType]: watchTime[videoType],
        [`${videoType}-hours`]: convertSecondsToHours(watchTime[videoType]),
      };
    });
}

/**
 * Create watch time chart
 *
 * This function creates and returns a Chart.js line chart that displays watch times based on the provided data.
 * It uses the provided watch times object and video type to generate the chart data and configuration.
 *
 * @name createWatchTimeChart
 *
 * @param {Array} watchTimesObj - Array of watch time objects, each containing a date and watch time in hours.
 * @param {string} videoType - The type of video watch time to display ('long-form-watch-time', 'short-form-watch-time', 'total-watch-time').
 *
 * @returns {Object} The created Chart.js chart instance.
 *
 * @example
 * const chart = createWatchTimeChart(filteredWatchTimes, "long-form-watch-time");
 *
 * @notes This function uses Chart.js to create the chart and assumes that the Chart.js library is already loaded.
 */
function createWatchTimeChart(watchTimesObj, videoType) {
  chart = new Chart("chart", {
    type: "line",
    data: {
      labels: watchTimesObj.map((day) => day.date),
      datasets: [
        {
          label: `Watch Times (Hours)`,
          data: watchTimesObj.map((day) => day[`${videoType}-hours`]),
          borderColor: "#1e1f1f",
          fill: true,
        },
      ],
    },
    options: {
      scales: {
        x: {
          grid: {
            display: false,
          },
          title: {
            display: true,
            text: "Date",
            color: "#1e1f1f",
            font: {
              size: 12,
              weight: "500",
            },
          },
        },
        y: {
          min: 0,
          title: {
            display: true,
            text: "Hour",
            color: "#1e1f1f",
            font: {
              size: 12,
              weight: "500",
            },
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: { color: "#1e1f1f" },
        },
      },
    },
  });

  return chart;
}

/**
 * Validates the chosen date range
 *
 * @name validateChartTimeFrame
 *
 * @param {string} startDate - The start date in the format 'yyyy-mm-dd'
 * @param {string} endDate - The end date in the format 'yyyy-mm-dd'
 *
 * @returns {boolean} Returns true if the start date is before or equal to the end date, false otherwise
 *
 * @example
 * validateChartTimeFrame($("#timeframe-start").val(), $("#timeframe-end").val())
 */
function validateChartTimeFrame(startDate, endDate) {
  return new Date(startDate) <= new Date(endDate);
}

/**
 * Prepare watch time chart
 *
 * This function prepares and displays a watch time chart based on the selected date range and video type.
 * It validates the chosen dates, retrieves the filtered watch times, calculates the total watch time,
 * and creates a new chart with the filtered data.
 *
 * @name prepareWatchTimeChart
 * @async
 *
 * @returns {void}
 *
 * @example prepareWatchTimeChart();
 *
 * @notes This function is triggered by an event listener when the user selects a date range or video type.
 *        It uses jQuery to manipulate the DOM elements and Chart.js to create the chart.
 */
async function prepareWatchTimeChart() {
  /** Main Body */
  let startDate = $("#timeframe-start");
  let endDate = $("#timeframe-end");
  let videoType = $("#chart-timeframe").val();

  if (validateChartTimeFrame(startDate.val(), endDate.val())) {
    prepareWatchTimesForChart(startDate.val(), endDate.val(), videoType).then(
      (filteredWatchTimes) => {
        // Gets total watch time from chosen video form watch times
        let totalWatchTime = getTotalWatchTime(
          filteredWatchTimes,
          `${videoType}`
        );
        $("#total-watch-time").html(convertTimeToText(totalWatchTime));

        // Destroys existing chart to make room for new chart
        if (chart) {
          chart.destroy();
        }

        // Creates watch time chart using watch times associated with chosen video form
        chart = createWatchTimeChart(filteredWatchTimes, videoType);
      }
    );
  } else {
    displayNotifications(
      "Invalid Timeframe. Try Again Later.",
      "#d92121",
      "release_alert",
      5000
    );
    startDate.css("border-color", "var(--surface-brand)");
    endDate.css("border-color", "var(--surface-brand)");
  }
}

/**
 * Reformats 'yyyy-mm-dd' to 'mmm dd yyyy, www'
 *
 * @name reformatDateToText
 *
 * @param {string} dateValue - the watch time date in format 'yyyy-mm-dd'
 *
 * @returns {string} the watch time date in format 'mmm dd yyyy, www'
 *
 * @example
 * let newDateFormat = reformatDateToText("2024-11-06");
 */
function reformatDateToText(dateValue) {
  let date = new Date(dateValue + "T00:00:00Z"); // Ensure the date is interpreted as UTC
  let dateSplit = date.toUTCString().split(" ").slice(0, 4);
  return ` ${dateSplit[0]} ${dateSplit[2]} ${dateSplit[1]} ${dateSplit[3]}`;
}

/**
 * Gets all watch times from chrome local storage
 *
 * @name getAllWatchTimes
 * @async
 *
 * @returns {Array} array of watch time objects
 *
 * @example
 * let allWatchTimes = getAllWatchTimes();
 */
async function getAllWatchTimes() {
  let allWatchTimes = await selectAllRecordsGlobal("watch-times");

  return allWatchTimes;
}

/**
 * Calculates all watch times combined by week
 *
 * @name getWeeklyWatchTimes
 * @async
 *
 * @returns {Array} array of watch time objects combined by week
 *
 * @example
 * let weeklyWatchTimes = await getWeeklyWatchTimes();
 */
async function getWeeklyWatchTimes() {
  /**
   * Determines which week the current watch time is in
   *
   * @name determineWeek
   *
   * @param {string} date - watch time date in the format of "yyyy-mm-dd"
   *
   * @returns {string} the week in the format of "mm/dd/yyyy - mm/dd/yyyy"
   */
  function determineWeek(date) {
    const [year, month, day] = date.split("-");
    let curr = new Date(`${month}-${day}-${year}`);
    let first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    let last = first + 6; // last day is the first day + 6

    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    let firstDay = new Date(curr.setDate(first)).toLocaleDateString(
      "en-US",
      options
    );
    let lastDay = new Date(curr.setDate(last)).toLocaleDateString(
      "en-US",
      options
    );

    return `${firstDay} - ${lastDay}`;
  }

  /** Main Body */
  // Gets all watch times unfiltered and unsorted
  let allWatchTimes = await getAllWatchTimes();

  let weeklyWatchTimes = [];

  // Combines watch times by week
  for (let index in allWatchTimes) {
    const weeklyItem = {};
    let week = determineWeek(allWatchTimes[index].date);

    // Find the existing week entry
    let existingWeek = weeklyWatchTimes.find((item) => item.date === week);

    if (existingWeek) {
      // If the week exists, add the current watch time to the existing total
      existingWeek["total-watch-time"] +=
        allWatchTimes[index]["total-watch-time"];
    } else {
      // If the week doesn't exist, create a new entry
      weeklyItem.date = week;
      weeklyItem["total-watch-time"] = allWatchTimes[index]["total-watch-time"];
      weeklyWatchTimes.push(weeklyItem);
    }
  }

  return weeklyWatchTimes;
}

/**
 * Calculates all watch times combined by month
 *
 * @name getMonthlyWatchTimes
 * @async
 *
 * @returns {Array} array of watch time objects combined by month
 *
 * @example
 * let monthlyWatchTimes = await getMonthlyWatchTimes();
 */
async function getMonthlyWatchTimes() {
  /**
   * Determines which month the current watch time is in
   *
   * @name determineMonth
   *
   * @param {string} date - watch time date in the format of "yyyy-mm-dd"
   *
   * @returns {string} Capitalized month name
   */
  function determineMonth(date) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const [year, month, day] = date.split("-");
    let curr = new Date(`${month}-${day}-${year}`);
    let currMonth = months[curr.getMonth()];

    let currMonthCap = `${currMonth.charAt(0).toUpperCase()}${currMonth.slice(
      1
    )}`;

    return currMonthCap;
  }

  /** Main Body */
  // Gets all watch times to interate through
  let allWatchTimes = await getAllWatchTimes();

  let monthlyWatchTimes = [];

  // Combines watch times by month
  for (let index in allWatchTimes) {
    const monthlyItem = {};
    let month = determineMonth(allWatchTimes[index].date);

    // Find the existing month entry
    let existingMonth = monthlyWatchTimes.find((item) => item.date === month);

    if (existingMonth) {
      // If the month exists, add the current watch time to the existing total
      existingMonth["total-watch-time"] +=
        allWatchTimes[index]["total-watch-time"];
    } else {
      // If the month doesn't exist, create a new entry
      monthlyItem.date = month;
      monthlyItem["total-watch-time"] =
        allWatchTimes[index]["total-watch-time"];
      monthlyWatchTimes.push(monthlyItem);
    }
  }

  return monthlyWatchTimes;
}

/**
 * Inserts watch time list items depending on timeframe chosen
 *
 * @name insertFilteredWatchTimes
 * @async
 *
 * @param {Object} watchTimes - holds the watch time object that has the date and total amount of watch time in seconds
 * @param {string} timeframe - determines how the watch time list item is prepared for HTML insertion
 *
 * @returns {void}
 *
 * @notes
 * convertTimeToText() is imported from global-functions.js
 */
async function insertFilteredWatchTimes(watchTimes, timeframe) {
  /**
   * Appends watch time line into watch time list
   *
   * @name appendWatchTimeItem
   *
   * @param {Object} dateValue - holds the watch time date; could be three different formats depending on the timeframe
   * @param {int} watchTimeSeconds - the watch time in seconds that will be converted to text
   * @param {boolean} isLastItem - determines if a horizontal line is appended after an item
   *
   * @returns {void}
   */
  function appendWatchTimeItem(dateValue, watchTimeSeconds, isLastItem) {
    let watchTimeListElem = $("#watch-times-list > ul");

    let newTimeForamt = convertTimeToText(watchTimeSeconds, true);
    let watchTimeItem = $(`<li>
                            <p>${dateValue}</p>
                            <p>${newTimeForamt}</p>
                          </li>`);

    watchTimeListElem.append(watchTimeItem);

    // Appends a horizontal line after every watch time except the final time
    if (!isLastItem) {
      watchTimeListElem.append("<hr class='horizontal-line'>");
    }
  }

  /** Main Body */
  if (timeframe === "daily-times") {
    for (let index in watchTimes) {
      if (watchTimes[index]["total-watch-time"] != 0) {
        let dateValue = watchTimes[index]["date"];
        let watchTimeSeconds = watchTimes[index]["total-watch-time"];
        let isLastItem = index == watchTimes.length - 1;
        appendWatchTimeItem(
          reformatDateToText(dateValue),
          watchTimeSeconds,
          isLastItem
        );
      }
    }
  } else if (timeframe === "weekly-times") {
    for (let index in watchTimes) {
      let dateValue = watchTimes[index]["date"];
      let watchTimeSeconds = watchTimes[index]["total-watch-time"];
      let isLastItem = index == watchTimes.length - 1;
      appendWatchTimeItem(dateValue, watchTimeSeconds, isLastItem);
    }
  } else if (timeframe === "monthly-times") {
    for (let index in watchTimes) {
      let dateValue = watchTimes[index]["date"];
      let watchTimeSeconds = watchTimes[index]["total-watch-time"];
      let isLastItem = index == watchTimes.length - 1;
      appendWatchTimeItem(dateValue, watchTimeSeconds, isLastItem);
    }
  }
}

/**
 * Gets and displays the relevant watch times for the "Notable Days" widget
 *
 * @name insertNotableWatchDays
 * @async
 *
 * @returns {void}
 *
 * @example insertNotableWatchDays();
 *
 * @notes
 * getCurrentWatchTimes() is imported from global-functions.js
 */
async function insertNotableWatchDays() {
  /**
   * Sorts the watch times by ascending order
   *
   * @name sortWatchTimesAsc
   *
   * @returns {Array} An array of watch time objects
   */
  async function sortWatchTimesAsc() {
    let allWatchTimes = await getAllWatchTimes();

    return allWatchTimes.sort(
      (a, b) => a["total-watch-time"] - b["total-watch-time"]
    );
  }

  /**
   * Gets the day with the least amount of watch time
   *
   * @name getLeastWatchedDay
   *
   * @returns {Object} Watch time object
   */
  async function getLeastWatchedDay() {
    try {
      const data = await sortWatchTimesAsc();

      // Returns first element (least amount of watch time)
      if (data[0]["total-watch-time"] != 0) {
        return data[0];
      } else if (data[1]) {
        return data[1];
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Gets the day with the most amount of watch time
   *
   * @name getMostWatchedDay
   *
   * @returns {Object} Watch time object
   */
  async function getMostWatchedDay() {
    try {
      const data = await sortWatchTimesAsc();

      // Returns last element (most amount of watch time)
      return data.pop();
    } catch (error) {
      console.error(error);
    }
  }

  /** Main Body */
  try {
    // Gets total watch time for the current day and inserts the date and time into "Today" column
    // FIXME: doesn't get time or display it correctly
    const currentWatchTimes = await getCurrentWatchTimes();
    if (currentWatchTimes.length != 0) {
      let todayTime = currentWatchTimes[0]["total-watch-time"];
      $(`#today-watch-time #watch-time`).html(convertTimeToText(todayTime));
      // Reformats 'yyyy-mm-dd' to 'mmm dd yyyy, www'
      let newDateFormat = reformatDateToText(currentWatchTimes[0]["date"]);
      $(`#today-day #date`).html(newDateFormat);
    }

    // Gets least watched day and inserts the date and time into "Least Watched Day" column
    const leastWatchedObj = await getLeastWatchedDay();
    if (leastWatchedObj) {
      let leastDayTime = leastWatchedObj["total-watch-time"];
      $(`#least-watch-day #watch-time`).html(
        convertTimeToText(leastDayTime, true)
      );

      // Reformats 'yyyy-mm-dd' to 'mmm dd yyyy, www'
      let leastDayNewDate = reformatDateToText(leastWatchedObj["date"]);
      $(`#least-watch-day #date`).html(leastDayNewDate);
    }

    // Gets most watched day and inserts the date and time into "Most Watched Day" column
    const mostWatchedObj = await getMostWatchedDay();
    if (mostWatchedObj) {
      let mostDayTime = mostWatchedObj["total-watch-time"];
      $(`#most-watch-day #watch-time`).html(
        convertTimeToText(mostDayTime, true)
      );

      // Reformats 'yyyy-mm-dd' to 'mmm dd yyyy, www'
      let mostDayNewDate = reformatDateToText(mostWatchedObj["date"]);
      $(`#most-watch-day #date`).html(mostDayNewDate);
    }
  } catch (error) {
    console.error(error);
  }
}

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(async function () {
  /**
   * Formats date for input date element
   *
   * @name formatDate
   *
   * @param {Date} date - The date object to format
   *
   * @returns {string} The formatted date in 'yyyy-mm-dd' format
   */
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Set the value of the date inputs
  const currentDate = new Date();
  const weekBeforeDate = new Date();
  weekBeforeDate.setDate(currentDate.getDate() - 7);

  // Sets timeframe dates to a week ago to current date by default
  $("#timeframe-start").val(formatDate(weekBeforeDate));
  $("#timeframe-end").val(formatDate(currentDate));

  /** EVENT LISTENER: Creates watch time chart with the chosen timeframe */
  $(".timeframe-inputs button").on("click", async function () {
    prepareWatchTimeChart();
  });

  /** EVENT LISTENER: Ensures the border colors are default grey (in case of previous invalid dates) */
  $(".timeframe-inputs input").on("click", async function () {
    $(this).css("border-color", "#1e1f1f4f");
  });

  /** EVENT LISTENER: calculates and displays corresponding watch time timeframes  */
  $("#list-timeframe").on("change", async function () {
    // Deletes any existing list to be replaced by upcoming list
    $("#watch-times-list > ul").html("");

    // Timeframe value for determining which times to display
    let timeframeValue = $(this).val();

    // Choose the corresponding filter function according to selected value
    if (timeframeValue === "daily-times") {
      let dailyWatchTimes = await getAllWatchTimes();

      insertFilteredWatchTimes(dailyWatchTimes, "daily-times");
    } else if (timeframeValue === "weekly-times") {
      let weeklyWatchTimes = await getWeeklyWatchTimes();

      insertFilteredWatchTimes(weeklyWatchTimes, "weekly-times");
    } else if (timeframeValue === "monthly-times") {
      let monthlyWatchTimes = await getMonthlyWatchTimes();

      insertFilteredWatchTimes(monthlyWatchTimes, "monthly-times");
    }
  });

  /** EVENT LISTENER: Alerts users that resetting is irreversible and then resets watch times */
  $("#reset-all-watch-times").on("click", function () {
    if (
      confirm(
        "THIS IS A PERMANENT ACTION! Confirm to erase ALL your watch time."
      )
    ) {
      resetTableGlobal("watch-times");

      // Reloads window
      location.reload();
    }
  });

  // Create Watch Time Chart by default (both forms of videos)
  prepareWatchTimesForChart(
    weekBeforeDate,
    currentDate,
    "total-watch-time"
  ).then((filteredWatchTimes) => {
    // Creates chart with both forms on load
    let videoType = "total-watch-time";
    let chart = createWatchTimeChart(filteredWatchTimes, videoType);

    // Inserts the watch time of both forms on load
    let totalWatchTime = getTotalWatchTime(filteredWatchTimes, videoType);
    $("#total-watch-time").html(convertTimeToText(totalWatchTime));
  });

  // Populates watch time list by default (daily)
  let dailyWatchTimes = await getAllWatchTimes();
  insertFilteredWatchTimes(dailyWatchTimes, "daily-times");

  // Gets and displays the relevant watch times for the "Notable Days" widget
  insertNotableWatchDays();

  // Gets and displays the current watch mode in the corresponding widget
  insertCurrentWatchMode();

  // Creates the circular bar for the relative percentage of short form video watch time
  const shortFormBar = createProgressBar(
    "#progress-short-form",
    "#47935b",
    "#47935b",
    "2rem"
  );

  // Creates the circular bar for the relative percentage of long form video watch time
  const longFormBar = createProgressBar(
    "#progress-long-form",
    "#d92121",
    "#d92121",
    "2rem"
  );

  // Animate longFormBar and shortFormBar to a specific percentage
  getWatchTypeComparisons().then((percentages) => {
    shortFormBar.animate(percentages["short-form-percentage"]);
    longFormBar.animate(percentages["long-form-percentage"]);
  });
});

/** !SECTION */
