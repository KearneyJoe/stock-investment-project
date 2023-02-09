import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CalcModel } from "../models/calc-model";
import { InvestmentCalcService } from './investment-calc.service';

import { Chart, ChartConfiguration, registerables } from 'chart.js';
Chart.register(...registerables);
import 'chartjs-plugin-annotation';
import 'chartjs-adapter-moment';
Chart.defaults.color = '#1f2421';
Chart.defaults.font.size = window.innerWidth > 999 ? 14 : window.innerWidth > 500 ? 12 : window.innerWidth > 1 ? 10 : 10;


@Component({
  selector: 'app-investment-calc',
  templateUrl: './investment-calc.component.html',
  styleUrls: ['./investment-calc.component.css']
})
export class InvestmentCalcComponent implements OnInit {
  principal: any;

  constructor(private investmentCalcService: InvestmentCalcService) { }

  investmentForm: FormGroup;
  compoundFrequencyOptions = ['Annually', 'Quarterly', 'Monthly']
  formDefaults: CalcModel = {
    principal: 10000,
    rateOfReturn: 7,
    compoundFrequency: this.compoundFrequencyOptions[0],
    investmentHorizon: 30
  }
  portfolioValue: number;
  lineChart: Chart;
  returns: { [key: number]: number[] };


  ngOnInit(): void {
    this.investmentForm = new FormGroup({
      principal: new FormControl(this.formDefaults.principal,
        Validators.compose([
          Validators.required,
          Validators.min(100),
          Validators.max(1000000)])
      ),
      rateOfReturn: new FormControl(this.formDefaults.rateOfReturn,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(20)])
      ),
      compoundFrequency: new FormControl(this.formDefaults.compoundFrequency, Validators.required),
      investmentHorizon: new FormControl(this.formDefaults.investmentHorizon,
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(50)])
      ),
    })
    this.returns = this.investmentCalcService.calculateReturns(this.formDefaults)
    this.portfolioValue = this.returns[this.formDefaults.investmentHorizon][0] + this.returns[this.formDefaults.investmentHorizon][1]
    this.createBarChart(this.returns, false)
  }

  onSubmit(investmentFormInput: FormGroup) {

    this.formDefaults.principal = investmentFormInput.value.principal;
    this.formDefaults.rateOfReturn = investmentFormInput.value.rateOfReturn;
    this.formDefaults.compoundFrequency = investmentFormInput.value.compoundFrequency;
    this.formDefaults.investmentHorizon = investmentFormInput.value.investmentHorizon;

    //send the data to stock service & store in returns
    this.returns = this.investmentCalcService.calculateReturns(investmentFormInput.value)
    this.portfolioValue = this.returns[this.formDefaults.investmentHorizon][0] + this.returns[this.formDefaults.investmentHorizon][1]
    //Create a new bar chart with new data
    this.createBarChart(this.returns, true)
  }

  createBarChart(returns: { [key: number]: number[] }, destroy: boolean = false) {

    //Extract the dates and high values from the stock data
    const principalData = Object.values(returns).map(data => data[0])
    const returnData = Object.values(returns).map(data => data[1])
    const returnYears = Object.keys(returns)

    //Builds a new line chart (destroys the current one if exists)
    if (destroy) {
      this.lineChart.destroy();
    }

    //Data for plot
    const data = {
      labels: returnYears,
      datasets: [
        {
          label: 'Principal',
          color: '#dce1de',
          data: principalData,
          borderColor: '#dce1de',
          fill: false,
          backgroundColor: '#dce1de'
        },
        {
          label: 'Returns',
          color: '#49a078',
          data: returnData,
          borderColor: '#49a078',
          fill: false,
          backgroundColor: '#49a078'
        },
      ]
    }

    //Basic chart config
    let config: ChartConfiguration = {
      type: 'bar',
      data,
      options: {
        maintainAspectRatio: true,
        responsive: true,
        scales: {
          x: {
            stacked: true,
            grid: {
              drawOnChartArea: false
            },
            title: {
              display: true,
              text: 'Years',
              color: '#1f2421',
              font: {
                // size: 16,
                size: window.innerWidth > 999 ? 14 : window.innerWidth > 500 ? 12 : window.innerWidth > 1 ? 10 : 10,
                style: 'normal',
                weight: 'bold'
              }
            }
          },
          y: {
            stacked: true,
            grid: {
              drawOnChartArea: true
            },
            ticks: {
              // Include a dollar sign in the ticks and shorten numbers
              // return '$' + value; in OG callback
              callback: function (value, index, ticks) {
                const suffixes = ['K', 'M', 'B', 'T'];
                const len = value.toString().length;
                const s = Math.floor((len - 1) / 3);
                if (s === 0) return "$" + value.toString();
                let shortened = (Number(value) / Math.pow(10, 3 * s));
                shortened = parseFloat(shortened.toFixed(1));
                return (shortened % 1 === 0) ? "$" + Number(shortened.toFixed(0)).toString() + suffixes[s - 1] : "$" + shortened.toString() + suffixes[s - 1];
              }
            },
            title: {
              display: true,
              text: 'Portfolio Value',
              color: '#1f2421',
              font: {
                // size: 16,
                size: window.innerWidth > 999 ? 14 : window.innerWidth > 500 ? 12 : window.innerWidth > 1 ? 10 : 10,
                style: 'normal',
                weight: 'bold'
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            align: 'end',
            labels: {
              color: '#1f2421',
              font: {
                // size: 14,
                size: window.innerWidth > 999 ? 14 : window.innerWidth > 500 ? 12 : window.innerWidth > 1 ? 10 : 10,
                style: 'normal',
                weight: 'bold'
              }
            }
          },
          tooltip: {
            callbacks: {
              title: function (context) {
                return "Year " + context[0].label;
              },
              label: function (context) {
                // let label = context.dataset.label || '';
                // if (label) {
                //   label += ': ';
                // }
                // if (context.parsed.y !== null) {
                //   label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(context.parsed.y);
                // }
                return "+";
              },
              beforeBody: function (context) {
                let returns: any | undefined = context[0].parsed._stacks !== undefined ? context[0].parsed._stacks['y']['1'] : 0
                return "Returns: " + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(parseInt(returns));
              },
              afterBody: function (context) {
                let principal: any | undefined = context[0].parsed._stacks !== undefined ? context[0].parsed._stacks['y']['0'] : 0
                return "Principal: " + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(parseInt(principal));
              },
              beforeFooter: function (context) {
                return "-------------------------------"
              },
              afterFooter(context) {
                let principal: any | undefined = context[0].parsed._stacks !== undefined ? context[0].parsed._stacks['y']['0'] : 0
                let returns: any | undefined = context[0].parsed._stacks !== undefined ? context[0].parsed._stacks['y']['1'] : 0
                return "Portfolio Value: " + new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(parseInt(principal + returns));
              }
            },
            //Tooltip formats
            displayColors: false,
            backgroundColor: '#1f2421E6',
            titleAlign: 'left',
            bodyAlign: 'right',
            footerAlign: 'right',
            footerColor: '#fb8500'
          }
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


  resizing: any;
  onResize(event: any) {
    if (innerWidth < 760) {
      clearTimeout(this.resizing);
      this.resizing = setTimeout(() => {
        // Rebuild chart
        Chart.defaults.font.size = window.innerWidth > 999 ? 14 : window.innerWidth > 500 ? 12 : window.innerWidth > 1 ? 10 : 10;
        this.createBarChart(this.returns, true)
      }, 250);
    }
  }








}
