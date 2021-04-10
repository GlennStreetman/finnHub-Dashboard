import types from './../../../types';
export default function recommendationTrendsEndPoint(stockList, filters, apiKey) {
    let queryStringObj = {};
    for (const stock in stockList) {
        const stockSymbol = stockList[stock].symbol;
        const key = stockList[stock].key;
        const queryString = `https://finnhub.io/api/v1/stock/recommendation?symbol=${stockSymbol}&token=${apiKey}`;
        if (types.reStock.test(stockSymbol) === true && types.finnHubAPI.test(queryString) === true) {
            queryStringObj[key] = (queryString);
        }
        else {
            console.log("Failed recommendation trends endpoint Typeguard: ", queryString);
        }
    }
    return queryStringObj;
}
//# sourceMappingURL=RecommendationTrendsEndPoint.js.map