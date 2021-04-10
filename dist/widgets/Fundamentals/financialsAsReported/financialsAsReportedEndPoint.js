import types from '../../../types';
export default function financialsAsReportedEndPoint(stockList, filters, apiKey) {
    //filters used after data is returned.
    const queryStringObj = {};
    for (const stock in stockList) {
        const stockSymbol = stockList[stock].symbol;
        const key = stockList[stock].key;
        const queryString = `https://finnhub.io/api/v1/stock/financials-reported?symbol=${stockSymbol}&token=${apiKey}`;
        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString);
        }
        else {
            console.log("Failed financials as reported endpoint Typeguard: ", queryString);
        }
    }
    return queryStringObj;
}
//# sourceMappingURL=financialsAsReportedEndPoint.js.map