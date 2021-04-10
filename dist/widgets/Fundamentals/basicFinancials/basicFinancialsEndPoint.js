import types from './../../../types';
export default function basicFinancialsEndPoint(stockList, filters, apiKey) {
    //filters used after data is returned.
    let queryStringObj = {};
    for (const stock in stockList) {
        const stockSymbol = stockList[stock].symbol;
        const key = stockList[stock].key;
        const queryString = `https://finnhub.io/api/v1/stock/metric?symbol=${stockSymbol}&metric=all&token=${apiKey}`;
        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString);
        }
        else {
            console.log("Failed recommendation trends endpoint Typeguard: ", queryString);
        }
    }
    return queryStringObj;
}
//# sourceMappingURL=basicFinancialsEndPoint.js.map