/**
 * @file settings-website-blocker.js
 * @description Controls the youtube limitations feature on youtube pages
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @requires module:global-functions
 * @see {@link module:global-functions.redirectUser} x4
 * 
 * @notes
 * 
 * @param {boolean} isPlaybackPage - if the current web address is on a playback page
 * @param {boolean} isHomePage - if the current web address is on home page
 * @param {boolean} isAnyPage - if the current web address is on any YouTube page
 * @param {boolean} isShortsPage - if the current web address is on Shorts page
 * @param {boolean} isSearchPage - if the current web address is on search page
 * 
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

/** @notes possible way to disable shorts comments  */
// use event listeners on down button, mouse scroll wheel down, and down button next to shorts player
// - also check other areas where this function can be applied to

/** @notes two ways to handle new element creations */
// 1. add onchange to main element to check for any existing element (use length)

/**
 * SECTION - FUNCTION DECLARATIONS
 */

/**
 * Hides a target element within a specified parent element
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
 * @returns {void}
 *
 * @example hideHomeButton();
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
 * @param {boolean} isAnyPage - if the current web address is on any YouTube page
 * @param {boolean} isSearchPage - if the current web address is on search page
 *
 * @returns {void}
 *
 * @example hideShortsRecommendations();
 *
 */
function hideShortsRecommendations(isPlaybackPage, isAnyPage, isSearchPage) {
  if (isPlaybackPage) {
    // Shorts content on playback pages
    hideDOMContent("#related #contents", "ytd-reel-shelf-renderer");
  } else if (isSearchPage) {
    // Shorts content on search pages
    hideDOMContent("#primary #contents", "ytd-reel-shelf-renderer");
  } else if (isAnyPage) {
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
 * @notes applies to home & playback pages
 *
 * SEARCH BAR: #center:has(#search)
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
 * @example hideVideoRecommendations();
 *
 * @notes applies to home & playback pages
 *
 * Don't run on MUSIC, MOVIES&TV, NEWS, COURSES, STUDIO.YT.COM, YT.COM/@, YT.COM/PLAYLIST, YT.COM/FEED/*
 *
 */
function hideVideoRecommendations(isPlaybackPage, isHomePage) {
  if (isPlaybackPage) {
    console.log("recommendations");
    // Side recommendations - playback
    hideDOMContent("#primary", "#related");

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

    // TODO: add a message when these recommendations are gone
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
 * @example disableInfiniteRecommendations();
 *
 * @notes applies to home & playback pages
 *
 * RECOMMENDATION REFRESH on HOME: ytd-watch-next-secondary-results-renderer ytd-continuation-item-renderer
 * RECOMMENDATION REFRESH on PLAYBACK: ytd-watch-next-secondary-results-renderer ytd-continuation-item-renderer
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
 * @returns {void}
 *
 * @example hideComments();
 *
 * @notes applies to playback and shorts pages
 *
 * COMMENTS SECTION on PLAYBACK: #comments
 * COMMENTS SECTION on SHORTS: #comments-button
 */
function hideComments(isPlaybackPage, isShortsPage) {
  if (isPlaybackPage) {
    hideDOMContent("#primary", "ytd-comments#comments");
  } else if (isShortsPage) {
    hideDOMContent("ytd-shorts", "#comments-button");
  }
}

/**
 * Retrieves and applies all active limitations to current web page
 *
 * @name applyActiveLimitations
 *
 * @returns {void}
 *
 * @example applyActiveLimitations();
 */
async function applyActiveLimitations() {
  try {
    $(".blank-screen").css("display", "block");

    // Boolean values for current page to determine which functions to run
    const currentWebAddress = window.location.href;
    const isAnyPage = currentWebAddress?.includes("youtube.com/");
    const isHomePage = currentWebAddress === "https://www.youtube.com/";
    const isShortsPage = currentWebAddress?.includes("youtube.com/shorts");
    const isPlaybackPage = currentWebAddress?.includes("/watch?");
    const isSearchPage = currentWebAddress?.includes("?search_query=");

    // Get only active limitations from storage
    let allActiveLimitations = await filterRecordsGlobal(
      "youtube-limitations",
      "active",
      true
    );

    // console.log(allActiveLimitations);

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
          hideShortsRecommendations(isPlaybackPage, isAnyPage, isSearchPage);
          break;
        case "search-bar":
          hideSearchBar();
          break;
        case "infinite-recom":
          disableInfiniteRecommendations(isPlaybackPage, isHomePage);
          break;
        case "video-recom":
          hideVideoRecommendations(isPlaybackPage, isHomePage);
          break;
        case "comments-section":
          hideComments(isPlaybackPage, isShortsPage);
          break;
      }
    }

    $(".blank-screen").css("display", "none");
  } catch (error) {
    console.error(error.message);
  }
}
/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
const blankScreen = `<div class='blank-screen'></div`;
$("body").prepend(blankScreen);

$(document).ready(function () {
  // Removes any YouTube element that is current limited (only on YouTube site)
  applyActiveLimitations();

  // hides ability to refresh recommendations every time the window is resized.
  // That tag is reset when the window is resized, so this is the workaround
  // window.addEventListener("resize", () => {
  //   setTimeout(() => {
  //     hideDOMContent(
  //       "ytd-continuation-item-renderer",
  //       "Continuous Recommendations"
  //     );
  //   }, 1000);
  // });
});

// Reapplies limitations when navigating between pages
window.addEventListener("yt-navigate-finish", function (event) {
  applyActiveLimitations();
});
/** !SECTION */
