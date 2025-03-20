# YouTube Algorithm Regulator

This chrome browser extension aims to help people who feel like they use too much YouTube but can't seem to break the habit with some level of restrictions.

## Description

This extension goes beyond blocking the entire site (since user's still may need it for academic purposes) by giving the user options to remove specific elements from YouTube. The user can customize how their YouTube is displayed and how less it can keep the users on the site.

## Getting Started

### User Requirements

- Any Chrome-based browser (Chrome, brave, etc.)
- Browser Permissions

### Installing

There is now a consumer release on the [Chrome Extension Store](https://chromewebstore.google.com/). You may download it from [here](https://chromewebstore.google.com/detail/restrict-the-tube-limit-a/ddmcmbnmlhgbjkfmidljbcekphnjiddd?authuser=0&hl=en)!

## Technologies Used

### Frontend

- HTML
- CSS
- JavaScript
- jQuery
- [ ] Bootstrap

### Backend

- Chrome API

## Features

### Current Features

#### Dashboard:

View key statistics and essential details about the extension, along with an overview of your watch time history.

- Watch percentages
- Watch times (table)
- Watch times (graph)
- Notable times
- Active spoiler groups

#### YouTube Limitations:

Eliminate buttons, recommendations, and entire YouTube pages to better manage and reduce the time you spend on the platform.

- Specific YouTube pages
- Video/Shorts recommendations
- Search bar
- Home/Shorts button
- Comments section
- Disable infinite recommendations

#### General Website Blocker:

Restrict access to sites beyond YouTube to enhance your control over your overall browsing experience.

#### Spoiler Detection:

Identify key terms within recommendations to shield yourself from potential spoilers effectively.

#### Restriction Schedules:

Set up events to automatically limit YouTube access. Choose a specific time window during the day or opt to restrict access for the entire day to simplify your usage.

#### Watch Times

Accurately and precisely track your watch times. These are categorized into short-form and long-form videos, providing detailed insights into your viewing habits.

### Possible Future Features

#### Watch Modes

Only allow videos with specific keywords or within specific categories

#### Preferred Creators Mode

Select specific _subscribed_ creators to only appear in video recommendations

## User Interface Pages

### Popup

Shows the user's current usage times, next restriction event, and all the selected limitations added as "Quick Limitations."

### YouTube Limitations

A table of settings to toggle limitation settings, make them follow schedule events only, or add them to popup as a "Quick Limitations."

### General Website Blocker

A table that shows the websites the user added to be completely blocked. Buttons to either update or disable/enable website blocking.

### Spoiler Detection

A table of settings to toggle thumbnail obscurement. Customizable widgets that hold groups of keyword the user added.

### Restriction Schedules

A FullCalender.js library calendar that shows schedule events. Buttons to add or edit event details. Buttons to change calendar view to day or week views.

### Redirection Blocked Popover

When user tries to access a blocked site, they are redirected to Dashboard and greeted with this popover. Popover consists of a gif, that is randomly chosen from 12 different "funny fail" GIFs, and shows the user's usage times.

## Author & Sole Developer

**Lorenzo Ramirez** | [Email](mailto:lorenzoramirez122@gmail.com) | [Personal Website](https://lorenzoramirezjr.com) | [LinkedIn](https://linkedin.com/in/lorenzo-ramirez-jr)

## Known Bugs

### Watch Times

- The first shorts is not counted towards watch times
- If no record exists for current day and user navigates to video from home page, it does not create new record. It's something about how youtube works and the page doesn't actually "reload" when going from home to video

### Spoiler Detection

- Does miss some spoiler content when navigating between home and playback pages
- Doesn't check for spoiler content on Shorts page
- Bugs out when navigating using video chip tabs
- Doesn't check search items
- Doesn't check after-video-recommendations
- Sometimes modifies wrong title
  - I think it happens when you go from home to playback back to home where the recommendations refreshed but the h3 element was not updated

### Restriction Schedules

- When removing a regular interval event, it removes any existing all-day event in the same day

## Version History

- **0.1.0** Initial Release
  - Finished User Interfaces
- **0.2.0**
  - Added alternate activities functionality
- **0.3.0**
  - Added YouTube restriction functionalities
- **0.4.0**
  - Added settings & cross-reference functionality
- **0.5.0**
  - Added time tracking functionality
- **0.6.0**
  - Updated blocked page functionality & UI
- **0.7.0**
  - Added scheduling storing functionality
- **0.7.1**
  - Restriction fixes
- **0.7.2**
  - Added scheduling block functionality
- **0.8.0**
  - Overhauled content removal system
- **1.0.0** - Finished for Release
  - Multiple quality of life features
  - New intuitive user interface
  - Overhauled YouTube Limitations
  - Overhauled Restriction Schedules
  - Overhauled Popup
  - Overhauled Watch Times
  - Added Spoiler Detection
  - Added General Website Blocker
  - Added Dashboard
