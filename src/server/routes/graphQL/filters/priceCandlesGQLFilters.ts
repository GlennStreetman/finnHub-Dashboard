
import { FinnHubCandleData } from '../../../../widgets/Price/candles/candleWidget'

export default function priceCandlesGQLFilters(data: FinnHubCandleData, config: Object = {}) {
    //convert time series list to Object: Keys = period, values = object
    const resObj = {}
    const timeStampes = data.t
    for (const d in timeStampes) {
        const dateKey = new Date(timeStampes[d] * 1000).toISOString().split('T')[0]
        resObj[dateKey] = {
            o: data.o[d],
            h: data.h[d],
            l: data.l[d],
            c: data.c[d],
            v: data.v[d],
            t: data.t[d],
            date: new Date(timeStampes[d] * 1000).toISOString().split('T')[0],
        }
    }
    return resObj
}
