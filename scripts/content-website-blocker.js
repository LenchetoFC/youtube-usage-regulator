/**
 * @file settings-website-blocker.js
 * @description Controls the website blocker feature on webpages
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @requires module:global-functions
 * @see {@link module:global-functions.selectAllRecordsGlobal}
 * @see {@link module:global-functions.redirectUser}
 */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

/**
 * Gets all additional blocked websites and redirects the user if the current website is blocked
 *
 * @name checkBlockedWebsite
 * @async
 *
 * @returns {void}
 *
 * @example checkBlockedWebsite()
 */
async function checkBlockedWebsite() {
  let allWebsites = await filterRecordsGlobal(
    "additional-websites",
    "active",
    true
  );

  // console.log("blockedWebsites");
  // console.log(allWebsites);

  // Iterates through each blocked website, removes 'https://', and checks if that is in the current URL
  // -- redirects user to dashboard page
  (Object.values(allWebsites) ?? []).forEach((element) => {
    let baseURL = element.url?.split("//");
    if (window.location.href?.includes(baseURL[1])) {
      redirectUser();
    }
  });
}

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(function () {
  // Redirects user from current website if it is in the blocked website list
  checkBlockedWebsite();

  // Checks if website is now blocked on every focus
  window.addEventListener("focus", (event) => {
    checkBlockedWebsite();
  });
});
/** !SECTION */
