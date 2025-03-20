/**
 * @file settings-website-blocker.js
 * @description Controls the youtube limitations feature on youtube pages
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @notes
 * ---YOUTUBE ELEMENT IDENTIFIERS---
 * HOME BUTTON: .ytd-mini-guide-renderer[role="tab"]:has(> a[title="Home"])
 * HOME BUTTON in SIDE PANEL: ytd-guide-entry-renderer:has(a[title="Home"])
 * HOME BUTTON as YOUTUBE LOGO: ytd-topbar-logo-renderer
 * SHORTS BUTTON: .ytd-mini-guide-renderer[role="tab"]:has([title="Shorts"])
 * SHORTS BUTTON in SIDE PANEL: ytd-guide-entry-renderer:has([title="Shorts"])
 * SHORTS CONTENT on HOME PAGE: ytd-rich-section-renderer:has([is-shorts])
 * SHORTS CONTENT on PLAYBACK PAGE: ytd-reel-shelf-renderer:has(ytm-shorts-lockup-view-model)
 * SHORTS CONTENT on TRENDING, SHOPPING, GAMING PAGES: ytd-item-section-renderer:has(ytd-reel-shelf-renderer)
 * SEARCH BAR: #center:has(#search)
 * VIDEO RECOMMENDATIONS on PLAYBACK: ytd-compact-video-renderer
 * VIDEO RECOMMENDATIONS on TRENDING, SHOPPING: ytd-item-section-renderer:has(ytd-video-renderer)
 * VIDEO RECOMMENDATIONS on LIVE, NEWS: ytd-rich-section-renderer:has([is-shelf-item])
 * VIDEO RECOMMENDATIONS on GAMING: ytd-item-section-renderer:has(ytd-grid-video-renderer)
 * VIDEO RECOMMENDATIONS on NEWS, FASHION&BEAUTY, PODCASTS: ytd-rich-section-renderer:has(.ytd-rich-section-renderer)
 * VIDEO RECOMMENDATIONS on SPORTS: ytd-rich-section-renderer, ytd-rich-item-renderer
 * SKIP VIDEO BUTTON: .ytp-next-button
 * COMMENTS SECTION on PLAYBACK: #comments
 * COMMENTS SECTION on SHORTS: #comments-button
 * RECOMMENDATION REFRESH on HOME: ytd-watch-next-secondary-results-renderer ytd-continuation-item-renderer
 * RECOMMENDATION REFRESH on PLAYBACK: ytd-watch-next-secondary-results-renderer ytd-continuation-item-renderer

 * ---LIMITATION RESTRICTIONS---
 * VIDEO RECOMMENDATIONS: Don't run on MUSIC, MOVIES&TV, NEWS, COURSES, STUDIO.YT.COM, YT.COM/@, YT.COM/PLAYLIST, YT.COM/FEED/*

 * ---LIMITATION SPECIAL CASES---
 * ACTIVE VIDEO RECOMMENDATIONS & SHORTS on PLAYBACK: #related:has(ytd-watch-next-secondary-results-renderer)
 */

/**
 * SECTION - FUNCTION DECLARATIONS
 */

/**
 * Main functionality for hiding target elements within a specified parent element
 *
 * @name hideDOMContent
 *
 * @param {string} parent - tag, id, or class name of parent element
 * @param {string} element - tag, id, or class name of target element
 *
 * @returns {void}
 *
 * @example hideDOMContent("ytd-masthead", "ytd-topbar-logo-renderer");
 */
function hideDOMContent(parent, element) {
  try {
    const observerInterval = setInterval(() => {
      const parentNode = document.body?.querySelector(parent);

      if (parentNode) {
        const hideElements = () => {
          const elementNodes = parentNode.querySelectorAll(element);
          elementNodes.forEach((node) => {
            if (!node.classList.contains("rtt-hidden")) {
              node.classList.add("rtt-hidden");
              // console.log("Hidden:", node);
            }
          });
        };

        // Initially hide elements
        hideElements();

        // Observe for changes in the DOM to hide new elements
        const documentObserver = new MutationObserver(() => {
          hideElements();
        });

        documentObserver.observe(parentNode, {
          childList: true,
          subtree: true,
        });

        // Clear interval once the target node has been found (if ever)
        clearInterval(observerInterval);
      }
    }, 1000);
  } catch (error) {
    console.log(`Error hiding ${element} within ${parent}: ${error.message}`);
  }
}

/**
 * Hides all buttons that directs users to the YT home page
 *
 * @name hideHomeButton
 *
 * @param {boolean} isPlaybackPage - if the current web address is on a playback page
 *
 * @returns {void}
 *
 * @example hideHomeButton(true);
 *
 */
function hideHomeButton(isPlaybackPage) {
  if (!isPlaybackPage) {
    // Home button
    hideDOMContent(
      ".ytd-mini-guide-renderer[role='tab']:has(a[title='Home']",
      'a[title="Home"]'
    );
  }

  // YouTube logo home button
  hideDOMContent("ytd-masthead", "ytd-topbar-logo-renderer");

  // YouTube logo home button in side panel
  // NOTE: will trigger a 'not found' error if the side panel is never opened.
  //        Error goes away when opened at least once.
  hideDOMContent("tp-yt-app-drawer", "ytd-topbar-logo-renderer");

  // Home Button in side panel
  // NOTE: will trigger a 'not found' error if the side panel is never opened.
  //        Error goes away when opened at least once.
  hideDOMContent("tp-yt-app-drawer", "a[title='Home']");
}

/**
 * Hides all buttons that leads to YT Shorts page
 *
 * @name hideShortsButton
 *
 * @param {boolean} isPlaybackPage - if the current web address is on a playback page
 *
 * @returns {void}
 *
 * @example hideShortsButton();
 *
 */
function hideShortsButton(isPlaybackPage) {
  if (!isPlaybackPage) {
    // Side Shorts button
    hideDOMContent("ytd-mini-guide-renderer", 'a[title="Shorts"]');
  }

  // Home Button in side panel
  // NOTE: will trigger a 'not found' error if the side panel is never opened.
  //        Error goes away when opened at least once.
  hideDOMContent("tp-yt-app-drawer", "a[title='Shorts']");
}

/**
 * Hides all Shorts videos and recommended Shorts
 *
 * @name hideShortsRecommendations
 *
 * @param {boolean} isPlaybackPage - if the current web address is on a playback page
 * @param {boolean} isHomePage - if the current web address is on the home page
 *
 * @returns {void}
 *
 * @example hideShortsRecommendations(true, false);
 *
 */
function hideShortsRecommendations(isPlaybackPage, isHomePage) {
  if (isPlaybackPage) {
    // Shorts content on playback pages
    hideDOMContent("#related #contents", "ytd-reel-shelf-renderer");
  } else if (isHomePage) {
    // Shorts content on home page
    hideDOMContent("#primary #contents", "ytd-rich-section-renderer");
  }
}

/**
 * Hides search at top middle of page
 *
 * @name hideSearchBar
 *
 * @returns {void}
 *
 * @example hideSearchBar();
 *
 */
function hideSearchBar() {
  hideDOMContent("ytd-masthead", "#center:has(yt-searchbox)");
}

/**
 * Hides all video recommendations on home page and on side of videos
 *
 * @name hideVideoRecommendations
 *
 * @param {boolean} isPlaybackPage - if the current web address is on a playback page
 * @param {boolean} isHomePage - if the current web address is on home page
 *
 * @returns {void}
 *
 * @example hideVideoRecommendations(true, false);
 *
 * @notes Don't run on MUSIC, MOVIES&TV, NEWS, COURSES, STUDIO.YT.COM, YT.COM/@, YT.COM/PLAYLIST, YT.COM/FEED/*
 *
 */
function hideVideoRecommendations(isPlaybackPage, isHomePage) {
  if (isPlaybackPage) {
    // Side recommendations - playback
    hideDOMContent(
      "#primary #related:has(> ytd-compact-video-renderer), #contents:has(> ytd-compact-video-renderer)",
      "ytd-compact-video-renderer"
    );

    // Video Wall after videos
    hideDOMContent(".videowall-endscreen", ".ytp-endscreen-content");
  } else if (isHomePage) {
    // Video recommendations - home page
    hideDOMContent(
      "#primary #contents",
      "ytd-rich-item-renderer:not(.ytd-rich-shelf-renderer)"
    );

    // FIXME: with this off, the reload animations plays for a while. Figure out how to allow refresh for just shorts
    disableInfiniteRecommendations(false, true);
  }
}

/**
 * Removes the element that loads another section of recommended videos
 *
 * @name disableInfiniteRecommendations
 *
 * @param {boolean} isPlaybackPage - if the current web address is on a playback page
 * @param {boolean} isAnyPage - if the current web address is on any YouTube page
 *
 * @returns {void}
 *
 * @example disableInfiniteRecommendations(false, true);
 *
 */
function disableInfiniteRecommendations(isPlaybackPage, isHomePage) {
  if (isPlaybackPage) {
    hideDOMContent("#related #contents", " ytd-continuation-item-renderer");
  } else if (isHomePage) {
    hideDOMContent("#primary #contents", " ytd-continuation-item-renderer");
  }
}

/**
 * Hides all comment sections
 *
 * @name hideComments
 *
 * @param {boolean} isPlaybackPage
 * @param {boolean} isShortsPage
 *
 * @returns {void}
 *
 * @example hideComments(true, false);
 *
 */
function hideComments(isPlaybackPage, isShortsPage) {
  if (isPlaybackPage) {
    hideDOMContent("#primary", "ytd-comments#comments");
  } else if (isShortsPage) {
    hideDOMContent("ytd-shorts", "#comments-button");
  }
}

/**
 * Hides entire recommendations container
 * If on home page, insert container stating that recommendations have been removed
 *
 * @name hideAllRecommendations
 *
 * @param {boolean} isPlaybackPage
 * @param {boolean} isHomePage
 *
 * @returns {void}
 *
 * @example hideAllRecommendations(false, true);
 *
 */
function hideAllRecommendations(isPlaybackPage, isHomePage) {
  if (isPlaybackPage) {
    hideDOMContent("#primary", "#related");
    hideDOMContent("#secondary", "#related");
  } else if (isHomePage) {
    hideDOMContent("#primary", "ytd-rich-grid-renderer");
    insertRecommendationsMessage();
  }
}

/**
 * Insert container stating that recommendations have been removed
 *
 * @name insertRecommendationsMessage
 *
 * @returns {void}
 *
 * @example insertRecommendationsMessage();
 *
 */
function insertRecommendationsMessage() {
  const messageHTML = `
    <div class="center-message">
      <h1>All recommendations have been disabled.</h1>
      <h2>Courtesy of Restrict the Tube.</h2>
    </div>
  `;
  $("#primary:not(:has(.center-message))").prepend(messageHTML);
}

/**
 * Retrieves and applies all active limitations to current web page
 *
 * @name applyLimitations
 *
 * @param {object} - contains all active limitations with all database properties
 *
 * @returns {void}
 *
 * @example applyLimitations(allActiveLimitations);
 */
async function applyLimitations(allActiveLimitations) {
  try {
    // Ensures this container is covering the entire screen
    $(".blank-screen").css("display", "block");

    // Boolean values for current page to determine which functions to run
    const currentWebAddress = window.location.href;
    const isAnyPage = currentWebAddress?.includes("youtube.com/");
    const isHomePage = currentWebAddress === "https://www.youtube.com/";
    const isShortsPage = currentWebAddress?.includes("youtube.com/shorts");
    const isPlaybackPage = currentWebAddress?.includes("/watch?");

    // console.log(allActiveLimitations);

    // If remove recommendations settings for shorts and video are both active, hide everything inside container
    let isBothRecomActive = false;
    const shortsRecomActive = checkPropertyValueExists(
      allActiveLimitations,
      "name",
      "shorts-recom"
    );
    const videoRecomActive = checkPropertyValueExists(
      allActiveLimitations,
      "name",
      "video-recom"
    );
    if (shortsRecomActive && videoRecomActive) {
      hideAllRecommendations(isPlaybackPage, isHomePage);
      isBothRecomActive = true;
    }

    // Iterate through active limitations to apply to current web page
    for (let index in allActiveLimitations) {
      // Limitation name property from storage
      const currentLimitation = allActiveLimitations[index].name;

      // Run hide/disable function that corresponds with the current limitation name
      switch (currentLimitation) {
        case "all-pages":
          if (isAnyPage) {
            redirectUser();
          }
          break;
        case "home-page":
          if (isHomePage) {
            redirectUser();
          } else {
            hideHomeButton(isPlaybackPage);
          }
          break;
        case "shorts-page":
          if (isShortsPage) {
            redirectUser();
          } else {
            hideShortsButton(isPlaybackPage);
          }
          break;
        case "home-button":
          hideHomeButton(isPlaybackPage);
          break;
        case "shorts-button":
          hideShortsButton(isPlaybackPage);
          break;
        case "shorts-recom":
          if (!isBothRecomActive) {
            hideShortsRecommendations(isPlaybackPage, isHomePage);
          }
          break;
        case "search-bar":
          hideSearchBar();
          break;
        case "infinite-recom":
          if (!isBothRecomActive) {
            disableInfiniteRecommendations(isPlaybackPage, isHomePage);
          }
          break;
        case "video-recom":
          if (!isBothRecomActive) {
            hideVideoRecommendations(isPlaybackPage, isHomePage);
          }
          break;
        case "comments-section":
          hideComments(isPlaybackPage, isShortsPage);
          break;
      }
    }

    // Hides the container when all the limitations are applied
    // NOTE: sometimes hides before all limitations are applied
    $(".blank-screen").css("display", "none");
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * Determines if a property value exists in array
 *
 * @name checkPropertyValueExists
 *
 * @param {array} arr - array to check
 * @param {string} property - property name to check
 * @param {string} value - value to check
 *
 * @returns {boolean}
 *
 * @example checkPropertyValueExists([{"name": "brad", "age": 24}, {"name": "karen", "age": 37}], "name", "karen");
 */
function checkPropertyValueExists(arr, property, value) {
  return arr.some(
    (obj) => obj.hasOwnProperty(property) && obj[property] === value
  );
}
/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
// Prepends container covering entire screen to hide site until the limitations have been applied
$(document).ready(function () {
  const blankScreen = `<div class='blank-screen'></div`;
  $("body").prepend(blankScreen);
});

/** !SECTION */
