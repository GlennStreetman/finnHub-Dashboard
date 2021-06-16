import { FinnHubAPIData } from '../../../../widgets/Fundamentals/basicFinancials/basicFinancialsBody'

export default function basicFinancialsGQLFilter(data: FinnHubAPIData, config: any = {}) {
    //convert time series list to Object: Keys = period, values = object
    console.log('config', config)
    const resObj = {
        metrics: {},
        series: {},
    }

    const filterListMetrics = config['metricSelection']
    const metrics = data.metric
    for (const d in filterListMetrics) { //filter metrics
        resObj.metrics[filterListMetrics[d]] = metrics[filterListMetrics[d]]
    }

    const filtersTimeSeries = config['seriesSelection']
    const timeSeries = data.series.annual
    for (const d in filtersTimeSeries) { //filter metrics
        resObj.series[filtersTimeSeries[d]] = timeSeries[filtersTimeSeries[d]]
    }
    console.log('resObj:', resObj)
    return resObj
}