import types from './../../../types';
export default function EPSSuprisesEndPoint(stockList, filters, apiKey) {
    let queryStringObj = {};
    for (const stock in stockList) {
        let stockSymbol = stockList[stock].symbol;
        const key = stockList[stock].key;
        const queryString = `https://finnhub.io/api/v1/stock/earnings?symbol=${stockSymbol}&token=${apiKey}`;
        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString);
        }
        else {
            console.log("Failed earnings calendar endpoint Typeguard: ", queryString);
        }
    }
    return queryStringObj;
}
//# sourceMappingURL=EPSSurprisesEndPoint.js.map