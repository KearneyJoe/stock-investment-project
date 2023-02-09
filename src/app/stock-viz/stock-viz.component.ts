import { Component, OnInit } from '@angular/core';
import { StockModel } from '../models/stock-model';
import { StockVizService } from './stock-viz.service';

import { Chart, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);
import 'chartjs-plugin-annotation';
import 'chartjs-adapter-moment';
import { lastValueFrom } from 'rxjs';
Chart.defaults.color = '#1f2421';
Chart.defaults.font.size = window.innerWidth > 999 ? 14 : window.innerWidth > 500 ? 12 : window.innerWidth > 1 ? 10 : 10;

@Component({
  selector: 'app-stock-viz',
  templateUrl: './stock-viz.component.html',
  styleUrls: ['./stock-viz.component.css']
})
export class StockVizComponent implements OnInit {

  constructor(private stockService: StockVizService) { }
  stockData: StockModel[] = [];

  //Default ticker
  ticker: string = 'GOOGL';
  tickerValues: string[] = ['AMZN', 'APPL', 'CRM', 'GOOGL', 'META', 'MSFT', 'NFLX', 'SP500', 'TSLA'];

  //Vairables for stock stats
  avgHigh: number;
  minHighData: StockModel | undefined;
  maxHighData: StockModel | undefined;
  bestBuyData: StockModel | undefined;
  bestSellData: StockModel | undefined;
  profit: number;

  //Helps with page & chart rendering
  statsCalculated: boolean = false;
  avgLineToggle: boolean = false;
  bestBuyLineToggle: boolean = false;
  bestSellLineToggle: boolean = false;
  lineChart: Chart;

  ngOnInit(): void {
    //OnInit fetch default ticker data and render chart
    this.onSelectTicker(this.ticker, false)
  }

  async onSelectTicker(tickerSymbol: string, destoryPlot: boolean) {
    //Get the ticker symbol
    this.ticker = tickerSymbol;

    //Reset Checkboxes
    let checkboxAvgLine: any = document.getElementById("avgLineToggleId");
    checkboxAvgLine.checked = false;
    let bestBuyLineToggleId: any = document.getElementById("bestBuyLineToggleId");
    bestBuyLineToggleId.checked = false;
    let bestSellLineToggleId: any = document.getElementById("bestSellLineToggleId");
    bestSellLineToggleId.checked = false;

    //Reset Toggle Values
    this.avgLineToggle = false;
    this.bestBuyLineToggle = false;
    this.bestSellLineToggle = false;

    //Fetch ticker data from Firebase
    this.stockData = await lastValueFrom(this.stockService.getData(this.ticker))

    //Create the line plot from fetched data
    this.createLineChart(this.stockData, destoryPlot);

    //Calculate additional stock stats (eg. high, low, etc.)
    let stockStats = this.stockService.calculateStockStats(this.stockData);
    this.avgHigh = stockStats.avgHigh;
    this.minHighData = stockStats.minHighData;
    this.maxHighData = stockStats.maxHighData;
    this.bestBuyData = stockStats.bestBuyData;
    this.bestSellData = stockStats.bestSellData;
    this.profit = stockStats.profit;
    this.statsCalculated = true;
  }

  createLineChart(stockData: StockModel[], destroy: boolean = false) {
    //Builds a new line chart (destroys the current one if exists)

    if (destroy) {
      this.lineChart.destroy();
    }

    //Extract the dates and high values from the stock data
    const dates = stockData.map(data => data.Date);
    const high = stockData.map(data => data.High);

    //Data for plot
    const data = {
      labels: dates,
      datasets: [{
        label: 'Trading High',
        color: '#49a078',
        data: high,
        borderColor: '#49a078',
        fill: false,
        backgroundColor: '#49a078'
      }]
    }

    //Basic chart config
    let config: ChartConfiguration = {
      type: 'line',
      data,
      options: {
        maintainAspectRatio: true,
        responsive: true,
        scales: {
          x: {
            type: 'time',
            grid: {
              drawOnChartArea: false
            },
            time: {
              parser: 'YYYY-MM-DD'
            },
            title: {
              display: true,
              text: 'Day',
              color: '#1f2421',
              font: {
                size: window.innerWidth > 999 ? 14 : window.innerWidth > 500 ? 12 : window.innerWidth > 1 ? 10 : 10,
                style: 'normal',
                weight: 'bold'
              }
            }
          },
          y: {
            grid: {
              drawOnChartArea: true
            },
            ticks: {
              // Include a dollar sign in the ticks
              callback: function (value, index, ticks) {
                return '$' + value;
              }
            },
            title: {
              display: true,
              text: 'Trading High',
              color: '#1f2421',
              font: {
                size: window.innerWidth > 999 ? 14 : window.innerWidth > 500 ? 12 : window.innerWidth > 1 ? 10 : 10,
                style: 'normal',
                weight: 'bold'
              }
            }
          }
        },
        elements: {
          point: {
            radius: 0
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            align: 'end',
            labels: {
              color: '#1f2421',
              font: {
                size: window.innerWidth > 999 ? 14 : window.innerWidth > 500 ? 12 : window.innerWidth > 1 ? 10 : 10,
                // size: ,
                style: 'normal',
                weight: 'bold'
              }
            }
          },
          tooltip: {
            callbacks: {
              title: function (context) {
                return new Date(context[0].label).toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric" });
              },
              label: function (context) {
                let label = context.dataset.label || '';

                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                }
                return label;
              }
            },
            displayColors: false
          }
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
      },
      //Add in plugins dynamically
      plugins: []
    }

    //Select line-chart element from the DOM
    this.lineChart = new Chart(
      <HTMLCanvasElement>document.getElementById('line-chart'),
      config
    )
  }

  controlAvgLine() {
    //Controls adding and removing the average line
    if (!this.avgLineToggle) {
      const dates = this.stockData.map(data => data.Date);
      const high = this.stockData.map(data => data.High);
      const avgHigh = high.reduce((a, b) => a + b, 0) / high.length;

      //avgHighLine 
      const avgHighLine = {
        id: 'avgHighLine',
        beforeDraw(chart: any, args: any, options: any) {
          const { ctx,
            chartArea: { top, right, bottom, left, width, height },
            scales: {
              x, y
            } } = chart;
          ctx.save();

          ctx.strokeStyle = '#1f2421';
          ctx.lineWidth = 2;
          ctx.strokeRect(left, y.getPixelForValue(avgHigh), right, 1);
          ctx.restore();

          //Adding labels
          // ctx.font = '18px Arial'
          ctx.font = `${width * 0.02}px Arial`
          ctx.fillStyle = '#1f2421'
          ctx.fillText(`Average High $${avgHigh.toFixed(0).toLocaleString()} `, dates.length * .10, y.getPixelForValue(avgHigh) - 15)
        }
      }
      this.lineChart.config.plugins?.push(avgHighLine)
      this.lineChart.update()
      this.avgLineToggle = true;
    } else {
      //remove the line
      if (this.lineChart.config.plugins) {
        let avgHighLineIdx: number;
        for (let i = 0; i < this.lineChart.config.plugins.length; i++) {
          if (this.lineChart.config.plugins[i].id === 'avgHighLine') {
            avgHighLineIdx = i;
            this.lineChart.config.plugins?.splice(avgHighLineIdx, 1)
            this.lineChart.update()
            break;
          }
        }
      }
      this.avgLineToggle = false;
    }
  }

  controlBestBuyLine() {
    //Controls adding and removing the best buy line
    if (!this.bestBuyLineToggle) {
      //Add the line
      if (this.bestBuyData) {
        let bestDay = new Date(this.bestBuyData.Date)
        const bestBuyLine = {
          id: 'bestBuyLine',
          beforeDraw(chart: any, args: any, options: any) {
            const { ctx,
              chartArea: { top, right, bottom, left, width, height },
              scales: {
                x, y
              } } = chart;
            ctx.save();

            //Creating the line
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.beginPath()
            ctx.moveTo(x.getPixelForValue(bestDay), top)
            ctx.lineTo(x.getPixelForValue(bestDay), bottom)
            ctx.stroke()
            ctx.restore();

            //Adding labels
            // ctx.font = '18px Arial'
            ctx.font = `${width * 0.02}px Arial`
            ctx.fillStyle = '#1f2421'
            ctx.fillText(`Buy: ${bestDay.toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric" })} `, x.getPixelForValue(bestDay) + (width * .01), top + (height * .05))
          }
        }
        this.lineChart.config.plugins?.push(bestBuyLine)
        this.lineChart.update()
      }
      this.bestBuyLineToggle = true;
    } else {
      //Remove the line
      if (this.lineChart.config.plugins) {
        let bestBuyLineIdx: number;
        for (let i = 0; i < this.lineChart.config.plugins.length; i++) {
          if (this.lineChart.config.plugins[i].id === 'bestBuyLine') {
            bestBuyLineIdx = i;
            this.lineChart.config.plugins?.splice(bestBuyLineIdx, 1)
            this.lineChart.update()
            break;
          }
        }
      }
      this.bestBuyLineToggle = false;
    }
  }

  controlBestSellLine() {
    //Controls adding and removing the best sell line
    if (!this.bestSellLineToggle) {
      //Add the line
      if (this.bestSellData) {
        let bestDay = new Date(this.bestSellData.Date)
        const bestSellLine = {
          id: 'bestSellLine',
          beforeDraw(chart: any, args: any, options: any) {
            const { ctx,
              chartArea: { top, right, bottom, left, width, height },
              scales: {
                x, y
              } } = chart;
            ctx.save();

            //Creating the line
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.beginPath()
            ctx.moveTo(x.getPixelForValue(bestDay), top)
            ctx.lineTo(x.getPixelForValue(bestDay), bottom)
            ctx.stroke()
            ctx.restore();

            //Adding labels
            // ctx.font = '18px Arial'
            ctx.font = `${width * 0.02}px Arial`
            ctx.fillStyle = '#1f2421'
            ctx.fillText(`Sell: ${bestDay.toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric" })} `, x.getPixelForValue(bestDay) + (width * .01), top + (height * .05))
          }
        }
        this.lineChart.config.plugins?.push(bestSellLine)
        this.lineChart.update()
      }
      this.bestSellLineToggle = true;
    } else {
      //Remove the line
      if (this.lineChart.config.plugins) {
        let bestSellLineIdx: number;
        for (let i = 0; i < this.lineChart.config.plugins.length; i++) {
          if (this.lineChart.config.plugins[i].id === 'bestSellLine') {
            bestSellLineIdx = i;
            this.lineChart.config.plugins?.splice(bestSellLineIdx, 1)
            this.lineChart.update()
            break;
          }
        }
      }
      this.bestSellLineToggle = false;
    }
  }

  resetChart() {
    //Reset the chart if button is selected
    this.onSelectTicker(this.ticker, true)
  }

}




