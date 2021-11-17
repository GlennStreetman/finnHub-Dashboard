// import { AppState, AppProps } from './../../App'
import { reqObj } from './../../slices/sliceExchangeData'
import { rSetDefaultExchange } from './../../slices/sliceDefaultExchange'
import { tGetSymbolList } from './../../slices/sliceExchangeData'


export const UpdateDefaultExchange = function (dispatch: Function, exchange: string, apiKey, finnHubQueue: any, getSymbol: boolean = false) {
    if (getSymbol === true) {
        dispatch(rSetDefaultExchange(exchange))
        const tGetSymbolObj: reqObj = {
            exchange: exchange,
            apiKey: apiKey,
            finnHubQueue: finnHubQueue,
        }
        dispatch(tGetSymbolList(tGetSymbolObj))
    } else {
        dispatch(rSetDefaultExchange(exchange))
    }
}