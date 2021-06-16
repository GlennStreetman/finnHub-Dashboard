import {convertCamelToProper} from './../../../appFunctions/stringFunctions'

export const basicFinancialsExcel = function (apiKey, currentDashBoard, widgetHeader, config) {

    const columnKeys = function(){
        if (config.toggleMode === 'metrics'){
            const returnList = []
            for (const x in config.metricSelection) {
                let name = convertCamelToProper(config.metricSelection[x])
                const addReturnList = {
                    [name]: config.metricSelection[x]
                }
                returnList.push(addReturnList)
            }
            return returnList
        } else { //time series
                let name = convertCamelToProper(config.targetSeries)
                const returnList = [
                    {Period: `period`},
                    {[name]: `v`},
                ]
                return returnList
        }
    }

    const data = { 
        apiKey: apiKey,
        dashboard: currentDashBoard,
        widget: widgetHeader,
        columnKeys: columnKeys()
    };

    console.log('basic fin data', data)

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };

    fetch("/generateTemplate", options)
        .then(response => response.blob())
        .then(blob => {
            var file = window.URL.createObjectURL(blob);
            window.location.assign(file);
        })
}

