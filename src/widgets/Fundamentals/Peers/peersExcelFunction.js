export const peersExcel = function (apiKey, currentDashboard, widgetHeader, security) {
    const data = { 
        apiKey: apiKey,
        dashboard: currentDashboard,
        widget: widgetHeader,
        columnKeys: [ //<-- DEFINE Column headers and finnHub data keys.
            { Peers: 'peers' }, 
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

