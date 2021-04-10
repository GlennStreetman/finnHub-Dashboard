import types from '../../../types';
export default function marketNewsEndPoint(stockList, filters, apiKey) {
    //filters used after data is returned.
    const queryStringObj = {};
    const queryString = `https://finnhub.io/api/v1/news?category=${filters.categorySelection}&token=${apiKey}`;
    // queryStringObj['market'] = (queryString)
    if (types.finnHubAPI.test(queryString) === true) {
        queryStringObj['market'] = (queryString);
    }
    else {
        console.log("Failed marketNews endpoint Typeguard: ", queryString);
    }
    return queryStringObj;
}
//# sourceMappingURL=marketNewsEndPoint.js.map