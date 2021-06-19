import {convertCamelToProper} from './../../../appFunctions/stringFunctions'

export const financialsAsReportedSingle = function (apiKey, currentDashBoard, widgetHeader, config) {

    const columnKeys = [
        {AccessNumber: 'accessNumber'},
        {Symbol: 'symbol'},
        {CIK: 'cik'},
        {Year: 'year'},
        {Quarter: 'quarter'},
        {Form: 'form'},
        {StartDate: 'startDate'},
        {EndDate: 'endDate'},
        {FiledDate: 'filedDate'},
        {AcceptedDate: 'acceptedDate'},
        {Unit: 'unit'},
        {Label: 'label'},
        {Concept: 'concept'},
        {Value: 'value'},
    ]

    const data = { 
        apiKey: apiKey,
        dashboard: currentDashBoard,
        widget: widgetHeader,
        columnKeys: columnKeys
    };

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

let x
fetch('https://finnhub.io/api/v1/stock/financials-reported?symbol=TSLA&token=c0i3dun48v6qfc9d1p5g')
.then(response => response.json())
.then(data => console.log(data));