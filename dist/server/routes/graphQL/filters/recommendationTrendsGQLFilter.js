export default function recommendationTrendsGQLFilter(data, filters = {}) {
    //convert time series list to Object: Keys = period, values = object
    const resObj = {};
    for (const d in data) {
        const key = data[d].period;
        const val = data[d];
        resObj[key] = val;
    }
    return resObj;
}
//# sourceMappingURL=recommendationTrendsGQLFilter.js.map