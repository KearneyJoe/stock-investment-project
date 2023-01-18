import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { InvestmentCalcComponent } from "./investment-calc/investment-calc.component";
import { StockVizComponent } from "./stock-viz/stock-viz.component";


const appRoutes: Routes = [
    { path: '', redirectTo: '/stock-viz', pathMatch: 'full' },
    { path: 'stock-viz', pathMatch: 'full', component: StockVizComponent },
    { path: 'investment-calc', pathMatch: 'full', component: InvestmentCalcComponent }
];


@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule]
})
export class AppRoutingModule {

}