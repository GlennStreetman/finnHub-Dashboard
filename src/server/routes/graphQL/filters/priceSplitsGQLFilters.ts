
import { finnHubSplitArray } from '../../../../widgets/Price/splits/PriceSplitsBody'

export default function priceSplitsGQLFilter(data: finnHubSplitArray, filters: Object = {}) {
    //convert time series list to Object: Keys = period, values = object
    const resObj = {}

    for (const d in data) {
        const key = data[d].date
        const val = data[d]
        resObj[key] = val
    }
    return resObj
}