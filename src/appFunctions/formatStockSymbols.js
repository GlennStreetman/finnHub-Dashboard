//returns stock symbol if one exchange active, else returns exchange-symbol
//use where stock symbols are displayed to user.
export function dStock(stock, exList){
    if (exList.length === 1) {
        return stock.slice(stock.indexOf("-")+1, stock.length)
    } else {
        return stock
    }
}   
