import { AppState, globalStockList } from './../App'
import { rUpdarUpdateQuotePricePayload } from './../slices/sliceQuotePrice'

function UpdateTickerSockets(context: any, socket: any, apiKey: string, globalStockList: globalStockList) {
    //opens a series of socket connections to live stream stock prices
    //update limited to once every 3 seconds to have mercy on dom rendering.
    if (apiKey !== undefined && apiKey !== '' && apiKey.indexOf('sandbox') === -1) {
        let USList: string[] = [] //only subscribe to US stocks
        for (const stock in globalStockList) {
            const stockObj = globalStockList[stock]
            if (stockObj.exchange === 'US') {
                USList.push(stockObj.symbol)
            }
        }
        let thisSocket = socket
        let updatePaylaod: rUpdarUpdateQuotePricePayload = {};
        // let lastUpdate = new Date().getTime();
        let that = context

        if (apiKey !== '' && USList !== []) {
            try {
                for (const stock in USList) {
                    thisSocket.addEventListener("open", function () {
                        thisSocket.send(JSON.stringify({ type: "subscribe", symbol: USList[stock] }))
                    })
                }

                // Listen for messages
                thisSocket.addEventListener("message", function (event: any) {
                    let tickerReponse = JSON.parse(event.data);
                    if (tickerReponse.data) {
                        const response = tickerReponse.data
                        for (const stock in response) {
                            const symbol = `US-${response[stock].s}`
                            const newPrice = response[stock].p
                            globalStockList[symbol] ? updatePaylaod[symbol] = newPrice : //if not defined unsubscribe
                                thisSocket.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': symbol }))

                        }
                        context.props.rUpdateQuotePriceStream(updatePaylaod)
                        // const newPrice: number = tickerReponse.data[0]["p"]
                        // streamingStockData['US-' + tickerReponse.data[0]["s"]] = newPrice;
                        // let checkTime = new Date().getTime();
                        // if (checkTime - lastUpdate > 5000) {
                        //     lastUpdate = new Date().getTime();
                        //     // let updatedPrice = Object.assign({}, that.state.streamingPriceData);
                        //     for (const prop in streamingStockData) {
                        //         if (updatedPrice[prop] !== undefined) {
                        //             updatedPrice[prop]["currentPrice"] = streamingStockData[prop][0]
                        //         } else {
                        //             thisSocket.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': tickerReponse.data[0]["s"] }))
                        //         }
                        //     }
                        // const payload: Partial<AppState> = { streamingPriceData: updatedPrice }
                        // that.setState(payload);
                        // }
                    }
                })
            } catch (err) {
                console.log("problem setting up socket connections:", err)
            }
        }
        const payload: Partial<AppState> = { socket: thisSocket }
        that.setState(payload)
    }
}

function LoadTickerSocket(context: any, prevState: AppState, globalStockList: globalStockList, socket: any, apiKey: string, updateTickerSockets: Function) {
    const that = context
    //    /console.log('SOCKET', apiKey)
    if (globalStockList !== prevState.globalStockList && apiKey !== "" && apiKey) {
        if (socket === '' && apiKey !== undefined && apiKey !== '' && apiKey.indexOf('sandbox') === -1) {
            socket = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`)
        }
        updateTickerSockets(that, socket, apiKey, globalStockList)
    }
}

export { UpdateTickerSockets, LoadTickerSocket }