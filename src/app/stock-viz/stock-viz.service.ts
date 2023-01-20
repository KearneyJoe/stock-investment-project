import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { max, min } from "moment";
// import { environment } from "../environments/environment";
import { StockModel } from "../models/stock-model";
import { stockData } from "./stock_data_updated";


@Injectable({
    providedIn: "root"
})
export class StockVizService {

    constructor(private http: HttpClient) { }

    END_POINT = 'https://investment-tools-project-default-rtdb.firebaseio.com/stocks.json?print=pretty'
    ticker = 'SP500'

    // GET DATA FROM FIREBASE
    // getData() { 
    //     return this.http.get<StockModel[]>(this.END_POINT)
    // }

    getData(ticker: string = this.ticker) {
        const data: StockModel[] = stockData.stocks
        let filteredData: StockModel[] = []
        for (let i = 0; i < data.length; i++) {
            if (data[i].Ticker === ticker) {
                filteredData.push(data[i])
            }
        }
        return filteredData
    }

    bestBuyAndSell(stockData: StockModel[]) {
        let buy = 0;
        let bestBuyIdx = 0;
        let sell = 1;
        let bestSellIdx = 1;
        let profit = 0;

        while (sell < stockData.length) {
            if (stockData[buy].High >= stockData[sell].High) {
                buy = sell
                sell = sell + 1
            } else {
                if (stockData[sell].High - stockData[buy].High > profit) {
                    profit = stockData[sell].High - stockData[buy].High
                    bestBuyIdx = buy
                    bestSellIdx = sell
                }
                sell += 1
            }
        }
        return {
            profit: profit,
            bestBuyIdx: bestBuyIdx,
            bestSellIdx: bestSellIdx,
        }
    }

    calculateStockStats(stockData: StockModel[]) {

        //TODO: Call best buy and sell in here
        let maxHigh = 0;
        let maxHighData: StockModel | undefined;
        let minHigh = null;
        let minHighData: StockModel | undefined;

        let avgHigh = stockData.reduce((a, b) => a + b.High, 0) / stockData.length
        for (let day of stockData) {

            //Find Max
            if (day.High > maxHigh) {
                maxHigh = day.High
                maxHighData = day
            }

            //Find min
            if (minHigh === null || day.High < minHigh) {
                minHigh = day.High
                minHighData = day
            }
        }
        let bestDaysData = this.bestBuyAndSell(stockData)

        return {
            avgHigh: avgHigh,
            minHighData: minHighData,
            maxHighData: maxHighData,
            bestBuyData: stockData[bestDaysData.bestBuyIdx],
            bestSellData: stockData[bestDaysData.bestSellIdx],
            profit: bestDaysData.profit
        }
    }

}