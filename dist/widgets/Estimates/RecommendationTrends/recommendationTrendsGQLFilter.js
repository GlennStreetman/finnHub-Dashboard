export default function recommendationTrendsGQLFilter(mongoDocument) {
    //convert time series list to Object: Keys = period, values = object
    const data = mongoDocument.data;
    const resObj = {};
    for (const d in data) {
        const key = data[d].period;
        const val = data[d];
        resObj[key] = val;
    }
    return resObj;
}
//# sourceMappingURL=recommendationTrendsGQLFilter.js.map