import { globalStockList } from "./../App";
import { rUpdarUpdateQuotePricePayload } from "./../slices/sliceQuotePrice";

function UpdateTickerSockets(
    socket: any,
    apiKey: string,
    globalStockList: globalStockList,
    socketUpdate: number,
    updateAppState: Object,
    rUpdateQuotePriceStream: Function,
    dispatch: Function
) {
    // opens a series of socket connections to live stream stock prices
    // update limited to once every 3 seconds to have mercy on dom rendering.
    if (
        apiKey !== undefined &&
        apiKey !== "" &&
        apiKey.indexOf("sandbox") === -1
    ) {
        console.log("updateTickerSOckets fired", apiKey);
        let USList: string[] = []; //only subscribe to US stocks
        for (const stock in globalStockList) {
            const stockObj = globalStockList[stock];
            if (stockObj.exchange === "US") {
                USList.push(stockObj.symbol);
            }
        }
        let thisSocket = socket;
        let updatePaylaod: rUpdarUpdateQuotePricePayload = {};
        // let lastUpdate = new Date().getTime();
        if (apiKey !== "" && USList !== [] && !apiKey.includes("sandbox")) {
            try {
                for (const stock in USList) {
                    thisSocket.addEventListener("open", function () {
                        thisSocket.send(
                            JSON.stringify({
                                type: "subscribe",
                                symbol: USList[stock],
                            })
                        );
                    });
                }
                // Listen for messages
                thisSocket.addEventListener("message", function (event: any) {
                    let tickerReponse = JSON.parse(event.data);
                    if (tickerReponse.data) {
                        const response = tickerReponse.data;
                        for (const stock in response) {
                            const symbol = `US-${response[stock].s}`;
                            const newPrice = response[stock].p;
                            globalStockList[symbol]
                                ? (updatePaylaod[symbol] = newPrice) //if not defined unsubscribe
                                : thisSocket.send(
                                      JSON.stringify({
                                          type: "unsubscribe",
                                          symbol: symbol,
                                      })
                                  );
                        }
                        // console.log('socketdata')
                        if (Date.now() - socketUpdate > 5000) {
                            //throttle update rate.
                            // console.log('commiting socket data')
                            const newStamp = Date.now();
                            updateAppState["socketUpdate"](newStamp);
                            dispatch(rUpdateQuotePriceStream(updatePaylaod));
                        }
                    }
                });
            } catch (err) {
                console.log("problem setting up socket connections:", err);
            }
        }
        updateAppState["socket"](thisSocket);
    }
}

function LoadTickerSocket(
    globalStockList: globalStockList,
    socket: any,
    apiKey: string,
    socketUpdate: number,
    updateAppState: Object,
    rUpdateQuotePriceStream: Function,
    dispatch: Function
) {
    //convert in useEffect
    if (apiKey && apiKey !== "" && !apiKey.includes("sandbox")) {
        if (
            socket === "" &&
            apiKey !== undefined &&
            apiKey !== "" &&
            apiKey.indexOf("sandbox") === -1
        ) {
            socket = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);
        }
        UpdateTickerSockets(
            socket,
            apiKey,
            globalStockList,
            socketUpdate,
            updateAppState,
            rUpdateQuotePriceStream,
            dispatch
        );
    }
}

export { LoadTickerSocket };
