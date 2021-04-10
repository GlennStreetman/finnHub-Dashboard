import types from '../../../types';
function findDate(offset) {
    const returnDate = new Date(Date.now() + offset).toISOString().slice(0, 10);
    return returnDate;
}
export default function IPOCalendarEndPoint(stockList, filters, apiKey) {
    const queryStringObj = {};
    const queryString = `https://finnhub.io/api/v1/calendar/ipo?from=${findDate(filters.startDate)}&to=${findDate(filters.endDate)}&token=${apiKey}`;
    if (types.finnHubAPI.test(queryString) === true) {
        queryStringObj['IPOS'] = (queryString);
    }
    else {
        console.log("Failed IPO calendar endpoint Typeguard: ", queryString);
    }
    // console.log("QUERY STRINGS IPO", queryStringObj)
    return queryStringObj;
}
//# sourceMappingURL=IPOCalendarEndPoint.js.map