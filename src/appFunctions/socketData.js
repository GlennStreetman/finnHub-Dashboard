function UpdateTickerSockets(context, socket, apiKey, globalStockList) {
  // console.log('updateTickers', context, socket, apiKey, globalStockList)
  //opens a series of socket connections to live stream stock prices
  //update limited to once every 3 seconds to have mercy on dom rendering.
  let USList = [] //only subscribe to US stocks
  for (const stock in globalStockList) {
    const gs = globalStockList[stock]
    if (gs.exchange === 'US') {
      USList.push(gs.symbol)
    } 
  }
  // console.log('socket stockList: ', USList)
  let thisSocket = socket
  let streamingStockData = {};
  let lastUpdate = new Date().getTime();
  let that = context
  
  if (apiKey !== '' && USList !== []) {
    
  try { 
    // console.log("USLIST", USList)
    for (const stock in USList) {
      thisSocket.addEventListener("open", function (event) {
        // console.log('SOCKET OPEN', { type: "subscribe", symbol: USList[stock] })
        thisSocket.send(JSON.stringify({ type: "subscribe", symbol: USList[stock] }))
      })
    }

      // Listen for messages
      thisSocket.addEventListener("message", function (event) {
        // console.log('Message from server ', event.data);
        let tickerReponse = JSON.parse(event.data);
        if (tickerReponse.data) {  
          streamingStockData['US-' + tickerReponse.data[0]["s"]] = [tickerReponse.data[0]["p"]];
          let checkTime = new Date().getTime();
          // console.log("Message from server ", event.data);
          if (checkTime - lastUpdate > 3000) {
            lastUpdate = new Date().getTime();
            let updatedPrice = Object.assign({}, that.state.streamingPriceData);
            for (const prop in streamingStockData) {
              if (updatedPrice[prop] !== undefined) {
                updatedPrice[prop]["currentPrice"] = streamingStockData[prop][0]
            } else {
              // console.log("unsubscribing from: ",tickerReponse.data[0]["s"])
              thisSocket.send(JSON.stringify({'type':'unsubscribe','symbol': tickerReponse.data[0]["s"]}))
            }
            that.setState({ streamingPriceData: updatedPrice });
          }
        }
      }})
    } catch(err) {
      console.log("problem setting up socket connections:", err)
    }
  }
  that.setState({socket: thisSocket})
}

function LoadTickerSocket(context, prevState, globalStockList, socket, apiKey, updateTickerSockets) {
  // console.log("SOCKETS", context, prevState, globalStockList, socket, apiKey, updateTickerSockets)
  const that = context
  if (globalStockList !== prevState.globalStockList && apiKey !== ""){
    // console.log('updating socket')
    // if (socket !== '') { 
    //   socket.close()
    // }
    // let newSocket = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`)
    if (socket === '') {
      socket = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`)
    }
    updateTickerSockets(that, socket, apiKey, globalStockList)
  }
}

export {UpdateTickerSockets ,LoadTickerSocket}