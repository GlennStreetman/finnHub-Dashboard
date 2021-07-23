import { FinnHubAPIData } from '../../../../widgets/Fundamentals/basicFinancials/basicFinancialsBody'

export default function basicFinancialsGQLFilter(data: FinnHubAPIData, config: any = {}) {
    //convert time series list to Object: Keys = period, values = object
    if (config.toggleMode === 'metrics') { //widget Show: dropdown set to metrics
        const resObj = {
            metrics: {},
        }
        const filterListMetrics = config['metricSelection']
        const metrics = data.metric
        for (const d in filterListMetrics) { //filter metrics
            resObj.metrics[filterListMetrics[d]] = metrics?.[filterListMetrics[d]]
        }
        return resObj
    }

    interface resNode {
        period: string,
        v: number,
    }

    interface resObj {
        [key: string]: resNode
    }

    if (config.toggleMode === 'series') { //widget Show: dropdown set to series.
        let resObj: resObj = {
        }
        const targetSeries = config.targetSeries
        const timeSeriesData: [] = data?.series?.annual?.[targetSeries]
        if (timeSeriesData) {
            for (const d in timeSeriesData) {
                resObj[timeSeriesData[d]['period']] = {
                    period: timeSeriesData[d]['period'],
                    v: timeSeriesData[d]['v'],
                }
            }
        }
        return resObj
    }
}
