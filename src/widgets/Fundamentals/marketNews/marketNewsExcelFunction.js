export const marketNewsExcel = function (apiKey, currentDashboard, widgetHeader, security) {
    const data = { 
        apiKey: apiKey,
        dashboard: currentDashboard,
        widget: widgetHeader,
        columnKeys: [ //<-- DEFINE Column headers and finnHub data keys.
            { Category: 'category' }, 
            { 'Date Time': 'datetime' }, 
            { ID: 'id' }, 
            { Image: 'image' }, 
            { Related: 'related' },
            { Source: 'source' },
            { Summary: 'summary' },
            { URL: 'url' },
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

