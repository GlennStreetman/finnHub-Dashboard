export const companyProfileExcel = function (apiKey, currentDashBoard, widgetHeader) {
    const data = { 
        apiKey: apiKey,
        dashboard: currentDashBoard,
        widget: widgetHeader,
        columnKeys: [ //<-- DEFINE Column headers and finnHub data keys.
            { Country: 'country' }, 
            { Currency: 'currency' }, 
            { Exchange: 'exchange' }, 
            { IPO: 'ipo' }, 
            { MarketCapitalization: 'marketCapitalization' },
            { Name: 'name' },
            { Phone: 'phone' },
            { ShareOutstanding: 'shareOutstanding' },
            { Ticker: 'ticker' },
            { Weburl: 'weburl' },
            { Logo: 'logo' },
            { FinnhubIndustry: 'finnhubIndustry' },
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

