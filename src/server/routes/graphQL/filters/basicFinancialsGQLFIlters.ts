import { FinnHubAPIData } from '../../../../widgets/Fundamentals/basicFinancials/basicFinancialsBody'

export default function basicFinancialsGQLFilter(data: FinnHubAPIData, filters: any = {}) {
    //convert time series list to Object: Keys = period, values = object
    // console.log('dataBasic', data)
    const resObj = {
        metrics: {},
        series: {},
    }

    const filterListMetrics = filters['metricSelection']
    const metrics = data.metric
    for (const d in filterListMetrics) { //filter metrics
        resObj.metrics[filters.metricSelection[d]] = metrics[filters.metricSelection[d]]
    }

    const filtersTimeSeries = filters['seriesSelection']
    const timeSeries = data.series.annual
    for (const d in filtersTimeSeries) { //filter metrics
        console.log()
        resObj.series[filters.metricSelection[d]] = timeSeries[filters.seriesSelection[d]]
    }

    return resObj
}