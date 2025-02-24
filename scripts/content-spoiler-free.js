/**
 * @file content-spoiler-free.js
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
    "spoiler-free",
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
    "spoiler-free",
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
    allKeywords.push(...group["keywords"]);
  }

  // Convert all keywords to lowercase
  allKeywords = allKeywords.map((keyword) => keyword.toLowerCase());

  return allKeywords;
}

/** !SECTION */

/**
 * SECTION - DETECTING SPOILER KEYWORDS
 */

/**
 * Gets active keywords and checks string for said keywords
 *
 * @name checkForKeywords
 *
 * @param {string} stringToCheck - string to check for keyword(s)
 *
 * @returns {object} objects holding string keyword and boolean keywordFound
 *
 * @example activateKeywordObserver(isGenObscureActive);
 */
async function checkForKeywords(allKeywords, stringToCheck) {
  // console.log(`Checking if a keyword is within ${stringToCheck}...`);

  // Initialize a variable to track if a keyword was found
  let keywordFound = { keyword: null, keywordFound: false };

  // Check if any keyword in allKeywords is included in stringToCheck
  allKeywords.some((keyword) => {
    if (stringToCheck.toLowerCase().includes(keyword)) {
      keywordFound = { keyword: keyword, keywordFound: true }; // Set the variable to true if a match is found
      return true; // Exit the loop once a match is found
    }
    return false; // Explicitly return false to continue looping
  });

  return keywordFound; // Return the boolean value
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
async function activateKeywordObserver(containerId, isGenObscureActive) {
  console.log("activated");
  const observedVideos = new Set(); // Store unique video elements

  const allKeywords = await getSpoilerKeywords();

  const observer = new MutationObserver(function (mutations) {
    // console.log("new batch");
    mutations.forEach(function (mutation) {
      const localName = mutation.target.localName;
      const classList = Object.values(mutation.target.classList);
      const addedNodes = Object.values(mutation.addedNodes);
      // Filter contentArray to only include elements with localName "ytd-rich-item-renderer"
      const contentArray = Object.values(content).filter((videoElement) =>
        videoElement.classList.contains("ytd-rich-item-renderer")
      );
      // const contentArray = Object.values(content);

      let videoContent;

      contentArray.forEach((videoElement) => {
        // console.log(videoElement);
        if (!observedVideos.has(videoElement)) {
          // Only process unique video elements
          observedVideos.add(videoElement);

          const details = videoElement.querySelector("#details");
          const containsVideoClass = videoElement.classList.contains(
            "ytd-rich-item-renderer"
          );

          const shortsDetails = videoElement.querySelector(
            "ytm-shorts-lockup-view-model"
          );

          if (details && containsVideoClass) {
            // console.log("video:", videoElement);

            const channelNameHTML =
              videoElement.querySelector("#channel-name a") || "";
            const videoTitleHTML =
              videoElement.querySelector("#video-title") || "";
            const thumbnailHTML =
              videoElement.querySelector("#thumbnail img") || "";

            videoContent = {
              videoTitle: videoTitleHTML,
              channelName: channelNameHTML,
              thumbnail: thumbnailHTML,
            };

            [videoTitleHTML.innerHTML, channelNameHTML.innerHTML].forEach(
              async (stringToCheck) => {
                const { keyword, keywordFound } = await checkForKeywords(
                  allKeywords,
                  stringToCheck
                );

                if (keywordFound) {
                  // Hides video content
                  // hideVideoSpoilers(videoContent);
                  console.log(`${keyword} found in`, videoElement);
                }
              }
            );

            // Here you can perform further actions with videoContent
          } else if (shortsDetails && containsVideoClass) {
            // console.log("shorts", videoElement);
            const channelNameHTML = "";
            const videoTitleHTML = videoElement.querySelector("h3") || "";
            const thumbnailHTML = videoElement.querySelector("img") || "";

            videoContent = {
              videoTitle: videoTitleHTML,
              channelName: channelNameHTML,
              thumbnail: thumbnailHTML,
            };

            [videoTitleHTML.innerHTML].forEach(async (stringToCheck) => {
              const { keyword, keywordFound } = await checkForKeywords(
                allKeywords,
                stringToCheck
              );

              if (keywordFound) {
                // Hides shorts content
                // hideShortsSpoilers(videoContent);
                console.log(`${keyword} found in`, videoElement);
              }
            });
          }
          // console.log(videoContent);
        }
      });

      if (observedVideos.size >= 10) {
        observer.disconnect();
      }
    });
  });

  // Start observing the document for changes
  const observerInterval = setInterval(() => {
    const targetNode = document.body.querySelector(`${containerId}`);

    if (targetNode) {
      observer.observe(targetNode, {
        childList: true,
        subtree: true,
      });
      clearInterval(observerInterval);
    } else {
      console.error(`Target container ${containerId} not found.`);
    }
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
function hideShortsSpoilers(videoContent) {
  const { videoTitle, thumbnail } = videoContent;

  // Call modifyVideoThumbnail function
  modifyShortsThumbnail(thumbnail);

  // Add 'spoiler' tag to item
  addShortsSpoilerTag(videoTitle);

  // Change video name to hide all other text besides keyword(s) detected
  rewriteShortsDetails(videoTitle);
}

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
    // Blur thumbnail
  } else {
    // Replace thumbnail with "spoiler detected" image
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
function rewriteShortsDetails(titleElement) {
  // Shorts
  // shorts container = ytd-rich-section-renderer ytd-rich-item-renderer
  // shorts title = ytd-rich-item-renderer h3 a > span
  // TODO: get ids of affected shorts video
  // TODO: disable a.reel-item-endpoint
  // TODO: update h3 aria-label to new title
  // TODO: update span html to new title
}

/**
 * Adds custom spoiler tag to affected shorts video
 *
 * @name addShortsSpoilerTag
 *
 * @param {object} titleElement - object of video title element container to be modified
 *
 * @returns {void}
 *
 * @example addVideoSpoilerTag(titleElement);
 */
function addShortsSpoilerTag(titleElement) {
  // Shorts
  // shorts container = ytd-rich-section-renderer ytd-rich-item-renderer
  // shorts title = ytd-rich-item-renderer h3 a > span
  // TODO: get ids of affected shorts video
  // TODO: add spoiler tag to title
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
function hideVideoSpoilers(videoContent) {
  const { videoTitle, channelName, thumbnail } = videoContent;

  // Call modifyVideoThumbnail function
  modifyVideoThumbnail(thumbnail);

  // Add 'spoiler' tag to item
  addVideoSpoilerTag(videoTitle);

  // Change video name to hide all other text besides keyword(s) detected
  rewriteVideoDetails(videoTitle, channelName);
}

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
    // Blur thumbnail
  } else {
    // Replace thumbnail with "spoiler detected" image
  }
}

/**
 * Rewrites details of affected video
 *
 * @name rewriteVideoDetails
 *
 * @param {object} titleElement - object of video title element container to be modified
 * @param {object} channelElement - object of channel name container to be modified
 *
 * @returns {void}
 *
 * @example rewriteVideoDetails(titleElement, channelElement);
 */
// TODO:FIXME:TACKLE THIS FUNCTION FIRST!!!!!!!!!!!!!!
function rewriteVideoDetails(titleElement, channelElement) {
  // Video
  // video container = ytd-rich-grid-renderer ytd-rich-item-renderer
  // video name id = ytd-rich-item-renderer #video-title
  // TODO: get ids of affected regular video
  // TODO: disable a.reel-item-endpoint
  // TODO: update h3 aria-label to new title
  // TODO: update span html to new title
}

// Get all values of video title

/**
 * Adds custom spoiler tag to affected video
 *
 * @name addVideoSpoilerTag
 *
 * @param {object} titleElement - object of video title container to be modified
 *
 * @returns {void}
 *
 * @example addVideoSpoilerTag(titleElement);
 */
function addVideoSpoilerTag(titleElement) {
  // Video
  // video container = ytd-rich-grid-renderer ytd-rich-item-renderer
  // video name id = ytd-rich-item-renderer #video-title
  // TODO: get ids of affected regular video
  // TODO: add spoiler tag to title
}

/** !SECTION */

/**
 * SECTION - ONLOAD FUNCTIONS CALLS
 */
$(document).ready(async function () {
  // Get general obscurement value
  // if true, activate general obscurement mutation observer
  const isGenObscureActive = await getGenObscureValue();
  // console.log(isGenObscureActive);

  // TODO: Activates keyword observer depending on if the page is playback or home
  let containerId;
  containerId = "#primary ytd-rich-grid-renderer";
  activateKeywordObserver(containerId, isGenObscureActive);
});

/** !SECTION */
