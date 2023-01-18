import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs";
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

}