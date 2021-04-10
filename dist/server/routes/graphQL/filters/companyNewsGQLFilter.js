export default function companyNewsGQLFilter(data, filters = {}) {
    //convert time series list to Object: Keys = period, values = object
    const resObj = {};
    for (const d in data) {
        const time = data[d].datetime;
        const key = `${new Date(time * 1000).toISOString().slice(0, 10)}`;
        const val = data[d];
        resObj[key] = val;
    }
    return resObj;
}
//# sourceMappingURL=companyNewsGQLFilter.js.map