/** INFORMATION
 * @LenchetoFC
 * @description Dashboard that shows user quick information regarding watch times, scheduling, and current watch modes
 *
 */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

/** ASYNC FUNCTION: Get active watch mode and its properties and inserts it into DOM
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
    let longFormPercentage = (totalLongFormTime / totalTime).toFixed(2);
    let shortFormPercentage = (totalShortFormTime / totalTime).toFixed(2);

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

/** SECTION - FUNCTION DECLARATIONS */

/** ASYNC FUNCTION: Get active watch mode and its properties and inserts it into DOM
 *
 * @returns {null}
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

/** !SECTION */

/** FUNCTION: Create circular bar for the percentage of watched long-form and short-form videos
 *
 * @param {string} selector - the selector tag id to connect the bar with
 * @param {string} fromColor - the start color of the bar while it's animating to its set percentage
 * @param {string} toColor - the end color of the bar after the percentage has reached its set number
 * @param {string} fontSize - the size of the font inside of the progress bar
 *
 * @returns {Object} Progress bar object to be animated
 *
 * @example const longFormBar = createProgressBar("#progress-long-form", "#d92121", "#d92121", "2rem");
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

/** TODO: FUNCTION: Determine if the chosen dates are valid as in the start date is before the end date
 *
 * @param {null} null - null
 *
 * @returns {null} Progress bar object to be animated
 *
 * @example const isValidated = validChartTimeFrame();
 *
 */
function validChartTimeFrame(startDate, endDate) {
  return new Date(startDate) < new Date(endDate);
}

/** FUNCTION: Reformats 'yyyy-mm-dd' to 'mmm dd yyyy, www'
 *
 * @param {string} dateValue - the watch time date in format 'yyyy-mm-dd'
 *
 * @returns {string} the watch time date in format 'mmm dd yyyy, www'
 *
 * @example let newDateFormat = reformatDateToText(currentWatchTimes[0]["date"]);
 *
 */
function reformatDateToText(dateValue) {
  let date = new Date(dateValue);
  let dateSplit = date.toString().split(" ").slice(0, 4);
  return `${dateSplit[1]} ${dateSplit[2]} ${dateSplit[3]}, ${dateSplit[0]}`;
}

/** ASYNC FUNCTION: Gets all watch times from chrome local storage
 *
 * @returns {array} array of watch time objects
 *
 * @example let allWatchTimes = getAllWatchTimes();
 *
 */
async function getAllWatchTimes() {
  let allRecords = await sendMessageToServiceWorker({
    operation: "selectAll",
    table: "watch-times",
  });

  return allRecords;
}

/** ASYNC FUNCTION: Calculates all watch times combined by week
 *
 * @returns {array} array of watch time objects combined by week
 *
 * @example let weeklyWatchTimes = await getWeeklyWatchTimes();
 *
 */
async function getWeeklyWatchTimes() {
  /** ENCAPSULATED FUNCTION: Determines which week the current watch time is in
   *
   * @param {string} date - watch time date in the format of "yyyy-mm-dd"
   *
   * @returns {string} the week in the format of "mm/dd/yyyy - mm/dd/yyyy"
   *
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

/** ASYNC FUNCTION: Calculates all watch times combined by month
 *
 * @returns {array} array of watch time objects combined by month
 *
 * @example let monthlyWatchTimes = await getMonthlyWatchTimes();
 *
 */
async function getMonthlyWatchTimes() {
  /** ENCAPSULATED FUNCTION: Determines which month the current watch time is in
   *
   * @param {string} date - watch time date in the format of "yyyy-mm-dd"
   *
   * @returns {string} Capitalized month name
   *
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

/** ASYNC FUNCTION: Inserts watch time list items depending on timeframe chosen
 *
 * @param {Object} watchTimes - holds the watch time object that has the date and total amount of watch time in seconds
 * @param {string} timeframe - determines how the watch time list item is prepared for HTML insertion
 *
 * @returns {null}
 *
 * @notes convertTimeToText() is imported from global-functions.js
 *
 */
async function insertFilteredWatchTimes(watchTimes, timeframe) {
  /** ENCAPSULATED FUNCTION: Appends watch time line into watch time list
   *
   * @param {Object} dateValue - holds the watch time date; could be three different formats depending on the timeframe
   * @param {int} watchTimeSeconds - the watch time in seconds that will be converted to text
   * @param {boolean} isLastItem - determines if a horizontal line is appended after an item
   * @param {boolean} needsReformatting - only applies to reformatting the date to text for daily times; default is false
   *
   * @returns {null}
   *
   */
  function appendWatchTimeItem(
    dateValue,
    watchTimeSeconds,
    isLastItem,
    needsReformatting = false
  ) {
    let watchTimeListElem = $("#watch-times-list > ul");

    let newDateFormat = needsReformatting
      ? reformatDateToText(dateValue)
      : dateValue;
    let newTimeForamt = convertTimeToText(watchTimeSeconds, true);
    let watchTimeItem = $(`<li>
                            <p>${newDateFormat}</p>
                            <p>${newTimeForamt}</p>
                          </li>`);

    watchTimeListElem.append(watchTimeItem);

    // Appends a horizontal line after every watch time except the final time
    if (!isLastItem) {
      watchTimeListElem.append("<hr>");
    }
  }

  /** Main Body */
  if (timeframe === "daily-times") {
    for (let index in watchTimes) {
      let dateValue = watchTimes[index]["date"];
      let watchTimeSeconds = watchTimes[index]["total-watch-time"];
      let isLastItem = index == watchTimes.length - 1;
      appendWatchTimeItem(dateValue, watchTimeSeconds, isLastItem, true);
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

/** FUNCTION: Gets and displays the relevant watch times for the "Notable Days" widget
 *
 * @returns {null}
 *
 * @example insertNotableWatchDays();
 *
 * @notes getCurrentWatchTimes() is imported from global-functions.js
 *
 */
async function insertNotableWatchDays() {
  /** ENCAPSULATED FUNCTION: Sorts the watch times by ascending order
   *
   * @returns {Array} An array of watch time objects
   *
   */
  async function sortWatchTimesAsc() {
    let allWatchTimes = await getAllWatchTimes();

    return allWatchTimes.sort(
      (a, b) => a["total-watch-time"] - b["total-watch-time"]
    );
  }

  /** ENCAPSULATED FUNCTION: Gets the day with the least amount of watch time
   *
   * @returns {Object} Watch time object
   *
   */
  async function getLeastWatchedDay() {
    try {
      const data = await sortWatchTimesAsc();

      // Returns first element (least amount of watch time)
      return data[0];
    } catch (error) {
      console.error(error);
    }
  }

  /** ENCAPSULATED FUNCTION: Gets the day with the most amount of watch time
   *
   * @returns {Object} Watch time object
   *
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
    const currentWatchTimes = await getCurrentWatchTimes();
    let todayTime = currentWatchTimes[0]["total-watch-time"];
    $(`#today-day #watch-time`).html(convertTimeToText(todayTime, true));

    // Reformats 'yyyy-mm-dd' to 'mmm dd yyyy, www'
    let newDateFormat = reformatDateToText(currentWatchTimes[0]["date"]);
    $(`#today-day #date`).html(newDateFormat);

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

/** Watch Times Chart */
// TODO: encapsulate
let currentDayOfMonth = new Date().getDate();

const days = Array.from({ length: currentDayOfMonth }, (_, i) => i + 1);

let total = Array.from({ length: 31 }, () => Math.floor(Math.random() * 24));

new Chart("chart", {
  type: "line",
  data: {
    labels: days,
    datasets: [
      {
        label: "Total",
        data: total,
        borderColor: "#fbfbfb",
        fill: false,
      },
      // {
      //   label: "Regular Video",
      //   data: pastMonthShorts,
      //   borderColor: "#db2121",
      //   fill: false
      // }, {
      //   label: "Shorts",
      //   data: pastMonthRegular,
      //   borderColor: "#137a23",
      //   fill: false
      // }
    ],
  },
  options: {
    scales: {
      x: {
        // Updated from 'xAxes' to 'x'
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "Days",
          color: "#fbfbfb",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      y: {
        // Updated from 'yAxes' to 'y'
        title: {
          display: true,
          text: "Hours",
          color: "#fbfbfb",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: { color: "#fbfbfb" },
      },
      title: {
        display: false,
        text: "YouTube Watch History over 30 Days",
        color: "#fbfbfb",
        position: "top",
        font: {
          size: 16,
          weight: "bold",
        },
        padding: 15,
        fullSize: true,
      },
    },
  },
});

/** SECTION - ONLOAD FUNCTION CALLS */
$(document).ready(async function () {
  /** EVENT LISTENER: calculates and displays corresponding watch time chart  */
  $("#chart-timeframe").on("change", function () {
    let videoTypeValue = $(this).val();
    console.log("Selected value:", videoTypeValue);
    // You can add additional logic here to handle the selected value
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
