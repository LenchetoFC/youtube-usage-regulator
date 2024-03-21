
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
  chrome.storage.sync.get([key], (result) => {
    callback(result[key]);
  });
}

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
  chrome.storage.sync.set(save, function() {
    getSettings(key, (result) => {
      console.log(`SETTINGS CHANGED: ${key} setting was changed to ${result}`);
    });
  });
}

/**!SECTION */