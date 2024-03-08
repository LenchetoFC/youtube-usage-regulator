// TODO: Save element removal choice to settings file
// TODO: Creating alternate activities
// TODO: Deleting alternate activities
// TODO: Reset all time usage
// TODO: Creating new schedules
// TODO: Displays current schedules
// TODO: Deleting schedules
// TODO: Show appropriate settings choice on load

//LINK - 

// GETTER
export const getSettings = (key) => {
  return localStorage.getItem(key);
}

// SETTER
const changeSetting = (key, value) => {
  console.log(value);
  localStorage.setItem(key, value)
  console.log(`SETTINGS CHANGED: ${key} setting was changed to ${value}`);

  getSettings(key);
}


// Add event listeners to all form elements for settings edits
// Checks the buttons that are enabled
const addictiveForm = document.querySelectorAll("form input");
addictiveForm.forEach((element) => {
  if (getSettings(element.name) === "true") {
    element.checked = true;
  } else {
    element.checked = false;
  }

  element.addEventListener("click", (event) => {
    changeSetting(element.name, element.checked);
  })
});

// Stringify for local storage setter
// JSON.stringify(object);