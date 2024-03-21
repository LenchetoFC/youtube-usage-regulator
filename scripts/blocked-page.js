/**
 * SECTION - RANDOM ELEMENT SELECTIONS
 * 
 */

// Randomly chooses number between 0 and 11
let randomNum = Math.floor(Math.random() * 12);

// Randomly chooses name to say after saying "sorry"
let names = ["pal", "broski", "broseph", "dolly", "kid", "person", "human", "fella", "bud", "player", "soldier", "helldiver"];
let usernameSpan = document.getElementById("username");
usernameSpan.innerHTML = names[randomNum];

// Randomly chooses background image
document.getElementById("blocked").style.backgroundImage = `url('/images/bg-gif-${randomNum}.gif')`;

/**!SECTION */


/**
 * SECTION - DISPLAYING TIME USAGE COUNT
 * 
 */

// Displays current time usage count in HTML
let allTimeCount = document.getElementById("usage-all-time");
getSettings("all-time-usage", (time) => {
  allTimeCount.innerHTML = convertTimeToText(time);
});

let todayCount = document.getElementById("usage-today");
getSettings("today-usage", (time) => {
  todayCount.innerHTML = convertTimeToText(time);
});

/**!SECTION */


/**
 * SECTION - DISPLAYING ALTERNATE ACTIVITIES
 * 
 */

/**
 * Retrieves the 'activities' setting and adds each activity to the HTML.
 */
getSettings("activities", (activities) => {
  if (activities.length === 0 || activities == undefined){
    let activityContainer = document.getElementById("alt-act-header");
    activityContainer.innerHTML = `
      Add activities to remind you of better things to do in General Settings.
    `
  }
  else {
    activities.forEach((activity, index) => {
      let activityItem = document.createElement("div");
      activityItem.className = "info-box activity";
      activityItem.id = `activity-${index}`;
      
      activityItem.innerHTML = `
        <img src="/images/icon-activity-${index}.svg"/>
        <p>${activity}</p>
      `;
      
      let activityContainer = document.getElementById("alt-activity-container");
      activityContainer.append(activityItem);
    });
  }
});

/**!SECTION */
