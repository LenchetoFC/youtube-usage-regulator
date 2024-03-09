// TODO: Creating alternate activities
// TODO: Deleting alternate activities
// TODO: Reset all time usage
// TODO: Creating new schedules
// TODO: Displays current schedules
// TODO: Deleting schedules

// GETTER
const getSettings = (key, callback) => {
  chrome.storage.sync.get([key], function(result) {
    callback(result[key]);
  });
}

// SETTER
const changeSetting = (key, value) => {
  console.log(value);
  let save = {};
  save[key] = value;
  chrome.storage.sync.set(save, function() {
    console.log(`SETTINGS CHANGED: ${key} setting was changed to ${value}`);
    getSettings(key, function(result) {
      console.log(result);
    });
  });
}

// Add event listeners to all form elements for settings edits
// Checks the buttons that are enabled
const addictiveForm = document.querySelectorAll("form input");
addictiveForm.forEach((element) => {
  getSettings(element.name, function(result) {
    if (result === "true") {
      element.checked = true;
    } else {
      element.checked = false;
    }

    element.addEventListener("click", (event) => {
      changeSetting(element.name, element.checked.toString());
    });
  });
});


// to access storage from console, run this command
// chrome.storage.local.get(function(result) { console.log(result) });
