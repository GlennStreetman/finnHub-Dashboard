function findDate(offset){
    const returnDate = new Date(Date.now() + offset).toISOString().slice(0, 10) 
    return returnDate
  }

export default function IPOCalendarEndPoint(stockList, filters, apiKey){
    const queryString = `https://finnhub.io/api/v1/calendar/ipo?from=${findDate(filters.startDate)}&to=${findDate(filters.endDate)}&token=${apiKey}`
    let queryStringObj = {}
    queryStringObj['IPOS'] = queryString
    
    return queryStringObj
}  