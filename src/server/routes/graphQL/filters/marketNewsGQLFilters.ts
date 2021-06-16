
import { FinnHubAPIDataArray } from '../../../../widgets/Fundamentals/marketNews/marketNewsBody'

export default function recommendationTrendsGQLFilter(data: FinnHubAPIDataArray, config: Object = {}) {
    //convert time series list to Object: Keys = period, values = object
    const resObj = {}

    for (const d in data) {
        const time = data[d].datetime
        const key = `${new Date(time * 1000).toISOString().slice(0, 10)}`
        const val = data[d]
        resObj[key] = val
    }
    return resObj
}