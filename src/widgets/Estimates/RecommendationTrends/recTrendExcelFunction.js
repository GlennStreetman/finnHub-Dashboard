export const recTrendExcel = function (apiKey, currentDashBoard, widgetHeader) {
    const data = { 
        apiKey: apiKey,
        dashboard: currentDashBoard,
        widget: widgetHeader,
        columnKeys: [ //<-- DEFINE Column headers and finnHub data keys.
            { Buy: 'buy' }, 
            { Hold: 'hold' }, 
            { Period: 'period' }, 
            { Sell: 'sell' }, 
            { 'Strong Buy': 'strongBuy' },
            { 'Strong Sell': 'strongSell' },
            { Symbol: 'symbol' },
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

