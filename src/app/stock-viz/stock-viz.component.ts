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
  ticker: string = 'SP500';
  stockForm: FormGroup;
  tickerValues: string[] = ['AMZN', 'APPL', 'CRM', 'GOOGL', 'META', 'MSFT', 'NFLX', 'SP500', 'TSLA'];
  private lineChart: Chart;

  ngOnInit(): void {
    this.stockData = this.stockService.getData(this.ticker)
    this.stockForm = new FormGroup({
      ticker: new FormControl(this.ticker)
    });
    this.createLineChart(this.stockData);
  }

  onSubmit() {
    this.ticker = this.stockForm.value.ticker
    this.stockData = this.stockService.getData(this.ticker)
    this.createLineChart(this.stockData, true);
  }

  createLineChart(stockData: StockModel[], destroy: boolean = false) {
    if (destroy) {
      this.lineChart.destroy()
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





  // private createSvg(): void {
  //   // set the dimensions and margins of the graph
  //   var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  //     width = 460 - margin.left - margin.right,
  //     height = 400 - margin.top - margin.bottom;

  //   // append the svg object to the body of the page
  //   this.svg = d3.select("#my_dataviz")
  //     .append("svg")
  //     .attr("width", width + margin.left + margin.right)
  //     .attr("height", height + margin.top + margin.bottom)
  //     .append("g")
  //     .attr("transform",
  //       "translate(" + margin.left + "," + margin.top + ")");
  // }


  // private drawplot(data: StockModel[]): void {
  //   this.createSvg();

  //   interface DataPoint {
  //     date: Date;
  //     high: number;
  //   }

  //   let plotData: DataPoint[] = []
  //   let maxHigh = 0;
  //   for (let i of data) {
  //     let date = new Date(i.Date);
  //     if (date) {
  //       plotData.push({
  //         date: date,
  //         high: i.High
  //       });
  //     }
  //     if (i.High > maxHigh) {
  //       maxHigh = i.High
  //     }
  //   }

  //   var xScale = d3.scaleLinear()
  //     .domain([2018, 2022])
  //     .range([0, this.width]);

  //   this.svg.append("g")
  //     .attr("transform", "translate(0," + this.height + ")")
  //     .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));


  //   var yScale = d3.scaleLinear()
  //     .domain([0, maxHigh])
  //     .range([this.height, 0]);

  //   this.svg.append("g")
  //     .call(d3.axisLeft(yScale));

  //   // Add the line
  //   this.svg.append("path")
  //     .datum(plotData)
  //     .attr("fill", "none")
  //     .attr("stroke", "steelblue")
  //     .attr("stroke-width", 1.5)
  //     .attr("d", d3.line()
  //       .x(function (d) { return xScale(d.date) })
  //       .y(function (d) { return yScale(d.high) })
  //     )
  // }

}
