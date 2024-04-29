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
Once the extension is functional, there will be an offical release on the store and will be stated here.

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
  - Video autoplay button
  - Next video button
  - and more!
- Alternate Activities:
  - Write alternate activities to remind you what better things you can be doing
- Schedules:
  - Add days and times that YouTube will be completely restricted
- Limit the ability to endlessly recommend videos

### Future Features

- Timer to Disable YouTube
- Dark Mode
- Watch Modes:
  - Only shows videos according to watch mode
  - Options include: educational, recreational, and all-inclusive (default)
  - Uses video tags to determine if video respects current watch mode
- Free Videos:
  - Allow yourself at most 3 videos per day to watch
  - YouTube will disable after tokens have been used

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

On top of a gif that is randomly chosen from 12 different "funny fail" gifs, shows the user's usage times and their set alternate activities. If there are no set activities, it tells the user how to add some.
![Screenshot of an example of the page that the user is redirected to when they try to use YouTube when it the entire site is blocked](/images/ui-blocked-page.png)

<!-- ### Free Video Popup

![Screenshot of a popup to tell the extension that the user is going to spend a free video token on the video they're current watching](/images/ui-free-videos-popup.png) -->

## To-Do

<!-- ### Free Video Tokens

- [ ] Free video count popup
- [ ] Handle free video tokenization
      -->

### YouTube Restrictions

- [ ] Check settings every time the window is focused
  - [ ] Update removal functions to include the settings value and hide/show based on value

### Publishing Extension

- [ ] Publish to Chrome Web Store
- [ ] Update Repo Example Photos
- [ ] Record Demo Video

### Scheduling

- [ ] Combine crossed times

### Testing

- [ ] Test in all most popular browsers

### Completed

- [x] Improve restriction functionality
- [x] Sorts schedule times before storing
- [x] Allow schedules to block site
- [x] Create new schedules
- [x] Delete schedules
- [x] Display current schedules
- [x] Create default settings on first extension use
- [x] Separate general and schedule settings javascript into two files
- [x] Add new schedule form functionality
- [x] Display alt activities
- [x] Display usage times
- [x] Redesign Blocked Page
- [x] Display all time usage value on settings page
- [x] Display current day's usage time
- [x] Track and storage user's usage time
- [x] Display total usage time
- [x] Reset all time usage
- [x] Create activities
- [x] Delete activities
- [x] Display activities on settings page
- [x] Responsive design based on deleting and adding
- [x] Revise current version of how YouTube elements are removed
- [x] Extension Popup UI
- [x] General Settings UI
- [x] Schedule Settings UI
- [x] Free Video Popup UI
- [x] Blocked Page UI

## Sole Author & Developer

**Lorenzo Ramirez** | [Email](mailto:lorenzoramirez122@gmail.com) | [Personal Website](https://lorenzoramirezjr.com)

## Version History

- 0.1 **Initial Release**
  - Finished User Interfaces
- 0.2
  - Added alternate actitivies functionality
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

## Acknowledgments

Icon Creators

- [BomSymbols](https://creativemarket.com/BomSymbols)
- [FlatArt](https://www.freepik.com/author/flatart)
- [Erik_Rgnr](https://www.iconfinder.com/Erik_Rgnr)
