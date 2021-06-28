

export function convertCamelToProper(text) {
    if (text) {
        const result = text.replace( /([A-Z])/g, " $1" );
        const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
        return finalResult
    } else {return ''}
}

export function findByString(searchObj, searchList){ //find value in nested object
    if (searchList.length === 1) {
        let ret = searchObj[searchList]
        if (Array.isArray(ret)) {return ([...ret])}
        else if (typeof ret === 'object') {return {...ret}}
        else {return ret}
    } else {
        let searchTerm = searchList.shift()
        if (searchObj[searchTerm]) {
            let foundObj = searchObj[searchTerm]
            return findByString(foundObj, searchList)
        } else {
            console.log('FILTER NOT FOUND:', searchList)
            return({})
        }
    }
}

export function mergeByString(searchObj, searchList, payload){ //recursively merge in obj.
    if (searchList.length === 1) {
        return searchObj[searchList[0]] = payload
    } else {
        let searchTerm = searchList.shift()
        if (searchObj[searchTerm]) {
            return mergeByString(searchObj[searchTerm], searchList, payload)
        } else {
            let iterObj = {}
            searchObj[searchTerm] = iterObj
            return mergeByString(iterObj, searchList, payload)
        }
    }
}

export function uniqueObjectnName(newName, reviewObject, iterator=0){
    if (reviewObject[newName]) {
        return uniqueObjectnName(newName, reviewObject, iterator+1)
    } else {
        if (iterator === 0){
            return newName
        } else {
            return `${newName}${iterator}`
        }
    }
}