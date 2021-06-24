import { FinnHubAPIData } from '../../../../widgets/Fundamentals/IPOCalendar/IPOCalendarBody'

export default function ipoCalendarGQLFilter(data: FinnHubAPIData, config: Object = {}) {
    //convert time series list to Object: Keys = period, values = object
    const resObj = {}
    const ipo = data['ipoCalendar']
    for (const d in ipo) {

        const key = ipo[d].date
        const val = {
            date: ipo[d].date,
            exchange: ipo[d].exchange,
            name: ipo[d].name,
            numberOfShares: ipo[d].numberOfShares,
            price: ipo[d].price,
            status: ipo[d].status,
            symbol: ipo[d].symbol,
            totalSharesValue: ipo[d].totalSharesValue,
        }
        console.log(d, key, val)
        resObj[key] = val
    }

    console.log('IPO DATA', resObj)

    return resObj
}