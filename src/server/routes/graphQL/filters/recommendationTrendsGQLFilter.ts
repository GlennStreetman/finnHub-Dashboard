
import { FinnHubAPIDataArray } from '../../../../widgets/Estimates/RecommendationTrends/recommendationTrendsBody'

export default function recommendationTrendsGQLFilter(data: FinnHubAPIDataArray, filters: Object = {}) {
    //convert time series list to Object: Keys = period, values = object
    const resObj = {}

    for (const d in data) {
        const key = data[d].period
        const val = data[d]
        resObj[key] = val
    }
    return resObj
}