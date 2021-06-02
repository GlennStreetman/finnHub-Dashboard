import { findByString, mergeByString } from './../../../appFunctions/stringFunctions'

interface metric {
    [key: string]: number,
}

interface dataPoint {
    period: string,
    v: number,
}

interface seriesData {
    [key: string]: dataPoint[]
}

interface annual {
    annual: seriesData
}

interface basicFinancialsData {
    metric: metric,
    metricType: string,
    series: annual,
    symbol: string
}

export interface filtersObj {
    filterPaths: string[],
    showData: string[],
    widgetType: string,
}

interface basicFinancialsReduced {
    metric: metric,
    series: seriesData,
    metricKeys: string[],
    seriesKeys: string[],
}

export function basicFinancialsReducer(data: basicFinancialsData, filters: filtersObj) { //recieves unfiltered finnhub data and reduces to needed visable data
    const resObj: basicFinancialsReduced = { //remember to layer in filters
        metric: {},
        series: {},
        metricKeys: [],
        seriesKeys: [],
    }
    resObj.metricKeys = data?.metric ? Object.keys(data.metric) : []
    resObj.seriesKeys = data?.series?.annual ? Object.keys(data.series.annual) : []
    for (const f in filters['showsData']) {
        let filterPathItems = findByString(data, filters['showsData'][f].split('.'))
        mergeByString(resObj, filters['showsData'][f].split('.'), filterPathItems)
    }
    return resObj
}
