export const quoteExcel = function (apiKey, currentDashBoard, widgetHeader, security) {
    const data = { 
        apiKey: apiKey,
        dashboard: currentDashBoard,
        widget: widgetHeader,
        columnKeys: [ //<-- DEFINE Column headers and finnHub data keys.
            { Current: 'c' }, 
            { High: 'h' }, 
            { Low: 'l' }, 
            { Open: 'o' }, 
            { 'Previous Close': 'pc' },
            { Time: 't' },
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

