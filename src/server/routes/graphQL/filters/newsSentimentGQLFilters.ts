
import { finAsReportedData } from '../../../../widgets/Fundamentals/newsSentiment/newsSentimentReducer'

export default function recommendationTrendsGQLFilter(data: finAsReportedData, config: Object = {}) {
    //convert time series list to Object: Keys = period, values = object
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