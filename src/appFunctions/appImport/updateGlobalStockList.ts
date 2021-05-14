import { AppState } from './../../App'
import { StockObj } from './../../types'

export const updateGlobalStockList = function (event: Event, stockRef: string, stockObj: StockObj | Object = {}) {
    //if no stock object passed, remove from global stock list, else add.
    const s: AppState = this.state;
    const currentStockObj = { ...s.globalStockList };
    if (currentStockObj[stockRef] === undefined) {
        currentStockObj[stockRef] = { ...stockObj };
        currentStockObj[stockRef]["dStock"] = function (ex: string) {
            if (ex.length === 1) {
                return this.symbol;
            } else {
                return this.key;
            }
        };
    } else {
        delete currentStockObj[stockRef];
    }
    const payload: Partial<AppState> = { globalStockList: currentStockObj }
    this.setState(payload);
    event instanceof Event === true && event.preventDefault();
}