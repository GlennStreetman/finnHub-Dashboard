
import { FinnHubAPIData } from '../../../../widgets/Fundamentals/financialsAsReported/financialsAsReportedBody'

interface resNode {
    accessNumber: string,
    symbol: string,
    cik: string,
    year: string,
    quarter: string,
    form: string,
    startDate: string,
    endDate: string,
    filedDate: string,
    acceptedDate: string,
    unit: string,
    label: string,
    concept: string,
    value: string,
    [key: string]: string | number, //report data
}

export default function financialsAsReportedGQLFilter(data: FinnHubAPIData, config: Object = {}) {
    //convert time series list to Object: Keys = period, values = object
    const resObj = {}
    const dataList = data.data
    //flatten data object and conver to time series format so that i can be used by templateing.
    for (const d in dataList) {
        if (dataList[d].year === config?.['year']) {
            const generalData = dataList[d]
            let outerData = { ...generalData } //to be applied to each time series line item.
            delete outerData.report
            const financialStatementData = generalData.report[config['targetReport']] //select reported targeted
            for (const i in financialStatementData) { //for target financial statement data
                const finNode: resNode = {
                    ...outerData,
                    ...financialStatementData[i]
                }
                resObj[`${finNode.label}`] = finNode
            }
        }
    }
    console.log('return filtered obj', resObj, config)
    return resObj
}
