export const EarningsCalendarExcelFunction = function (apiKey, currentDashBoard, widgetHeader) {
    const data = { 
        apiKey: apiKey,
        dashboard: currentDashBoard,
        widget: widgetHeader,
        columnKeys: [  //<-- DEFINE Column headers and finnHub data keys.
            { date: 'date' }, 
            { 'EPS Actual': 'epsActual' }, 
            { 'EPS Estimate': 'epsEstimate' }, 
            { 'hour': 'hour' }, 
            { Querter: 'quarter' }, 
            { 'Revenue Actual': 'revenueActual' },
            { 'Revenue Estimate': 'revenueEstimate' },
            { Symbol: 'symbol' },
            { Year: 'year' },
        ]
    };
    console.log('data', data)
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


