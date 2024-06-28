const totalData = [3,4,3,4,3,3,5,7,4,2]
const xValues = Array.from({length: totalData.length}, (_, i) => i).reverse();

new Chart("watchHistoryChart", {
  type: "line",
  data: {
    labels: xValues,
    datasets: [{ 
      label: "Total",
      data: totalData,
      borderColor: "#3d3d3d",
      fill: false
    }, { 
      label: "Regular Video",
      data: [2,3,1,1,1,2,3,4,3,2],
      borderColor: "#db2121",
      fill: false
    }, { 
      label: "Shorts",
      data: [1,1,2,3,2,1,2,3,1,0],
      borderColor: "#137a23",
      fill: false
    }]
  },
  options: {
    scales: {
      x: { // Updated from 'xAxes' to 'x'
        grid: {
          display: false
        },
        title: {
          display: true,
          text: 'Day',
          color: '#3d3d3d',
          font: {
            size: 16,
            weight: 'bold',
          },
        }
      },
      y: { // Updated from 'yAxes' to 'y'
        title: {
          display: true,
          text: 'Hours',
          color: '#3d3d3d',
          font: {
            size: 16,
            weight: 'bold',
          },
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: '#3d3d3d' }
      },
      title: {
        display: true,
        text: 'Daily YouTube Watch History over 30 Days',
        color: '#3d3d3d',
        position: 'top',
        font: {
          size: 16,
          weight: 'bold',
        },
        padding: 15,
        fullSize: true,
      }
    }
  }
});