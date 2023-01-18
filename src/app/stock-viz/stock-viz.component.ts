import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { StockModel } from '../models/stock-model';
import { StockVizService } from './stock-viz.service';
// import * as d3 from 'd3';

// import * as Chart from 'Chart.js';
// import { Chart } from 'chart.js'
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
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

  onSubmit() {
    this.ticker = this.stockForm.value.ticker;
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

    // create the chart
    const ctx = <HTMLCanvasElement>document.getElementById('line-chart');
    if (ctx) {
      this.lineChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [{
            label: 'High',
            data: high,
            borderColor: '#39FF14',
            fill: false
          }]
        },
        options: {
          scales: {
            x: {
              type: 'time',
              time: {
                parser: 'YYYY-MM-DD'
              }
            }
          }
        }
      });
    } else {
      console.error('Canvas element not found');
    }


  }


}
