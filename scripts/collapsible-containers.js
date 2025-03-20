/**
 * Opens collapsible on changelog page
 *
 * @name expandCollapsible
 *
 * @param {jquery object} collapsible - collapsible button element
 *
 * @returns {void}
 *
 * @example expandCollapsible($('.collapsible'));
 *
 */
function expandCollapsible(collapsible) {
  const content = $(collapsible).siblings(".content");

  $(collapsible)
    .css("border-radius", "1.2rem 1.2rem 0 0")
    .attr("aria-expanded", true);
  $(content).css("height", $(content)[0].scrollHeight + 25 + "px");
}

/**
 * Closes collapsible on changelog page
 *
 * @name closeCollapsible
 *
 * @param {jquery object} collapsible - collapsible button element
 *
 * @returns {void}
 *
 * @example closeCollapsible($('.collapsible'));
 *
 */
function closeCollapsible(collapsible) {
  const content = $(collapsible).siblings(".content");

  $(collapsible).css("border-radius", "1.2rem").attr("aria-expanded", false);
  $(content).css("height", "0px");
}

// On document ready
$(document).ready(function () {
  // Attaches event listener to collapsible containers to expand or collapse them
  $(".collapsible").on("click", function () {
    $(this).toggleClass("active");
    const content = $(this).siblings(".content");

    // If content is open, close it. Otherwise, expand it
    if ($(content).css("height") !== "0px") {
      closeCollapsible(this);
    } else {
      expandCollapsible(this);
    }
  });

  // Makes sure the latest changelog is already opened on load
  const latestChangelog = $(".collapsible#latest-changelog");
  expandCollapsible(latestChangelog);
});
