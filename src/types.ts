//stock string
const reStock = new RegExp('/.{1,32}')
//exchange string 2 characters
const reExchange = new RegExp('/[a-zA-Z]{2,2}')
//widgetID Number
const reWID = new RegExp('/[0-9]{1,12}')
//sKey 
const reSkey = new RegExp('/[a-zA-Z]{2,2}[-]{1}.{1,32}/')
//widgetKey
const reWKey = new RegExp('/[0-9]{1,12}[-]{1}[a-zA-Z]{2,2}[-]{1}.{1,32}/')

const finnHubAPI = new RegExp('(?: ?|^https://finnhub.io/api/v1/.{1,500})(^((?!undefined).)*$)')

const reNoUndefined = new RegExp('^((?!undefined).)*$')


export const types = {
    reStock,
    reExchange,
    reWID,
    reSkey,
    reWKey,
    finnHubAPI,
    reNoUndefined,
}


