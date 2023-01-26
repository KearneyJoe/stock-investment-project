import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from 'rxjs/operators';

// import { environment } from "../environments/environment";
import { StockModel } from "../models/stock-model";


@Injectable({
    providedIn: "root"
})
export class StockVizService {

    constructor(private http: HttpClient) { }

    END_POINT = 'https://investment-tools-project-default-rtdb.firebaseio.com/stocks.json?'
    ticker = 'GOOGL' //Default

    // GET DATA FROM FIREBASE
    getData(ticker: string = this.ticker) {
        return this.http.get<StockModel[]>(this.END_POINT + `orderBy="Ticker"&equalTo="${ticker}"`)
            .pipe(
                map(data => {
                    let dataAdjusted = []
                    for (let key of Object.keys(data)) {
                        let keyAdj: number = Number(key)
                        dataAdjusted.push(data[keyAdj])
                    }
                    return dataAdjusted
                })
            )
    }

    // GET LOCALLY STORED DATA
    // getData(ticker: string = this.ticker) {
    //     const data: StockModel[] = stockData.stocks
    //     let filteredData: StockModel[] = []
    //     for (let i = 0; i < data.length; i++) {
    //         if (data[i].Ticker === ticker) {
    //             filteredData.push(data[i])
    //         }
    //     }
    //     return filteredData
    // }

    bestBuyAndSell(stockData: StockModel[]) {
        //O(n) algorthim to find best time to buy and sell a stock
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
        //Calculates the stock stats and calls best time to buy and sell
        let maxHigh = 0;
        let maxHighData: StockModel | undefined;
        let minHigh = null;
        let minHighData: StockModel | undefined;

        let avgHigh = stockData.reduce((a, b) => a + b.High, 0) / stockData.length
        for (let day of stockData) {

            //Find max
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