
interface buzz {
    articlesInLastWeek: number,
    buzz: number,
    weeklyAverage: number,

}

interface sentiment {
    bearishPercent: number,
    bullishPercent: number,
}

export interface finAsReportedData {
    buzz: buzz,
    companyNewsScore: number,
    sectorAverageBullishPercent: number,
    sectorAverageNewsScore: number,
    sentiment: sentiment,
    symbol: string
}


export function newsSentimentReducer(data: finAsReportedData, filters: any) { //recieves unfiltered finnhub data and reduces to needed visable data

    const resObj: any = {}
    resObj.companyNewsScore = data?.companyNewsScore
    resObj.sectorAverageBullishPercent = data?.sectorAverageBullishPercent
    resObj.sectorAverageNewsScore = data?.sectorAverageNewsScore
    resObj.symbol = data?.symbol
    resObj.articlesInLastWeek = data?.buzz?.articlesInLastWeek
    resObj.buzz = data?.buzz?.buzz
    resObj.weeklyAverage = data?.buzz?.weeklyAverage
    resObj.bearishPercent = data?.sentiment?.bearishPercent
    resObj.bullishPercent = data?.sentiment?.bullishPercent

    return resObj
}
