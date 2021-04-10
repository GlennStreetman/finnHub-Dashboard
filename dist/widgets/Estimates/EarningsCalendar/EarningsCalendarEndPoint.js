import types from './../../../types';
function findDate(offset) {
    const returnDate = new Date(Date.now() + offset).toISOString().slice(0, 10);
    return returnDate;
}
export default function earningsCalendarEndPoint(stockList, filters, apiKey) {
    // console.log(stockList, filters, apiKey)
    let queryStringObj = {};
    for (const stock in stockList) {
        const stockSymbol = stockList[stock].symbol;
        const key = stockList[stock].key;
        const queryString = `https://finnhub.io/api/v1/calendar/earnings?from=${findDate(filters.startDate)}1&to=${findDate(filters.endDate)}1&symbol=${stockSymbol}&token=${apiKey}`;
        // queryStringObj[stockKey] = (queryString)
        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString);
        }
        else {
            console.log("Failed earnings calendar endpoint Typeguard: ", queryString);
        }
    }
    // console.log(queryStringObj)
    return queryStringObj;
}
//# sourceMappingURL=EarningsCalendarEndPoint.js.map