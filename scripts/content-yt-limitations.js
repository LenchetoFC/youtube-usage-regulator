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
// 1. add onchange to main element to check for any exisiting element (use length)

/**
 * SECTION - FUNCTION DECLARATIONS
 */

/**
 * Hides the element with the given ID
 *
 * @name hideDOMContent
 *
 * @param {string} elementID - ID of the element to hide
 * @param {string} elementName - Descriptive name of the element that's being hidden
 *
 * @returns {void}
 *
 * @example hideDOMContent("#guide-inner-content [title='Home']", "Home Button - Drawer Event Listener")
 */
function hideDOMContent(className, elementName) {
  try {
    // Ensure the DOM is fully loaded before running the script
    $(document).ready(function () {
      const contentItems = $(className);

      // console.log(className, $(className));

      // Adds hidden class to elements
      $(className).addClass("hidden", function (index) {
        // console.log(`Hides ${elementName}: ${index}`);
      });

      // Create a style element
      const style = document.createElement("style");
      style.innerHTML = `.hidden { display: none !important; }`;
      document.getElementsByTagName("head")[0].appendChild(style);

      // Use MutationObserver to watch for changes in the DOM
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          // console.log(mutation.addedNodes);
          if (mutation.addedNodes.length) {
            $(className).addClass("hidden");
            console.log("hidden");
          }
        });
      });

      // Start observing the document for changes
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  } catch (error) {
    console.log(
      `Error removing ${className} for ${elementName}: ${error.message}`
    );
  }
}

/**
 * Hides all buttons that redirect user's to the YT home page
 *
 * @name hideHomeButton
 *
 * @returns {void}
 *
 * @example hideHomeButton();
 *
 * HOME BUTTON: .ytd-mini-guide-renderer[role="tab"]:has(> a[title="Home"])
 * HOME BUTTON in SIDE PANEL: ytd-guide-entry-renderer:has(a[title="Home"])
 * HOME BUTTON as YOUTUBE LOGO: ytd-topbar-logo-renderer
 *
 * FIXME: unreliable sometimes - needs further testing
 */
function hideHomeButton() {
  // Home button as YouTube logo
  hideDOMContent("ytd-topbar-logo-renderer", "Home Button - YouTube Logo");

  // Home Button in side panel
  hideDOMContent(
    'ytd-guide-entry-renderer:has(a[title="Home"])',
    "Home Button - Side Panel"
  );

  // Home button
  hideDOMContent(
    '.ytd-mini-guide-renderer[role="tab"]:has(> a[title="Home"])',
    "Home Button"
  );

  // setTimeout(() => {
  //   // Side Home Button
  //   hideDOMContent(
  //     "ytd-mini-guide-entry-renderer a[title='Home']",
  //     "Side Home Button - timeout 500"
  //   );
  // }, 500);

  // // Drawer home button - will not show if the side drawer haven't been opened yet
  // $("ytd-masthead #guide-button").on("click", function () {
  //   setTimeout(() => {
  //     // Home Button
  //     hideDOMContent(
  //       "#guide-inner-content [title='Home']",
  //       "Home Button - Drawer Event Listener"
  //     );
  //     // Home Button as YT Logo
  //     hideDOMContent(
  //       "ytd-topbar-logo-renderer [title='YouTube Home']",
  //       "Home Button - YouTube Logo on guide button click"
  //     );

  //     // Side Home Button
  //     hideDOMContent(
  //       "ytd-mini-guide-entry-renderer a[title='Home']",
  //       "Side Home Button - on guide button click"
  //     );
  //   }, 500);
  // });

  // // Drawer home button - drawer is already opened
  // if ($("tp-yt-app-drawer").opened) {
  //   console.log("drawer opened");
  //   hideDOMContent(
  //     "#guide-inner-content [title='Home']",
  //     "Home Button - Drawer Opened"
  //   );
  // }

  // // Side home button home page (only exists on home page)
  // if (!window.location.href.includes("/watch?")) {
  //   hideDOMContent(
  //     "ytd-mini-guide-renderer [title='Home']",
  //     "Side Home Button - home page"
  //   );
  // }
}

/**
 * Hides all buttons that leads to YT Shorts page
 *
 * @name hideShortsButton
 *
 * @returns {void}
 *
 * @example hideShortsButton();
 *
 * SHORTS BUTTON: .ytd-mini-guide-renderer[role="tab"]:has([title="Shorts"])
 * SHORTS BUTTON in SIDE PANEL: ytd-guide-entry-renderer:has([title="Shorts"])
 *
 * FIXME: unreliable sometimes - needs further testing
 */
function hideShortsButton() {
  setTimeout(() => {
    // Side Shorts button
    hideDOMContent(
      "ytd-mini-guide-entry-renderer a[title='Shorts']",
      "Side Shorts Button - timeout 500"
    );
  }, 500);

  // Drawer shorts button - will not show if the side drawer haven't been opened yet
  $("ytd-masthead #guide-button").on("click", function () {
    setTimeout(() => {
      hideDOMContent(
        "#guide-inner-content a[title='Shorts']",
        "Shorts Button - Drawer Event Listener"
      );

      // Side Shorts button
      // hideDOMContent(
      //   "ytd-mini-guide-entry-renderer a[title='Shorts']",
      //   "Side Shorts Button - on guide button click"
      // );
    }, 500);
  });

  // Drawer home button - drawer is already opened
  if ($("tp-yt-app-drawer").opened) {
    hideDOMContent(
      "#guide-inner-content a[title='Shorts']",
      "Shorts Button - Drawer Opened"
    );
  }

  // Side home button home page (only exists on home page)
  if (!window.location.href.includes("/watch?")) {
    hideDOMContent(
      "ytd-mini-guide-renderer a[title='Shorts']",
      "Side Shorts Button - home page"
    );
  }
}

/**
 * Hides all Shorts videos and recommended Shorts
 *
 * @name hideShortsContent
 *
 * @returns {void}
 *
 * @example hideShortsContent();
 *
 * @notes applies to home & playback pages
 *
 * SHORTS CONTENT on HOME PAGE: ytd-rich-section-renderer:has([is-shorts])
 * SHORTS CONTENT on PLAYBACK PAGE: ytd-reel-shelf-renderer:has(ytm-shorts-lockup-view-model)
 * SHORTS CONTENT on TRENDING, SHOPPING, GAMING PAGES: ytd-item-section-renderer:has(ytd-reel-shelf-renderer)
 */
function hideShortsContent() {
  // Hides shorts button as well
  hideShortsButton();

  if (window.location.href.includes("/watch?")) {
    // Shorts content - side recommendations (playback)
    hideDOMContent("ytd-reel-shelf-renderer", "Shorts Content - playback");
  } else if (window.location.href.includes("?search_query=")) {
    // Shorts chip filter - search page
    hideDOMContent(
      "yt-chip-cloud-chip-renderer:has([title='Shorts'])",
      "shorts chip content - search page"
    );
    hideDOMContent(
      "ytd-reel-shelf-renderer:has(ytm-shorts-lockup-view-model-v2)",
      "Shorts Content - search page"
    );
  } else if (window.location.href.includes("youtube.com")) {
    // Shorts content - home page
    hideDOMContent(
      "ytd-reel-shelf-renderer:has(ytm-shorts-lockup-view-model-v2)",
      "Shorts Content - home page"
    );

    hideDOMContent(
      "ytd-rich-shelf-renderer:has(ytm-shorts-lockup-view-model-v2)",
      "Shorts Content - home page other try"
    );
    console.log("should hide shorts");
  }

  // Redirects user if they are on shorts page
  if (window.location.href.includes("/shorts/")) {
    redirectUser();
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
  hideDOMContent("#center:has(#search)", "Search Bar");
}

/**
 * Hides all video recommendations on home page and on side of videos
 *
 * @name hideVideoRecommendations
 *
 * @returns {void}
 *
 * @example hideVideoRecommendations();
 *
 * @notes applies to home & playback pages
 *
 * Don't run on MUSIC, MOVIES&TV, NEWS, COURSES, STUDIO.YT.COM, YT.COM/@, YT.COM/PLAYLIST, YT.COM/FEED/*
 *
 * VIDEO RECOMMENDATIONS on PLAYBACK: ytd-compact-video-renderer
 * VIDEO RECOMMENDATIONS on TRENDING, SHOPPING: ytd-item-section-renderer:has(ytd-video-renderer)
 * VIDEO RECOMMENDATIONS on LIVE, NEWS: ytd-rich-section-renderer:has([is-shelf-item])
 * VIDEO RECOMMENDATIONS on GAMING: ytd-item-section-renderer:has(ytd-grid-video-renderer)
 * VIDEO RECOMMENDATIONS on NEWS, FASHION&BEAUTY, PODCASTS: ytd-rich-section-renderer:has(.ytd-rich-section-renderer)
 * VIDEO RECOMMENDATIONS on SPORTS: ytd-rich-section-renderer, ytd-rich-item-renderer
 */
function hideVideoRecommendations() {
  if (window.location.href.includes("/watch?")) {
    // Side recommendations - playback
    hideDOMContent(
      "#secondary:has(ytd-watch-next-secondary-results-renderer) #related",
      "Recommendations on video playback pages"
    );

    // Removes button to switch to default view because the layout
    //  is messed up after removing recommendations on that view
    hideDOMContent(
      ".ytp-size-button",
      "Default View Button for recommendations - playback"
    );

    setTimeout(() => {
      // Video Wall after videos
      hideDOMContent(
        ".videowall-endscreen",
        "Video Wall after video ends - playback"
      );

      // FIXME: next video still autoplays
      // Video Wall after videos
      // hideDOMContent(
      //   ".ytp-autonav-endscreen-countdown-overlay",
      //   "Autoplay screen after video ends - playback"
      // );
    }, 5000);
  } else if (window.location.href.includes("youtube.com")) {
    // Video recommendations - home page
    hideDOMContent(
      "ytd-rich-grid-renderer > #contents > ytd-rich-item-renderer",
      "Recommendations on home pages"
    );
  }

  // Also disables infinite recommendations
  disableInfiniteRecommendations();
}

/**
 * Removes the element that loads another section of recommended videos
 *
 * @name disableInfiniteRecommendations
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
function disableInfiniteRecommendations() {
  if (true) {
    let;
  }
  hideDOMContent(
    "#primary ytd-continuation-item-renderer",
    "Infinite Video Recommendations"
  );
}

/**
 * Hides skip button on videos to avoid moving from video to video easily
 *
 * @name hideSkipButton
 *
 * @returns {void}
 *
 * @example hideSkipButton();
 *
 * SKIP VIDEO BUTTON: .ytp-next-button
 */
function hideSkipButton() {
  hideDOMContent("#player-container .ytp-next-button", "Playback Skip Button");
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
 * FIXME: comments sometimes takes too long to load in
 */
function hideComments() {
  if (window.location.href.includes("watch")) {
    hideDOMContent("ytd-comments#comments", "Comments Section on videos");
  } else if (window.location.href.includes("/shorts/")) {
    //FIXME: none of this works
    hideDOMContent(
      "watch-while-engagement-panel",
      "Comments Section in Shorts"
    );
    hideDOMContent("#comments-button", "Comments button in Shorts");
    $("#comments-buttons").on("click", function () {
      console.log("clicked");
      hideDOMContent(
        "`${this} watch-while-engagement-panel`",
        "Comments Section in Shorts"
      );
    });
  }
}

/**
 * Checks if both the shorts content and video recommendations settings are active
 *
 * @name isShortsAndRecommDisabled
 *
 * @returns {boolean}
 *
 * @example isShortsAndRecommDisabled();
 *
 * ACTIVE VIDEO RECOMMENDATIONS & SHORTS on PLAYBACK: #related:has(ytd-watch-next-secondary-results-renderer)
 */
async function isShortsAndRecommDisabled() {}

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
  if (window.location.href.includes("youtube.com")) {
    // setTimeout(async () => {
    try {
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
            if (window.location.href.includes("youtube.com/")) {
              redirectUser();
            }
            break;
          case "home-page":
            if (window.location.href === "https://www.youtube.com/") {
              redirectUser();
            } else {
              hideHomeButton();
            }
            break;
          case "shorts-page":
            if (window.location.href.includes("youtube.com/shorts")) {
              redirectUser();
            } else {
              hideShortsButton();
            }
            break;
          case "home-button":
            hideHomeButton();
            break;
          case "shorts-button":
            hideShortsButton();
            break;
          case "shorts-content":
            hideShortsContent();
            break;
          case "search-bar":
            hideSearchBar();
            break;
          case "infinite-recommendations":
            disableInfiniteRecommendations();
            break;
          case "video-recommendations":
            hideVideoRecommendations();
            break;
          case "skip-button":
            hideSkipButton();
            break;
          case "comments-section":
            hideComments();
            break;
        }
      }
    } catch (error) {
      console.error(error.message);
    }
    // }, 2000);
  }
}
/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
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
/** !SECTION */
