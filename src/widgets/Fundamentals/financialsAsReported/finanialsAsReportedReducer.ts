
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
    report?: reportObj  //REPORTS ONLY RETURNED BY EXCEL 
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
    let seriesData = data.data
    for (const n in seriesData) {
        delete seriesData[n].report
    }
    const resObj: finAsReportedData = { //remember to layer in filters
        cik: data.cik,
        data: seriesData,
        symbol: data.symbol,
    }
    return resObj
}
