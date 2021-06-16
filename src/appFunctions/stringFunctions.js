

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

// var x = {
//     cats: {
//         cat1: 'cat1',
//         cat2: 'cat2' 
//     }
// }

// console.log('FINISH', findByString(x, 'cats.cat1'))

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

// var test = {}
// var searchList = ['this', 'is', 'a', 'test']
// var payload = {working: 'test'}
// mergeByString(test, searchList, payload)

// console.log(test)