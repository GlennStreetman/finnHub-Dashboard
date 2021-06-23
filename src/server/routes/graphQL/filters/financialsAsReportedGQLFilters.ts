
import { FinnHubAPIData } from '../../../../widgets/Fundamentals/financialsAsReported/financialsAsReportedBody'

export default function financialsAsReportedGQLFilter(data: FinnHubAPIData, config: Object = {}) {
    //convert time series list to Object: Keys = period, values = object
    const resObj = {
        accessNumber: [],
        symbol: [],
        cik: [],
        year: [],
        quarter: [],
        form: [],
        startDate: [],
        endDate: [],
        filedDate: [],
        acceptedDate: [],
        unit: [],
        label: [],
        concept: [],
        value: [],
    }

    const dataList = data.data

    //flatten data object and conver to time series format so that i can be used by templateing.
    for (const d in dataList) {
        if (dataList[d].year === config?.['year']) {
            const generalData = dataList[d]
            let outerData = { ...generalData } //to be applied to each time series line item.
            delete outerData.report
            // console.log('outerData', d, outerData)
            const financialStatementData = generalData.report[config['targetReport']]
            for (const i in financialStatementData) { //for target financial statement data
                const finNode = financialStatementData[i]
                // console.log('finNode', finNode)
                for (const x in outerData) { resObj[x].push(outerData[x]) }
                for (const i in finNode) { //for item in financial statement data
                    resObj[i].push(finNode[i])
                }
            }
        }
    }
    return resObj
}
