export const EarningsCalendarExcelFunction = function (apiKey, currentDashboard, widgetHeader, security) {
    const data = { 
        apiKey: apiKey,
        dashboard: currentDashboard,
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

    if (security) data.security = security

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


