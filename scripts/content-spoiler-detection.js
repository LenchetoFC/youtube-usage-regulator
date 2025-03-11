/**
 * @file content-spoiler-detection.js
 * @description Controls the spoiler free features
 *
 * @version 1.0.0
 * @author LenchetoFC
 *
 * @requires module:global-functions
 * @see {@link module:global-functions...}
 */

/**
 * SECTION - GETTING DATABASE VALUES
 */

/**
 * Gets value for replacing thumbnail from database
 *
 * @name getReplaceThumbnailSetting
 *
 * @returns {boolean} replaceThumbnailValue - true is to replace thumbnail; false is to blur image
 *
 * @example getReplaceThumbnailSetting();
 */
async function getReplaceThumbnailSetting() {
  // get thumbnail setting value
  const replaceThumbnailSetting = await filterRecordsGlobal(
    "spoiler-detection",
    "name",
    "replace-thumbnail"
  );
  const isReplaceThumbnailActive = replaceThumbnailSetting[0]["active"];

  return isReplaceThumbnailActive;
}

/**
 * Gets value for general obscurement from database
 *
 * @name getGenObscureValue
 *
 * @returns {boolean} genObscurementValue - true is to obscure everything; false is to not obscure everything
 *
 * @example getGenObscureValue();
 */
async function getGenObscureValue() {
  // get obscurement setting value
  const genObscurementSetting = await filterRecordsGlobal(
    "spoiler-detection",
    "name",
    "obscure-all-with-spoiler"
  );
  const genObscurementValue = genObscurementSetting[0]["active"];

  return genObscurementValue;
}

/**
 * Get all spoiler keywords
 *
 * @name getSpoilerKeywords
 *
 * @returns {array} list of all spoiler keywords
 *
 * @example const keywords = getSpoilerKeywords();
 */
async function getSpoilerKeywords() {
  // Get all active spoiler groups
  const activeGroups = await filterRecordsGlobal(
    "spoiler-groups",
    "active",
    true
  );

  // Put all keywords from all active groups into one array and convert to lowercase
  let allKeywords = [];
  for (const key in activeGroups) {
    const group = activeGroups[key];
    allKeywords?.push(...group["keywords"]);
  }

  // Convert all keywords to lowercase
  allKeywords = allKeywords?.map((keyword) => keyword?.toLowerCase());

  return allKeywords;
}

/** !SECTION */

/**
 * SECTION - DETECTING SPOILER KEYWORDS
 */

/**
 * Ensures that the thumbnail is modified since it reverts back to original when DOM changes
 *
 * @name handleIntersection
 *
 * @returns {void}
 *
 * @example const thumbnailObserver = new IntersectionObserver(handleIntersection, {
 *            root: null,
 *            rootMargin: "0px",
 *            threshold: 0.1,
 *          });
 */
function handleIntersection(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const imgElement = entry.target;
      // Change the src attribute here
      imgElement.src = chrome.runtime.getURL("/images/icon-logo-ext-128.png");
      imgElement.style.objectFit = "none";
      imgElement.style.background = "lavender";

      // Stop observing after the src change
      observer.unobserve(imgElement);
    }
  });
}

/**
 * Detects any spoiler keywords within the title of a video or shorts and obscures it
 *
 * @name spoilerDetection
 *
 * @returns {void}
 *
 * @example spoilerDetection();
 */
async function spoilerDetection() {
  /**
   * Gets active keywords and checks string for said keywords
   *
   * @name checkForKeywords
   *
   * @param {array} allKeywords - a list of keywords to check
   * @param {string} stringToCheck - string to check for keyword(s)
   *
   * @returns {object} objects holding string keyword and boolean keywordFound
   *
   * @example checkForKeywords(allKeywords, stringToCheck);
   */
  async function checkForKeywords(allKeywords, stringToCheck) {
    // console.log(`Checking if a keyword is within ${stringToCheck}...`);

    // Initialize a variable to track if a keyword was found
    let keywordFound = { keyword: null, keywordFound: false };

    // Check if any keyword in allKeywords is included in stringToCheck
    allKeywords?.some((keyword) => {
      if (stringToCheck?.toLowerCase()?.includes(keyword)) {
        keywordFound = { keyword: keyword, keywordFound: true }; // Set the variable to true if a match is found
        return true; // Exit the loop once a match is found
      }
      return false; // Explicitly return false to continue looping
    });

    return keywordFound; // Return the boolean value
  }

  /**
   * Gets all video items that haven't been modified yet within the designated container
   *
   * @name getVideoItems
   *
   * @param {string} containerId - parent ID of container containing video elements
   *
   * @returns {array} a list of unmodified video elements
   *
   * @example getVideoItems(containerId);
   */
  function getVideoItems(containerId) {
    return $(containerId).find(
      `ytd-rich-item-renderer.ytd-rich-grid-renderer:not('.rtt-spoiler-item'), 
            ytd-compact-video-renderer.ytd-item-section-renderer:not('.rtt-spoiler-item')`
    );
  }

  /**
   * Gets all shorts items that haven't been modified yet within the designated container
   *
   * @name getVideoItems
   *
   * @param {string} containerId - parent ID of container containing shorts elements
   *
   * @returns {array} a list of unmodified shorts elements
   *
   * @example getShortsItems(containerId);
   */
  function getShortsItems(containerId) {
    return $(containerId).find(
      `ytd-rich-item-renderer.ytd-rich-shelf-renderer:not('.rtt-spoiler-item'),
            ytm-shorts-lockup-view-model-v2:not('.rtt-spoiler-item')`
    );
  }

  /**
   * Check each video elements for spoiler keywords
   *
   * @name checkForKeywords
   *
   * @param {array} videoItems - a list of video elements
   * @param {array} allKeywords - a list of keywords to check
   * @param {boolean} isShorts - are the videoItems shorts elements
   *
   * @returns {void}
   *
   * @example checkForSpoilers(videoItems, allKeywords, false);
   */
  function checkForSpoilers(videoItems, allKeywords, isShorts) {
    videoItems.each(async (item) => {
      let videoElement = videoItems[item];
      let videoContent, videoTitleHTML, thumbnailHTML;

      // Get respective element information of each video element
      if (isShorts) {
        videoTitleHTML = videoElement.querySelector("h3 span") || "";
        thumbnailHTML = videoElement.querySelector("img") || "";
      } else {
        videoTitleHTML = videoElement.querySelector("#video-title") || "";
        thumbnailHTML = videoElement.querySelector("#thumbnail img") || "";
      }

      // Check each video element for spoiler keywords
      for (const stringToCheck of [videoTitleHTML.innerHTML]) {
        const { keyword, keywordFound } = await checkForKeywords(
          allKeywords,
          stringToCheck
        );

        if (keywordFound) {
          // Capture title and thumbnail elements to modify them
          videoContent = {
            videoTitleElement: videoTitleHTML,
            thumbnailElement: thumbnailHTML,
          };

          // Add a 'modified' tag to video elements
          $(videoElement).addClass("rtt-spoiler-item");
          // console.log("Keyword found:", keyword);

          // Depending on type of video element, modify the title and thumbnail of spoiler content
          if (isShorts) {
            await hideShortsSpoilers(videoContent, keyword);
          } else {
            await hideVideoSpoilers(videoContent, keyword);
          }
          break;
        }
      }
    });
  }

  /** Main Content */
  const containerId = `#contents:has(> ytd-rich-item-renderer), 
      #contents:has(> ytd-compact-video-renderer), 
      #contents #content:has(> ytd-rich-shelf-renderer), 
      #contents #items:has(> ytm-shorts-lockup-view-model-v2)
    `;

  // Get all video and shorts items within the containerId
  const videoItems = getVideoItems(containerId);
  const shortsItems = getShortsItems(containerId);

  // Get all keywords from database
  // If general obscurement setting is active, add "spoiler" to keyword list
  const allKeywords = await getSpoilerKeywords();
  const isGenObscureActive = await getGenObscureValue();
  if (isGenObscureActive) allKeywords.push("spoiler");

  // check for spoilers for all video and shorts items
  checkForSpoilers(videoItems, allKeywords, false);
  checkForSpoilers(shortsItems, allKeywords, true);
}

/**
 * Activates mutation observer to detect spoiler keywords
 *
 * @name activateKeywordObserver
 *
 * @param {boolean} isGenObscureActive - value of whether the setting is active or not
 *
 * @returns {void}
 *
 * @example activateKeywordObserver(isGenObscureActive);
 */
async function activateKeywordObserver() {
  // Checks for any changes to first level only of containerId
  const observer = new MutationObserver(async (mutations) => {
    await spoilerDetection();
  });

  const observerInterval = setInterval(() => {
    let containerId;

    containerId = `#contents:has(> ytd-rich-item-renderer), 
      #contents:has(> ytd-compact-video-renderer), 
      #contents #content:has(> ytd-rich-shelf-renderer), 
      #contents #items:has(> ytm-shorts-lockup-view-model-v2)
    `;

    // Makes containerId into a node element
    const targetNode = document.body.querySelector(`${containerId}`);
    const watchFlexContainer = document.body.querySelector("ytd-watch-flexy");
    // console.log("Target Node:", targetNode);

    // If container exists, attach spoiler detection observer
    if (targetNode && watchFlexContainer) {
      observer.observe(targetNode, {
        childList: true,
      });

      // Attach spoiler detection observer to this node for when user navigates between home and playback pages
      observer.observe(watchFlexContainer, {
        childList: true,
        attributes: true,
      });

      // Clear interval once the target node has been found (if ever)
      clearInterval(observerInterval);
    }
    // else {
    //   console.error(`Target container ${containerId} not found.`);
    // }
  }, 1000);
}

/** !SECTION */

/**
 * SECTION - MODIFYING SPOILER CONTENT FOR SHORTS VIDEOS
 */

/**
 * Hides shorts content if spoiler detected
 *
 * @name hideShortsSpoilers
 *
 * @param {object} videoContent - information regarding observed target that will be modified
 *
 * @returns {void}
 *
 * @example hideShortsSpoilers(videoContent);
 */
async function hideShortsSpoilers(videoContent, keyword) {
  /**
   * Blurs or replaces thumbnail of affected shorts video
   *
   * @name modifyShortsThumbnail
   *
   * @param {object} thumbnailElement - object of thumbnail element container to be modified
   *
   * @returns {void}
   *
   * @example modifyShortsThumbnail(thumbnailElement);
   */
  async function modifyShortsThumbnail(thumbnailElement) {
    //  True is to replace thumbnail with image; false is to blur thumbnail
    const isReplacementActive = await getReplaceThumbnailSetting();

    // Replace thumbnail with blur or 'spoiler detected' image
    if (isReplacementActive) {
      // Replace thumbnail with "spoiler detected" image
      const thumbnailObserver = new IntersectionObserver(handleIntersection, {
        root: null, // Use the viewport as the root
        rootMargin: "0px",
        threshold: 0.1, // Trigger when 10% of the element is visible
      });

      thumbnailObserver.observe(thumbnailElement);
    } else {
      // Blur thumbnail
      $(thumbnailElement).css("filter", "blur(20px)");
    }
  }

  /**
   * Rewrites details of affected shorts video
   *
   * @name rewriteVideoDetails
   *
   * @param {object} titleElement - object of video title element container to be modified
   *
   * @returns {void}
   *
   * @example rewriteVideoDetails(titleElement);
   */
  function rewriteShortsDetails(titleElement, keyword) {
    const $videoTitleLink = $(titleElement).closest("a");

    const newTitle = `SPOILER: "${keyword}" found in the title of this video. Proceed with caution.`;

    $videoTitleLink.attr("aria-label", newTitle);
    $videoTitleLink.attr("title", newTitle);

    $(titleElement).text(newTitle);
  }

  /** Main Content */
  const { videoTitleElement, thumbnailElement } = videoContent;

  // Call modifyVideoThumbnail function
  modifyShortsThumbnail(thumbnailElement);

  // Change video name to hide all other text besides keyword(s) detected
  rewriteShortsDetails(videoTitleElement, keyword);
}

/** !SECTION */

/**
 * SECTION - MODIFYING SPOILER CONTENT FOR REGULAR VIDEOS
 */

/**
 * Hides video content if spoiler detected
 *
 * @name hideVideoSpoilers
 *
 * @param {object} videoContent - information regarding observed target that will be modified
 *
 * @returns {void}
 *
 * @example hideVideoSpoilers(videoContent);
 */
async function hideVideoSpoilers(videoContent, keyword) {
  /**
   * Blurs or replaces thumbnail of affected video
   *
   * @name modifyVideoThumbnail
   *
   * @param {object} thumbnailElement - object of thumbnail element container to be modified
   *
   * @returns {void}
   *
   * @example modifyVideoThumbnail(thumbnailElement);
   */
  async function modifyVideoThumbnail(thumbnailElement) {
    //  True is to replace thumbnail with image; false is to blur thumbnail
    const isReplacementActive = await getReplaceThumbnailSetting();

    // Replace thumbnail with blur or 'spoiler detected' image
    if (isReplacementActive) {
      // Replace thumbnail with "spoiler detected" image
      const thumbnailObserver = new IntersectionObserver(handleIntersection, {
        root: null, // Use the viewport as the root
        rootMargin: "0px",
        threshold: 0.1, // Trigger when 10% of the element is visible
      });

      thumbnailObserver.observe(thumbnailElement);
    } else {
      // Blur thumbnail
      $(thumbnailElement).css("filter", "blur(20px)");
    }
  }

  /**
   * Rewrites details of affected video
   *
   * @name rewriteVideoDetails
   *
   * @param {object} titleElement - object of video title element container to be modified
   * @ignore @param {object} channelElement - object of channel name container to be modified
   *
   * @returns {void}
   *
   * @example rewriteVideoDetails(titleElement);
   */
  function rewriteVideoDetails(titleElement, keyword) {
    const $videoTitleLink = $(titleElement).closest("#video-title-link");

    const newTitle = `SPOILER: "${keyword}" found in the title of this video. Proceed with caution.`;

    $videoTitleLink.attr("aria-label", newTitle);
    $videoTitleLink.attr("title", newTitle);

    $(titleElement).text(newTitle);
  }

  /** Main Content */
  const { thumbnailElement, videoTitleElement } = videoContent;

  // Call modifyVideoThumbnail function
  modifyVideoThumbnail(thumbnailElement);

  // Change video name to hide all other text besides keyword(s) detected
  rewriteVideoDetails(videoTitleElement, keyword);
}

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(function () {
  // Attach spoiler detection observer after 2 seconds
  setTimeout(async () => {
    activateKeywordObserver();

    // Initiate initial spoiler detection
    await spoilerDetection();
  }, 2000);
});

/** !SECTION */
