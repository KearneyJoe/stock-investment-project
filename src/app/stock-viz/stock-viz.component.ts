import { Component, OnInit } from '@angular/core';
import { StockModel } from '../models/stock-model';
import { StockVizService } from './stock-viz.service';

import { Chart, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);
import 'chartjs-plugin-annotation';
import 'chartjs-adapter-moment';

@Component({
  selector: 'app-stock-viz',
  templateUrl: './stock-viz.component.html',
  styleUrls: ['./stock-viz.component.css']
})
export class StockVizComponent implements OnInit {

  constructor(private stockService: StockVizService) { }
  stockData: StockModel[] = [];
  ticker: string = 'GOOGL';
  avgHigh: number;
  minHighData: StockModel | undefined;
  maxHighData: StockModel | undefined;
  bestBuyData: StockModel | undefined;
  bestSellData: StockModel | undefined;
  profit: number;
  statsCalculated: boolean = false;
  avgLineToggle: boolean = false;
  bestBuyLineToggle: boolean = false;
  bestSellLineToggle: boolean = false;
  tickerValues: string[] = ['AMZN', 'APPL', 'CRM', 'GOOGL', 'META', 'MSFT', 'NFLX', 'SP500', 'TSLA'];
  lineChart: Chart;

  ngOnInit(): void {
    this.onSelectTicker(this.ticker, false)
  }

  onSelectTicker(tickerSymbol: string, destoryPlot: boolean) {
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

    this.stockData = this.stockService.getData(this.ticker);
    this.createLineChart(this.stockData, destoryPlot);
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
    if (destroy) {
      this.lineChart.destroy();
    }

    // extract the dates and high values from the stock data
    const dates = stockData.map(data => data.Date);
    const high = stockData.map(data => data.High);

    //Data for plot
    const data = {
      labels: dates,
      datasets: [{
        label: 'High',
        data: high,
        borderColor: '#39FF14',
        fill: false
      }]
    }

    //Basic chart config
    let config: ChartConfiguration = {
      type: 'line',
      data,
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              parser: 'YYYY-MM-DD'
            }
          }
        }
      },
      //Add in plugins dynamically
      plugins: []
    }

    this.lineChart = new Chart(
      <HTMLCanvasElement>document.getElementById('line-chart'),
      config
    )
  }

  controlAvgLine() {
    if (!this.avgLineToggle) {
      const dates = this.stockData.map(data => data.Date);
      const high = this.stockData.map(data => data.High);
      const avgHigh = high.reduce((a, b) => a + b, 0) / high.length;

      //avgHighLine line
      const avgHighLine = {
        id: 'avgHighLine',
        beforeDraw(chart: any, args: any, options: any) {
          const { ctx,
            chartArea: { top, right, bottom, left, width, height },
            scales: {
              x, y
            } } = chart;
          ctx.save();

          ctx.strokeStyle = 'blue';
          ctx.strokeRect(left, y.getPixelForValue(avgHigh), right, 1);
          ctx.restore();

          //Adding labels
          ctx.font = '18px Arial'
          ctx.fillStyle = 'black'
          ctx.fillText(`Average High $${avgHigh.toFixed(0).toLocaleString()}`, dates.length * .05, y.getPixelForValue(avgHigh) - 15)

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
            ctx.moveTo(x.getPixelForValue(bestDay), top)
            ctx.lineTo(x.getPixelForValue(bestDay), bottom)
            ctx.stroke()
            ctx.restore();

            //Adding labels
            ctx.font = '18px Arial'
            ctx.fillStyle = 'black'
            ctx.fillText(`Buy: ${bestDay.toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric" })}`, x.getPixelForValue(bestDay) + (width * .01), top)
          }
        }
        this.lineChart.config.plugins?.push(bestBuyLine)
        this.lineChart.update()
      }
      this.bestBuyLineToggle = true;
    } else {
      //remove the line
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
            ctx.moveTo(x.getPixelForValue(bestDay), top)
            ctx.lineTo(x.getPixelForValue(bestDay), bottom)
            ctx.stroke()
            ctx.restore();

            //Adding labels
            ctx.font = '18px Arial'
            ctx.fillStyle = 'black'
            ctx.fillText(`Sell: ${bestDay.toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric" })}`, x.getPixelForValue(bestDay) + (width * .01), top)
          }
        }
        this.lineChart.config.plugins?.push(bestSellLine)
        this.lineChart.update()
      }
      this.bestSellLineToggle = true;
    } else {
      //remove the line
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
    this.onSelectTicker(this.ticker, true)
  }


}




