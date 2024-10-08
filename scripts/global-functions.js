/**
 * SECTION - STORAGE RELATED
 */

/**
 * Retrieve settings from storage.
 *
 * @param {string} key - The key of the setting to retrieve.
 * @param {Function} callback - The function to call with the retrieved value.
 *
 * @returns {void} This function does not return anything. It calls the callback with the retrieved value.
 *
 * @example getSettings('myKey', function(value) { console.log(value); });
 */
window.getSettings = (key, callback) => {
  try {
    chrome.storage.sync.get([key][0], (result) => {
      callback(result[key]);
    });
  } catch (error) {
    console.log(`Error getting ${key} ${error}`);
  }
};

/**
 * Sets a specific setting in storage and logs the change.
 *
 * @param {string} key - The key of the setting to set.
 * @param {any} value - The value to set for the given key.
 *
 * @returns {void} This function does not return anything. It sets a value in storage and logs the change.
 *
 * @example setSetting('myKey', 'true');
 */
window.setSetting = (key, value) => {
  let save = {};
  save[key] = value;
  chrome.storage.sync.set(save, function () {
    getSettings(key, (result) => {
      console.log(
        `SETTINGS CHANGED: ${key} setting was changed to ${result[key]}`
      );
    });
  });
};

window.setNestedSetting = (key, subKey, value, callback) => {
  chrome.storage.sync.get(key, function (result) {
    if (!result[key]) {
      result[key] = {};
    }
    result[key][subKey] = value;
    let save = {};
    save[key] = result[key];
    chrome.storage.sync.set(save, function () {
      getSettings(key, (result) => {
        console.log(
          `SETTINGS CHANGED: ${key}.${subKey} setting was changed to ${result[subKey]}`
        );
        if (typeof callback === "function") {
          callback(result); // Execute the callback, passing the result as an argument
        }
      });
    });
  });
};

/**!SECTION */

/**
 * SECTION - TIME USAGE RELATED
 *
 */
/**
 * Converts time usage into an accurate time statement
 *
 * @param {int} timeUsage - the value of the time usage storage value
 *
 * @returns {string} Returns time usage in a statement that is accurate to the amount of time given
 * Time statements are dynamic meaning depending on the amount of time, they will include
 *  time measurements (mins, hours, etc.) when needed
 *
 * @example let usageStatement = convertTimeToText(timeUsage);
 */
window.convertTimeToText = (timeUsage) => {
  // if time usage is below a minute
  if (timeUsage < 60) {
    return `${timeUsage} seconds`;
  } else if (timeUsage >= 60) {
    // if time usage is above a minute
    let min = Math.floor(timeUsage / 60);
    let sec = Math.floor(timeUsage - min * 60);

    // if time usage is between a minute and an hour
    if (timeUsage < 3600) {
      return `${min} ${min === 1 ? "Minute" : "Minutes"} ${sec} Seconds`;
    } else if (timeUsage >= 3600) {
      // if time usage is above an hour
      let hours = Math.floor(timeUsage / 3600);
      let remainingMinutes = Math.floor((timeUsage - hours * 3600) / 60);
      return `${hours} Hr${hours !== 1 ? "s" : ""} ${remainingMinutes} ${
        remainingMinutes === 1 ? "Min" : "Mins"
      } ${sec} ${sec === 1 ? "Sec" : "Secs"}`;
    }
  }
};

/**!SECTION */
