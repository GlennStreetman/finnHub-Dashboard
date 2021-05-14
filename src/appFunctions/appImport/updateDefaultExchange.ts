import { AppState } from './../../App'
import { reqObj } from './../../slices/sliceExchangeData'

export const updateDefaultExchange = function (ex: string, getSymbol: boolean = false) {
    const s: AppState = this.state
    if (getSymbol === true) {
        const payload: Partial<AppState> = { defaultExchange: ex }
        this.setState(payload);
        const tGetSymbolObj: reqObj = {
            exchange: ex,
            apiKey: s.apiKey,
            finnHubQueue: s.finnHubQueue,
        }
        this.props.tGetSymbolList(tGetSymbolObj)
    } else {
        const payload: Partial<AppState> = { defaultExchange: ex }
        this.setState(payload);
    }
}