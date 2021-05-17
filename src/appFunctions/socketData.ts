import { AppState, globalStockList } from './../App'

function UpdateTickerSockets(context: { state: AppState, setState: Function }, socket: any, apiKey: string, globalStockList: globalStockList) {
    //opens a series of socket connections to live stream stock prices
    //update limited to once every 3 seconds to have mercy on dom rendering.
    if (apiKey !== undefined && apiKey !== '' && apiKey.indexOf('sandbox') === -1) {
        let USList: string[] = [] //only subscribe to US stocks
        for (const stock in globalStockList) {
            const gs = globalStockList[stock]
            if (gs.exchange === 'US') {
                USList.push(gs.symbol)
            }
        }
        let thisSocket = socket
        let streamingStockData: { [key: string]: any } = {};
        let lastUpdate = new Date().getTime();
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
                        streamingStockData['US-' + tickerReponse.data[0]["s"]] = [tickerReponse.data[0]["p"]];
                        let checkTime = new Date().getTime();
                        if (checkTime - lastUpdate > 5000) {
                            lastUpdate = new Date().getTime();
                            let updatedPrice = Object.assign({}, that.state.streamingPriceData);
                            for (const prop in streamingStockData) {
                                if (updatedPrice[prop] !== undefined) {
                                    updatedPrice[prop]["currentPrice"] = streamingStockData[prop][0]
                                } else {
                                    thisSocket.send(JSON.stringify({ 'type': 'unsubscribe', 'symbol': tickerReponse.data[0]["s"] }))
                                }
                            }
                            const payload: Partial<AppState> = { streamingPriceData: updatedPrice }
                            that.setState(payload);
                        }
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

function LoadTickerSocket(context: { state: AppState, setState: Function }, prevState: AppState, globalStockList: globalStockList, socket: any, apiKey: string, updateTickerSockets: Function) {
    const that = context
    if (globalStockList !== prevState.globalStockList && apiKey !== "") {
        if (socket === '' && apiKey !== undefined && apiKey !== '' && apiKey.indexOf('sandbox') === -1) {
            socket = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`)
        }
        updateTickerSockets(that, socket, apiKey, globalStockList)
    }
}

export { UpdateTickerSockets, LoadTickerSocket }