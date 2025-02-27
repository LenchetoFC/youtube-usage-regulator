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

## Features

### Current Features

- Blocks Pages:
  - Entirety of YouTube
  - Home page
  - Shorts page
- Removes Parts of YouTube Site:
  - Video recommendations
  - Search bar
  - Home button
  - Video autoPlay button
  - Next video button
  - and more!
- Schedules:
  - Add days and times that YouTube will be completely restricted

### Future Features

-

## User Interface Designs

### Popup

Shows the user's current usage times and a button to disable the entire YouTube site.
![Screenshot of the extensions main popup; shows the user's current usage times and a button to disable the entire YouTube site](/images/ui-popup.png)

### General Settings

Shows buttons to toggle YouTube elements, add/remove alternate activities, the user's all time usage, and a button to reset that time.
![Screenshot of the extension's general settings UI; shows buttons to disable YouTube elements, set alternate activities, textbox for new activities, and a button to reset all time usage](/images/ui-general-settings.png)

### Schedule Settings

Shows the user's set schedules and buttons to add a new schedule for the selected days. They can also add and remove schedule times when creating new schedules.
![Screenshot of the extension's schedule settings UI; shows user's set schedules and buttons to add a new schedule](/images/ui-schedule-settings.png)

### Blocked Redirect Page

On top of a gif that is randomly chosen from 12 different "funny fail" GIFs, shows the user's usage times and their set alternate activities. If there are no set activities, it tells the user how to add some.
![Screenshot of an example of the page that the user is redirected to when they try to use YouTube when it the entire site is blocked](/images/ui-blocked-page.png)

## Known Bugs

### Watch Times

- [ ] If at least two videos are playing at once, watch times will count both. Meaning one second in real time will result in two seconds saved to database
- [ ] The first shorts is not counted towards watch times
- [ ] if no record exists for current day and user navigates to video from home page, it does not create new record. It's something about how youtube works and the page doesn't actually "reload" when going from home to video

### Restriction Schedules

- [ ] When removing a regular interval event, it removes any existing all-day event in the same day

## Sole Author & Developer

**Lorenzo Ramirez** | [Email](mailto:lorenzoramirez122@gmail.com) | [Personal Website](https://lorenzoramirezjr.com)

## Version History

- 0.1 **Initial Release**
  - Finished User Interfaces
- 0.2
  - Added alternate activities functionality
- 0.3
  - Added YouTube restriction functionalities
- 0.4
  - Added settings & cross-reference functionality
- 0.5
  - Added time tracking functionality
- 0.6
  - Updated blocked page functionality & UI
- 0.7
  - Added scheduling storing functionality
- 0.7.1
  - Restriction fixes
- 0.7.2
  - Added scheduling block functionality
- 0.8
  - Overhauled content removal system
