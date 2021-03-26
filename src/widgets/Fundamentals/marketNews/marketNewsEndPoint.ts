import types, { EndPointObj, StockObj } from '../../../types'

interface filters { //Any paramas not related to stock used by finnHub endpoint.
    categorySelection: string,
}


export default function marketNewsEndPoint(stockList: StockObj[], filters: filters, apiKey: string) {
    //filters used after data is returned.
    const queryStringObj: EndPointObj = {}

    const queryString = `https://finnhub.io/api/v1/news?category=${filters.categorySelection}&token=${apiKey}`
    // queryStringObj['market'] = (queryString)
    if (types.finnHubAPI.test(queryString) === true) {
        queryStringObj['market'] = (queryString)
    } else {
        console.log("Failed marketNews endpoint Typeguard: ", queryString)
    }
    return queryStringObj
}