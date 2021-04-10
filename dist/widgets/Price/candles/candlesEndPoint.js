import types from './../../../types';
export default function candleWidgetEndPoint(stockList, filters, apiKey) {
    //filters should be: start, end, resolution
    // console.log('NEW FILTERS!!!', Object.keys(filters))
    const now = Date.now();
    const startUnixOffset = filters.startDate !== undefined ? filters.startDate : 604800;
    const startUnix = Math.floor((now - startUnixOffset) / 1000);
    const endUnixOffset = filters.startDate !== undefined ? filters.endDate : 0;
    const endUnix = Math.floor((now - endUnixOffset) / 1000);
    const resolution = filters.resolution;
    let queryStringObj = {};
    for (const stock in stockList) {
        // console.log(theseFilters, Object.keys(theseFilters))
        const key = stockList[stock].key;
        const stockSymbol = stockList[stock].symbol;
        const queryString = "https://finnhub.io/api/v1/stock/candle?symbol=" +
            stockSymbol +
            "&resolution=" +
            resolution +
            "&from=" +
            startUnix +
            "&to=" +
            endUnix +
            "&token=" + apiKey;
        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString);
        }
        else {
            console.log("Failed candle endpoint Typeguard: ", queryString);
        }
        // console.log("QUERYSTRING", queryString)
    }
    return queryStringObj;
}
//# sourceMappingURL=candlesEndPoint.js.map