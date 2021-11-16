import { AppState, AppProps } from './../../App'
import { reqObj } from './../../slices/sliceExchangeData'

export const updateDefaultExchange = function (exchange: string, apiKey, getSymbol: boolean = false,) {
    const s: AppState = this.state
    const p: AppProps = this.props
    if (getSymbol === true) {
        p.rSetDefaultExchange(exchange)
        const tGetSymbolObj: reqObj = {
            exchange: exchange,
            apiKey: apiKey,
            finnHubQueue: s.finnHubQueue,
        }
        this.props.tGetSymbolList(tGetSymbolObj)
    } else {
        const p: AppProps = this.props
        p.rSetDefaultExchange(exchange)
    }
}