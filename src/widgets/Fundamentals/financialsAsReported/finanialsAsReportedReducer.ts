
interface reportNode {
    unit: string,
    label: string,
    value: number,
    concept: string,
}

interface reportObj {
    bs?: reportNode[],
    cf?: reportNode[],
    ic?: reportNode[],
}

export interface reportInfo {
    accessNumber: string,
    symbo: string,
    cik: string,
    year: number,
    quarter: number,
    form: string,
    startDate: string,
    endDate: string,
    filedDate: string,
    acceptedDate: string,
    report: reportObj
}

interface finAsReportedData {
    cik: string,
    data: reportInfo[],
    symbol: string,
}

interface filtersObj {
    metricSource: string,
    targetReport: string,
}

export function financialsAsReportedReducer(data: finAsReportedData, filters: filtersObj) { //recieves unfiltered finnhub data and reduces to needed visable data

    const resObj: finAsReportedData = { //remember to layer in filters
        cik: data.cik,
        data: [],
        symbol: data.symbol,
    }
    let seriesData = data.data
    for (const n in seriesData) {
        const newNode: reportInfo = { ...seriesData[n] }
        const targetReport = filters.targetReport
        let filteredNode = { [targetReport]: seriesData[n].report[targetReport] }
        newNode.report = filteredNode
        // console.log(newNode)
        resObj.data.push(newNode)
    }
    return resObj
}
