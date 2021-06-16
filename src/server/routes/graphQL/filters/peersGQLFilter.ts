import { FinnHubAPIData } from '../../../../widgets/Fundamentals/Peers/peersBody'

export default function recommendationTrendsGQLFilter(data: FinnHubAPIData, config: Object = {}) {
    //convert time series list to Object: Keys = period, values = object
    const resObj = {}

    for (const d in data) {
        const key = d
        const val = data[d]
        resObj[key] = val
    }
    return resObj
}