function UpdateTickerSockets(context, socket, apiKey, globalStockList, throttle) {
  //opens a series of socket connections to live stream stock prices
  //update limited to once every 3 seconds to have mercy on dom rendering.
  console.log("new socket time")
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
      // console.log('adding event listener----------------')
      thisSocket.addEventListener("open", function (event) {
        USList.map((el) => {
          // console.log("mapping: ", { type: "subscribe", symbol: el })
            throttle.enqueue(function() {
              thisSocket.send(JSON.stringify({ type: "subscribe", symbol: el }))
            })
          return true;
          }
        );
      });

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
            let updatedPrice = Object.assign({}, that.state.trackedStockData);
            for (const prop in streamingStockData) {
              // console.log("thisSTock----->", prop)
              if (updatedPrice[prop] !== undefined) {
                updatedPrice[prop]["currentPrice"] = streamingStockData[prop][0]
            } else {
              // console.log("unsubscribing from: ",tickerReponse.data[0]["s"])
              thisSocket.send(JSON.stringify({'type':'unsubscribe','symbol': tickerReponse.data[0]["s"]}))
            }
            that.setState({ trackedStockData: updatedPrice });
          }
        }
      }})
    } catch(err) {
      console.log("problem setting up socket connections:", err)
    }
  }
  that.setState({socket: thisSocket})
}

function LoadTickerSocket(context, prevState, globalStockList, socket, apiKey, updateTickerSockets, throttle) {
  const that = context
  if (globalStockList !== prevState.globalStockList && throttle !== undefined && apiKey !== ""){
    console.log('updating socket')
    if (socket !== '') { 
      socket.close()
    }
    let newSocket = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`)
    updateTickerSockets(that, newSocket, apiKey, globalStockList, throttle)
  }
}

export {UpdateTickerSockets ,LoadTickerSocket}