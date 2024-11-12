/**
 * @LenchetoFC
 * @description This controls the website blocker feature on webpages
 *
 */

/** TODO: NOTE: List of Imported Functions from global-functions.js
 * - displayNotifications();
 */

/** SECTION - FUNCTION DECLARATIONS */

/** FUNCTION: Gets all additional blocked websites and redirects the user if the current website is blocked
 *
 * @returns {void}
 *
 * @example checkBlockedWebsite()
 */
async function checkBlockedWebsite() {
  let allWebsites = await selectAllRecordsGlobal("additional-websites");

  console.log("blockedWebsites");
  console.log(allWebsites);

  // Iterates through each blocked website, removes 'https://', and checks if that is in the current URL
  // -- redirects user to dashboard page
  allWebsites.forEach((element) => {
    let baseURL = element.url.split("//");
    if (window.location.href.includes(baseURL[1])) {
      redirectUser();
    }
  });
}

/** !SECTION */

/** SECTION - ONLOAD FUNCTION CALLS */
$(document).ready(function () {
  // Redirects user from current website if it is in the blocked website list
  checkBlockedWebsite();
});
/** !SECTION */
