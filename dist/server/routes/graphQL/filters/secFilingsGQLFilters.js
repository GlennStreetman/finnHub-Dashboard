export default function secFilingsGQLFilter(data, filters = {}) {
    //convert time series list to Object: Keys = period, values = object
    const resObj = {};
    for (const d in data) {
        const key = `${data[d].form}: ${data[d].filedDate.slice(0, 10)}`;
        const val = data[d];
        resObj[key] = val;
    }
    return resObj;
}
//# sourceMappingURL=secFilingsGQLFilters.js.map