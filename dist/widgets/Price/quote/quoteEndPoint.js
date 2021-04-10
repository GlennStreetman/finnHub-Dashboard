import types from './../../../types';
export default function quoteWidgetEndPoint(stockList, filters = undefined, apiKey) {
    //filters should be empty
    // console.log('quoteEndPoint', stockList, apiKey)
    let queryStringObj = {};
    for (const stock in stockList) {
        const stockSymbol = stockList[stock].symbol;
        const key = stockList[stock].key;
        const queryString = "https://finnhub.io/api/v1/quote?symbol=" +
            // stockSymbol.slice(stockSymbol.indexOf('-') + 1, stockSymbol.length) +
            stockSymbol +
            "&token=" + apiKey;
        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString);
        }
        else {
            console.log("Failed quote endpoint Typeguard: ", queryString);
        }
    }
    return queryStringObj;
}
//# sourceMappingURL=quoteEndPoint.js.map