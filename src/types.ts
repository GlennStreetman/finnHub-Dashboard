//stock string
const reStock = new RegExp('.{1,32}')
//exchange string 2 characters
const reExchange = new RegExp('[a-zA-Z]{2,2}')
//widgetID Number
const reWID = new RegExp('[0-9]{1,12}')
//sKey 
const reSkey = new RegExp('[a-zA-Z]{2,2}[-]{1}.{1,32}')
//widgetKey
const reWKey = new RegExp('[0-9]{1,12}[-]{1}[a-zA-Z]{2,2}[-]{1}.{1,32}')

const finnHubAPI = new RegExp('(?: ?|^https://finnhub.io/api/v1/.{1,500})(^((?!undefined).)*$)')

const reNoUndefined = new RegExp('^((?!undefined).)*$')

export interface StockObj {
    currency: string,
    // dStock: Function,
    description: string,
    exchange: string, //can type check using reExchange
    figi: string,
    key: string, //can type check using reSKey
    mic: string,
    symbol: string //can type check using reStock
    type: string
}

export interface EndPointObj { //key = stockSymbol, value = finnHub Query String
    [key: string]: string //
}

const types = {
    reStock,
    reExchange,
    reWID,
    reSkey,
    reWKey,
    finnHubAPI,
    reNoUndefined,

}

export default types



