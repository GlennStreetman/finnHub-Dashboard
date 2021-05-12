import { AppState } from './../../App'
import { reqObj } from './../../slices/sliceExchangeData'

export const updateDefaultExchange = function (this, ex) {
    const s: AppState = this.state
    if (ex.target) {
        const payload: Partial<AppState> = { defaultExchange: ex.target.value }
        this.setState(payload);
        const tGetSymbolObj: reqObj = {
            exchange: ex.target.value,
            apiKey: this.state.apiKey,
            finnHubQueue: s.finnHubQueue,
        }
        this.props.tGetSymbolList(tGetSymbolObj)
    } else {
        const payload: Partial<AppState> = { defaultExchange: ex }
        this.setState(payload);
    }
}