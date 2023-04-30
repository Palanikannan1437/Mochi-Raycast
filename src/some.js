const QuickChart = require('quickchart-js');

const myChart = new QuickChart();
myChart.setConfig({
  type: 'bar',
  data: { labels: ['Hello world', 'Foo bar'], datasets: [{ label: 'Foo', data: [1, 2] }] },
});

myChart.setFormat("svg")

console.log(myChart.getUrl());

