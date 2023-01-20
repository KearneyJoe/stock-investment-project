import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { StockModel } from '../models/stock-model';
import { StockVizService } from './stock-viz.service';
// import 'chartjs-plugin-annotation';
// // import * as d3 from 'd3';

import { Chart, ChartType, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);
import 'chartjs-plugin-annotation';
// import ChartAnnotation from 'chartjs-plugin-annotation';
// import { Chart, ChartConfiguration } from 'chart.js';


import 'chartjs-adapter-moment';
import { _capitalize } from 'chart.js/dist/helpers/helpers.core';

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
  stockForm: FormGroup;
  statsCalculated: boolean = false;
  tickerValues: string[] = ['AMZN', 'APPL', 'CRM', 'GOOGL', 'META', 'MSFT', 'NFLX', 'SP500', 'TSLA'];
  private lineChart: Chart;

  ngOnInit(): void {
    this.stockData = this.stockService.getData(this.ticker);
    this.stockForm = new FormGroup({
      ticker: new FormControl(this.ticker)
    });
    this.createLineChart(this.stockData);
    let stockStats = this.stockService.calculateStockStats(this.stockData);
    this.avgHigh = stockStats.avgHigh;
    this.minHighData = stockStats.minHighData;
    this.maxHighData = stockStats.maxHighData;
    this.bestBuyData = stockStats.bestBuyData;
    this.bestSellData = stockStats.bestSellData;
    this.profit = stockStats.profit;
    this.statsCalculated = true;
  }

  onSelectTicker(tickerSymbol: string) {
    this.ticker = tickerSymbol;
    this.stockData = this.stockService.getData(this.ticker);
    this.createLineChart(this.stockData, true);
    this.stockService.bestBuyAndSell(this.stockData);
  }

  createLineChart(stockData: StockModel[], destroy: boolean = false) {
    if (destroy) {
      this.lineChart.destroy();
    }
    // extract the dates and high values from the stock data
    const dates = stockData.map(data => data.Date);
    const high = stockData.map(data => data.High);
    const avgHigh = high.reduce((a, b) => a + b, 0) / high.length;

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
    const config: ChartConfiguration = {
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


  addAvgLine() {
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
        // ctx.strokeRect(left, chart.getDatasetMeta(0).data[650].y, right, 1)
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
  }

  removeAvgLine() {
    if (this.lineChart.config.plugins) {
      let avgHighLineIdx: any
      for (let i = 0; i < this.lineChart.config.plugins.length; i++) {
        if (this.lineChart.config.plugins[i].id === 'avgHighLine') {
          this.lineChart.config.plugins?.splice(avgHighLineIdx, 1)
          this.lineChart.update()
          break;
        }
      }
    }
  }


  addBestBuyLine() {
    const dates = this.stockData.map(data => data.Date);
    //avgHighLine line
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

          ctx.strokeStyle = 'red';
          ctx.moveTo(x.getPixelForValue(bestDay), top)
          ctx.lineTo(x.getPixelForValue(bestDay), bottom)
          ctx.stroke()
          ctx.restore();

          //Adding labels
          ctx.font = '18px Arial'
          ctx.fillStyle = 'black'
          // ctx.fillText(`BESTBUY`, TKTK.length * .05, y.getPixelForValue(TKTKTk) - 15)

        }
      }
      this.lineChart.config.plugins?.push(bestBuyLine)
      this.lineChart.update()
    }
  }
}
