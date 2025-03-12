/**
 * @file settings-dashboard.js
 * @description Dashboard that shows user quick information regarding notable times, scheduling, and current watch modes
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
 * Calculate watch time comparisons and its properties and inserts it into DOM
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
        $("#db-current-watch-mode p.medium-text").html(data.name);
        $("#db-current-watch-mode p.small-text").html(data.desc);
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
 * @param {string} chartType - The type of chart to display; default is "line"
 *
 * @returns {Object} The created Chart.js chart instance.
 *
 * @example
 * const chart = createWatchTimeChart(filteredWatchTimes, "long-form-watch-time");
 *
 * @notes This function uses Chart.js to create the chart and assumes that the Chart.js library is already loaded.
 */
let chart;

function createWatchTimeChart(watchTimesObj, videoType, chartType = "line") {
  const ctx = document.getElementById("chart").getContext("2d");

  chart = new Chart(ctx, {
    type: chartType,
    data: {
      labels: watchTimesObj.map((day) => day.date),
      datasets: [
        {
          label: `Watch Times (Hours)`,
          data: watchTimesObj.map((day) => day[`${videoType}-hours`]),
          borderColor: "#1e1f1f",
          fill: true,
          tension: 0.25,
          backgroundColor: "#ac3232",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false,
          },
          title: {
            display: true,
            text: "Date",
            color: "#000",
            font: {
              size: 12,
              weight: "500",
            },
          },
          ticks: {
            color: "#000",
          },
        },
        y: {
          min: 0,
          title: {
            display: true,
            text: "Hour",
            color: "#000",
            font: {
              size: 12,
              weight: "500",
            },
          },
          ticks: {
            color: "#000",
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: { color: "#000" },
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
        let chartType =
          Object.keys(filteredWatchTimes).length == 1 ? "bar" : "line";

        // Gets total watch time from chosen video form watch times
        let totalWatchTime = getTotalWatchTime(
          filteredWatchTimes,
          `${videoType}`
        );
        $("#charts #total-watch-time").html(convertTimeToText(totalWatchTime));

        // Destroys existing chart to make room for new chart
        if (chart) {
          chart.destroy();
        }

        // Creates watch time chart using watch times associated with chosen video form
        chart = createWatchTimeChart(filteredWatchTimes, videoType, chartType);
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
 * Reformats 'yyyy-mm-dd' to 'mm.dd.yyyy, www'
 *
 * @name reformatDateToText
 *
 * @param {string} dateValue - the watch time date in format 'yyyy-mm-dd'
 *
 * @returns {string} the watch time date in format 'mm.dd.yyy, www' i.e. 6.24.2012, Sun
 *
 * @example
 * let newDateFormat = reformatDateToText("2024-11-06");
 */
function reformatDateToText(dateValue) {
  let date = new Date(dateValue);

  let dateObj = {
    day: date.getDate() + 1,
    month: date.getMonth() + 1,
    year: date.getFullYear(),

    // Gets 3-letter day of week text, removes comma from end
    dayOfWeek: date.toUTCString().split(" ").slice(0, 1)[0].replace(/,/g, ""),
  };

  return `${dateObj.month}.${dateObj.day}.${dateObj.year}, ${dateObj.dayOfWeek}`;
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

    // Function to rearrange the date format
    function formatToMMDDYYYY(dateStr) {
      let [month, day, year] = dateStr.split("/");
      return `${month}.${day}.${year}`;
    }

    // Convert firstDay and lastDay to mm.dd.yyyy format
    firstDay = formatToMMDDYYYY(firstDay);
    lastDay = formatToMMDDYYYY(lastDay);

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

      existingWeek["long-form-watch-time"] +=
        allWatchTimes[index]["long-form-watch-time"];
      existingWeek["short-form-watch-time"] +=
        allWatchTimes[index]["short-form-watch-time"];
    } else {
      // If the week doesn't exist, create a new entry
      weeklyItem.date = week;
      weeklyItem["total-watch-time"] = allWatchTimes[index]["total-watch-time"];
      weeklyItem["long-form-watch-time"] =
        allWatchTimes[index]["long-form-watch-time"];
      weeklyItem["short-form-watch-time"] =
        allWatchTimes[index]["short-form-watch-time"];
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
  // Gets all watch times to iterate through
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

      existingMonth["long-form-watch-time"] +=
        allWatchTimes[index]["long-form-watch-time"];
      existingMonth["short-form-watch-time"] +=
        allWatchTimes[index]["short-form-watch-time"];
    } else {
      // If the month doesn't exist, create a new entry
      monthlyItem.date = month;
      monthlyItem["total-watch-time"] =
        allWatchTimes[index]["total-watch-time"];
      monthlyItem["long-form-watch-time"] =
        allWatchTimes[index]["long-form-watch-time"];
      monthlyItem["short-form-watch-time"] =
        allWatchTimes[index]["short-form-watch-time"];

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
   *
   * @returns {void}
   */
  function appendWatchTimeItem(dateValue, watchTimeObj) {
    let watchTimeListElem = $("#watch-times-table");

    let totalTime = convertTimeToText(watchTimeObj["total-time"]);
    let longFormTime = convertTimeToText(watchTimeObj["long-form"]);
    let shortFormTime = convertTimeToText(watchTimeObj["short-form"]);

    let watchTimeItem = $(`<tr>
                            <td>${dateValue}</td>
                            <td>${totalTime}</td>
                            <td>${longFormTime}</td>
                            <td>${shortFormTime}</td>
                          </tr>`);

    watchTimeListElem.prepend(watchTimeItem);
  }

  /** Main Body */
  // Deletes any existing list to be replaced by upcoming list
  $("#watch-times-table tbody").html("");
  if (timeframe === "daily-times") {
    for (let index in watchTimes) {
      if (watchTimes[index]["total-watch-time"] != 0) {
        let dateValue = watchTimes[index]["date"];
        let watchTimeObj = {
          "total-time": watchTimes[index]["total-watch-time"],
          "long-form": watchTimes[index]["long-form-watch-time"],
          "short-form": watchTimes[index]["short-form-watch-time"],
        };

        // console.log(dateValue, reformatDateToText(dateValue));
        appendWatchTimeItem(reformatDateToText(dateValue), watchTimeObj);
      }
    }
  } else if (timeframe === "weekly-times") {
    for (let index in watchTimes) {
      let dateValue = watchTimes[index]["date"];
      let watchTimeObj = {
        "total-time": watchTimes[index]["total-watch-time"],
        "long-form": watchTimes[index]["long-form-watch-time"],
        "short-form": watchTimes[index]["short-form-watch-time"],
      };

      appendWatchTimeItem(dateValue, watchTimeObj);
    }
  } else if (timeframe === "monthly-times") {
    for (let index in watchTimes) {
      let dateValue = watchTimes[index]["date"];
      let watchTimeObj = {
        "total-time": watchTimes[index]["total-watch-time"],
        "long-form": watchTimes[index]["long-form-watch-time"],
        "short-form": watchTimes[index]["short-form-watch-time"],
      };

      appendWatchTimeItem(dateValue, watchTimeObj);
    }
  }
}

/**
 * Gets and displays the relevant notable times for the "notable times" widget
 *
 * @name insertNotableTimes
 * @async
 *
 * @returns {void}
 *
 * @example insertNotableTimes();
 *
 * @notes
 * getCurrentWatchTimes() is imported from global-functions.js
 */
async function insertNotableTimes() {
  /**
   * Sorts the notable times by ascending order
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
   * Calculates average watch time
   *
   * @name getAvgWatchTime
   *
   * @returns {Object} Watch time object
   */
  async function getAvgWatchTime() {
    try {
      // returns [int totalWatchTime, int amtOfDays]
      const data = await getAllWatchTimes();

      const amtOfDays = Object.values(data).length;
      let totalWatchTime = 0;

      // Calculates sum of all watch times and divides by length (amt of days)
      for (let watchTimeObj in data) {
        totalWatchTime += data[watchTimeObj]["total-watch-time"];
      }

      const avgTime = totalWatchTime / amtOfDays;

      return {
        avgTime: Math.floor(avgTime),
        amtOfDays: amtOfDays,
        totalWatchTime: totalWatchTime,
      };
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
    // Gets least watched day and inserts the date and time into "Least Watched Day" column
    const avgWatchTime = await getAvgWatchTime();
    if (avgWatchTime) {
      const avgTime = avgWatchTime["avgTime"];
      const amtOfDays = avgWatchTime["amtOfDays"];

      $(`#average-watch-time #watch-time`).html(convertTimeToText(avgTime));

      // Inserts total days into .date tag
      $(`#average-watch-time #date`).html(
        `out of <span class="counter-animation" data-num="${amtOfDays}"></span> days`
      );
    }

    // Gets most watched day and inserts the date and time into "Most Watched Day" column
    const mostWatchedObj = await getMostWatchedDay();
    if (mostWatchedObj) {
      const mostDayTime = mostWatchedObj["total-watch-time"];
      $(`#most-watch-day #watch-time`).html(convertTimeToText(mostDayTime));

      // Reformats 'yyyy-mm-dd' to 'mmm dd yyyy, www'
      const mostDayNewDate = reformatDateToText(mostWatchedObj["date"]);
      $(`#most-watch-day #date`).html(mostDayNewDate);
    }
  } catch (error) {
    console.error(error);
  }
}

// Gets all watch times to iterate through
async function getTableTotalWatchTimes(videoType) {
  let allWatchTimes = await getAllWatchTimes();

  let totalWatchTime = getTotalWatchTime(
    allWatchTimes,
    `${videoType}-watch-time`
  );

  $(`#watch-times-table tfoot #${videoType}`).html(
    convertTimeToText(totalWatchTime)
  );
}

/** !SECTION */

/** SECTION - ACTIVE SPOILER GROUPS */
/**
 * Retrieves all active spoiler groups from database
 *
 * @name getActiveSpoilerGroups
 *
 * @returns {object} - an object of group objects obtained from database
 */
async function getActiveSpoilerGroups() {
  const allActiveGroups = await getActiveSettings("spoiler-groups", ["active"]);

  return allActiveGroups;
}
/**
 * Inserts all active spoiler groups into a dashboard top widget
 *
 * @name insertSpoilerGroupNames
 *
 * @param {object} activeGroups - an object of group objects obtained from database
 *
 * @returns {void}
 */
function insertSpoilerGroupNames(activeGroups) {
  const container = $("#spoiler-groups-top-widget").find(".content div");

  activeGroups.forEach((group, i) => {
    // Create div element
    const groupNameItem = document.createElement("div");
    groupNameItem.className = "group-item slide-item";
    groupNameItem.style.background = group.color;
    groupNameItem.style.animationDelay = `0.${15 * i}s`;

    // Create p element
    const groupName = document.createElement("p");
    groupName.textContent = group.name;

    // Append p element to div
    groupNameItem.appendChild(groupName);

    // Append div to container
    container.append(groupNameItem);
  });
}

/** !SECTION */

/** SECTION - REDIRECTED POPOVER */
/**
 * Gets value of redirected parameter from dashboard url
 *
 * @name isUserRedirected
 *
 * @returns {boolean} whether parameter 'redirected' is present (true or null)
 */
function isUserRedirected() {
  // Checks if the user was redirected from blocked site
  const currentUrl = window.location.href;
  const url = new URL(currentUrl);

  const isRedirected = url.searchParams.get("redirected");

  return isRedirected;
}

/**
 * Chooses one out of 11 GIFs and return path and corresponding alt text
 *
 * @name isUserRedirected
 *
 * @returns {boolean} whether parameter 'redirected' is present (true or null)
 */
function chooseRandomGif() {
  const rand = Math.floor(Math.random() * 12);
  let altTexts = [
    "A toddler slips and smacks her face into her birthday cake",
    "A skater does trick off top of staircase to fail the landing",
    "A man on a mini-gold course hitting a ball off a wooden wall that returns to hit him in the face",
    "An orange and black-spotted cat clawing at a sock-covered foot and aggressively shaking head",
    "A toddler in a robot costume falling backwards",
    "First penguin of four in a row shaking its head aggressively",
    "A woman belly flopping into a very clean, blue lake",
    "An orange cat attempting to jump from a snow-covered car to then slip and fall down hood",
    "A toddler riding a toy motorcycle into his backyard fence",
    "A Lakers player prematurely celebrating while he missing his basketball shot",
    "A soldier on his knees screaming 'NO' to the heavens",
    "A helldiver from HellDivers 2 is melted by Bile Spewer creature",
  ];

  const gifObj = {
    src: `/images/blocked-page-gifs/bg-gif-${rand}.gif`,
    alt: altTexts[rand],
  };

  return gifObj;
}

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(async function () {
  // Gets active groups and inserts them into top widget
  const activeGroups = await getActiveSpoilerGroups();
  insertSpoilerGroupNames(activeGroups);

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

  /** EVENT LISTENER: update watch time chart through selecting a new timeframe */
  $("#chart-timeframe").on("change", async function () {
    prepareWatchTimeChart();
  });

  /** EVENT LISTENER: Ensures the border colors are default grey (in case of previous invalid dates) */
  $(".timeframe-inputs input").on("click", async function () {
    $(this).css("border-color", "#1e1f1f4f");
  });

  /** EVENT LISTENER: calculates and displays corresponding watch time timeframes  */
  $("#list-timeframe").on("change", async function () {
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

  // Gets total watch times for all three properties and inserts them into table footer
  await getTableTotalWatchTimes("total");
  await getTableTotalWatchTimes("long-form");
  await getTableTotalWatchTimes("short-form");

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
  prepareWatchTimeChart();

  // Populates watch time list by default (daily)
  let dailyWatchTimes = await getAllWatchTimes();
  insertFilteredWatchTimes(dailyWatchTimes, "daily-times");

  // Gets and displays the notable times for the "notable times" widget
  insertNotableTimes();

  // Gets and displays the current watch mode in the corresponding widget
  insertCurrentWatchMode();

  // Creates the circular bar for the relative percentage of short form video watch time
  const shortFormBar = createProgressBar(
    "#progress-short-form",
    "#98C1D9",
    "#98C1D9",
    "2rem"
  );

  // Creates the circular bar for the relative percentage of long form video watch time
  const longFormBar = createProgressBar(
    "#progress-long-form",
    "#3D5A80",
    "#3D5A80",
    "2rem"
  );

  // Animate longFormBar and shortFormBar to a specific percentage
  getWatchTypeComparisons().then((percentages) => {
    shortFormBar.animate(percentages["short-form-percentage"]);
    longFormBar.animate(percentages["long-form-percentage"]);
  });

  // Checks if the user was redirected from blocked site
  if (isUserRedirected()) {
    const gifObj = chooseRandomGif();
    $("#random-popover-gif").attr("src", gifObj["src"]);
    $("#random-popover-gif").attr("alt", gifObj["alt"]);

    document.querySelector("#popover-restricted-details").showPopover();
  }
});

/** !SECTION */
// Resize the chart when the window is resized
window.addEventListener("resize", () => {
  if (chart) {
    chart.resize();
  }
});
