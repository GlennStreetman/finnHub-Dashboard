import { FinnHubAPIData } from '../../../../widgets/Fundamentals/basicFinancials/basicFinancialsBody'

export default function basicFinancialsGQLFilter(data: FinnHubAPIData, filters: any = {}) {
    //convert time series list to Object: Keys = period, values = object
    const resObj = {}
    const filterList = filters['metricSelection']
    const metrics = data.metric
    for (const d in filterList) {
        resObj[filters.metricSelection[d]] = metrics[filters.metricSelection[d]]
    }
    return resObj
}