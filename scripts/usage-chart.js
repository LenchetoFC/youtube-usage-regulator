// /**
//  * @LenchetoFC
//  * @description This controls the watch time chart in general settings
//  *
//  */

// /**
//  * SECTION - FUNCTION DECLARATIONS
//  *
// */

// /** FUNCTION - Convert seconds to hours and return as numbers */
// const convertSecondsToHours = (secondsArray) => secondsArray.map(seconds => parseFloat((seconds / 60).toFixed(2)));

// /** FUNCTION - Correctly add each watch time into total watch time */
// function addTotalWatchTime(regularTimes, shortsTimes) {
//   let totalTimes = [];

//   const maxLength = Math.max(regularTimes.length, shortsTimes.length);

//   for (let i = 0; i < maxLength; i++) {
//     const regularTime = parseFloat(regularTimes[i]) || 0;
//     const shortsTime = parseFloat(shortsTimes[i]) || 0;
//     totalTimes.push((regularTime + shortsTime).toFixed(2)); // Ensure the sum is treated as a number and limit to 2 decimal places
//   }

//   // Convert each summed value back to a number with 2 decimal places
//   return totalTimes.map(time => parseFloat(time));
// }

// // NOTE: temporary values
// // const randomNumbersRegular = Array.from({length: 20}, () => Math.floor(Math.random() * 1440));
// // const randomNumbersShorts = Array.from({length: 20}, () => Math.floor(Math.random() * 1440));
// // console.log(randomNumbersRegular);
// // console.log(randomNumbersShorts);
// // console.log("\n")
// // setNestedSetting("watch-usage", "past-month-video", randomNumbersRegular);
// // setNestedSetting("watch-usage", "past-month-shorts", randomNumbersShorts);

// /** FUNCTION - retrieves settings as a promise */
// function getSettingsAsync(key) {
//   return new Promise((resolve, reject) => {
//     getSettings(key, (result) => {
//       if (result) {
//         resolve(result);
//       } else {
//         reject('No result found');
//       }
//     });
//   });
// }

// /** ASYNC FUNCTION - calculates the total watch times for each day */
// async function calculateTotal() {
//   try {
//     const result = await getSettingsAsync("watch-usage");
//     const pastMonthRegular = convertSecondsToHours(result['past-month-video']);
//     const pastMonthShorts = convertSecondsToHours(result['past-month-shorts']);
//     const total = addTotalWatchTime(pastMonthShorts, pastMonthRegular);

//     // Return an object containing all three values
//     return { total, pastMonthShorts, pastMonthRegular };
//   } catch (error) {
//     console.error(error);
//   }
// }

// /**
//  * SECTION - POPULATES CHART
//  *
// */

// // Gets result of calculateTotal and populates chart
// // calculateTotal().then(({ total, pastMonthShorts, pastMonthRegular }) => {

//   // console.log(total);
//   // console.log(pastMonthShorts);
//   // console.log(pastMonthRegular);

//   let currentDayOfMonth = new Date().getDate();

//   const days = Array.from({length: currentDayOfMonth}, (_, i) => i+1);

//   let total = Array.from({length: 31}, () => Math.floor(Math.random() * 24));

//   new Chart("overall-chart", {
//     type: "line",
//     data: {
//       labels: days,
//       datasets: [{
//         label: "Total",
//         data: total,
//         borderColor: "#fbfbfb",
//         fill: false
//       },
//       // {
//       //   label: "Regular Video",
//       //   data: pastMonthShorts,
//       //   borderColor: "#db2121",
//       //   fill: false
//       // }, {
//       //   label: "Shorts",
//       //   data: pastMonthRegular,
//       //   borderColor: "#137a23",
//       //   fill: false
//       // }
//     ]
//     },
//     options: {
//       scales: {
//         x: { // Updated from 'xAxes' to 'x'
//           grid: {
//             display: false
//           },
//           title: {
//             display: true,
//             text: 'Days',
//             color: '#fbfbfb',
//             font: {
//               size: 12,
//               weight: 'bold',
//             },
//           }
//         },
//         y: { // Updated from 'yAxes' to 'y'
//           title: {
//             display: true,
//             text: 'Hours',
//             color: '#fbfbfb',
//             font: {
//               size: 12,
//               weight: 'bold',
//             },
//           }
//         }
//       },
//       plugins: {
//         legend: {
//           display: true,
//           position: 'bottom',
//           labels: { color: '#fbfbfb' }
//         },
//         title: {
//           display: false,
//           text: 'YouTube Watch History over 30 Days',
//           color: '#fbfbfb',
//           position: 'top',
//           font: {
//             size: 16,
//             weight: 'bold',
//           },
//           padding: 15,
//           fullSize: true,
//         }
//       }
//     }
//   });

//   total = Array.from({length: 31}, () => Math.floor(Math.random() * 24));

//   new Chart("regular-video-chart", {
//     type: "line",
//     data: {
//       labels: days,
//       datasets: [{
//         label: "Total",
//         data: total,
//         borderColor: "#fbfbfb",
//         fill: false
//       },
//       // {
//       //   label: "Regular Video",
//       //   data: pastMonthShorts,
//       //   borderColor: "#db2121",
//       //   fill: false
//       // }, {
//       //   label: "Shorts",
//       //   data: pastMonthRegular,
//       //   borderColor: "#137a23",
//       //   fill: false
//       // }
//     ]
//     },
//     options: {
//       scales: {
//         x: { // Updated from 'xAxes' to 'x'
//           grid: {
//             display: false
//           },
//           title: {
//             display: true,
//             text: 'Days',
//             color: '#fbfbfb',
//             font: {
//               size: 12,
//               weight: 'bold',
//             },
//           }
//         },
//         y: { // Updated from 'yAxes' to 'y'
//           title: {
//             display: true,
//             text: 'Hours',
//             color: '#fbfbfb',
//             font: {
//               size: 12,
//               weight: 'bold',
//             },
//           }
//         }
//       },
//       plugins: {
//         legend: {
//           display: true,
//           position: 'bottom',
//           labels: { color: '#fbfbfb' }
//         },
//         title: {
//           display: false,
//           text: 'YouTube Watch History over 30 Days',
//           color: '#fbfbfb',
//           position: 'top',
//           font: {
//             size: 16,
//             weight: 'bold',
//           },
//           padding: 15,
//           fullSize: true,
//         }
//       }
//     }
//   });

//   total = Array.from({length: 31}, () => Math.floor(Math.random() * 24));

//   new Chart("shorts-chart", {
//     type: "line",
//     data: {
//       labels: days,
//       datasets: [{
//         label: "Total",
//         data: total,
//         borderColor: "#fbfbfb",
//         fill: false
//       },
//       // {
//       //   label: "Regular Video",
//       //   data: pastMonthShorts,
//       //   borderColor: "#db2121",
//       //   fill: false
//       // }, {
//       //   label: "Shorts",
//       //   data: pastMonthRegular,
//       //   borderColor: "#137a23",
//       //   fill: false
//       // }
//     ]
//     },
//     options: {
//       scales: {
//         x: { // Updated from 'xAxes' to 'x'
//           grid: {
//             display: false
//           },
//           title: {
//             display: true,
//             text: 'Days',
//             color: '#fbfbfb',
//             font: {
//               size: 12,
//               weight: 'bold',
//             },
//           }
//         },
//         y: { // Updated from 'yAxes' to 'y'
//           title: {
//             display: true,
//             text: 'Hours',
//             color: '#fbfbfb',
//             font: {
//               size: 12,
//               weight: 'bold',
//             },
//           }
//         }
//       },
//       plugins: {
//         legend: {
//           display: true,
//           position: 'bottom',
//           labels: { color: '#fbfbfb' }
//         },
//         title: {
//           display: false,
//           text: 'YouTube Watch History over 30 Days',
//           color: '#fbfbfb',
//           position: 'top',
//           font: {
//             size: 16,
//             weight: 'bold',
//           },
//           padding: 15,
//           fullSize: true,
//         }
//       }
//     }
//   });
// // });
