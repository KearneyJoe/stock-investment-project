import { Injectable } from "@angular/core";
import { CalcModel } from "../models/calc-model";


@Injectable({
    providedIn: "root"
})
export class InvestmentCalcService {

    calculateReturns(formData: CalcModel) {
        let principal = formData.principal;
        let rateOfReturn = (
            formData.rateOfReturn > 0 && formData.rateOfReturn < 1 ? formData.rateOfReturn :
                formData.rateOfReturn / 100)
        let compoundFrequency = (
            formData.compoundFrequency === 'Annually' ? 1 :
                formData.compoundFrequency === 'Quarterly' ? 4 :
                    formData.compoundFrequency === 'Monthly' ? 12 :
                        1
        );
        let investmentHorizon = formData.investmentHorizon;
        let returns: { [key: number]: number[] } = { 0: [formData.principal, 0] }

        for (let i = 1; i <= investmentHorizon; i++) {
            let val = principal * (Math.pow((1 + (rateOfReturn / compoundFrequency)), (compoundFrequency * i)));
            returns[i] = [principal, parseFloat(val.toFixed(2)) - principal]
        }
        return returns
    }

}