export const findByString = function (searchObj: Object, thisSearch: string[]) { //find value in nested object
    let searchList = [...thisSearch]
    if (searchList.length === 1) { //base case of recursive search.
        let ret = searchObj[searchList[0]]
        if (Array.isArray(ret)) { return ([...ret]) }
        else if (typeof ret === 'object') { return { ...ret } }
        else { return ret }
    } else {
        const searchTerm = searchList.shift()
        if (searchTerm !== undefined && searchObj[searchTerm]) {
            let foundObj = searchObj[searchTerm]
            return findByString(foundObj, searchList)
        } else {
            return ({})
        }
    }
}