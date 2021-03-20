export default function marketNewsEndPoint(stockList, filters, apiKey){
    //filters used after data is returned.
    let queryStringObj = {}
    
    const queryString = `https://finnhub.io/api/v1/news?category=${filters.categorySelection}&token=${apiKey}`    
    // const queryString = `https://finnhub.io/api/v1/company-news?symbol=${stockSymbole}&from=${startDate}&to=${endDate}&token=${apiKey}`
        console.log(queryString)
        queryStringObj['market'] = (queryString)
        console.log("--------->", queryStringObj)
        return queryStringObj
}