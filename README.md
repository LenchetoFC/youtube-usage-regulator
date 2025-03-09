# YouTube Algorithm Regulator

This chrome browser extension aims to help people who feel like they use too much YouTube but can't seem to break the habit with some level of restrictions.

## Description

This extension goes beyond blocking the entire site (since user's still may need it for academic purposes) by giving the user options to remove specific elements from YouTube. The user can customize how their YouTube is displayed and how less it can keep the users on the site.

## Getting Started

### User Requirements

- Any Chrome-based browser (Chrome, brave, etc.)
- Browser Permissions

### Installing

There is currently no consumer release on [Chrome Extension Store](https://chromewebstore.google.com/).
Once the extension is functional, there will be an official release on the store and will be stated here.

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

Quick view of user information

- Watch percentages
- Watch times (table)
- Watch times (graph)
- Notable times
- Active spoiler groups

#### YouTube Limitations:

Specific limitations to apply to all (or some) YouTube pages:

- Specific YouTube pages
- Video/Shorts recommendations
- Search bar
- Home/Shorts button
- Comments section
- Disable infinite recommendations

#### General Website Blocker:

Add other websites beyond YouTube to completely block

#### Spoiler Detection:

Add groups of keyword to check recommended videos for
Blur thumbnail and filter title of videos with potential spoilers

#### Restriction Schedules:

Add days and times that YouTube will be completely restricted

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

## Known Bugs

## Author & Sole Developer

**Lorenzo Ramirez** | [Email](mailto:lorenzoramirez122@gmail.com) | [Personal Website](https://lorenzoramirezjr.com) | [LinkedIn](https://linkedin.com/in/lorenzo-ramirez-jr)

## Known Bugs

### Watch Times

- The first shorts is not counted towards watch times
- If no record exists for current day and user navigates to video from home page, it does not create new record. It's something about how youtube works and the page doesn't actually "reload" when going from home to video

### Spoiler Detection

- Does miss some spoiler content when navigating between home and playback pages
- Doesn't check for spoiler content on Shorts page

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
