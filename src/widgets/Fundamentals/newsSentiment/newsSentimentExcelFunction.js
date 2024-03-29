export const newsSentimentExcel = function (
    apiKey,
    currentDashBoard,
    widgetHeader,
    security
) {
    const data = {
        apiKey: apiKey,
        dashboard: currentDashBoard,
        widget: widgetHeader,
        columnKeys: [
            //<-- DEFINE Column headers and finnHub data keys.
            { "Articles In Last Week": "articlesInLastWeek" },
            { Buzz: "buzz" },
            { "Weekly Average": "weeklyAverage" },
            { "Company News Score": "companyNewsScore" },
            { "Sector Average Bullish Percent": "sectorAverageBullishPercent" },
            { "Sector Average News Score": "sectorAverageNewsScore" },
            { "Bearish Percent": "bearishPercent" },
            { "Bullish Percent": "bullishPercent" },
            { Symbol: "symbol" },
        ],
    };

    if (security) data.security = security;

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };

    fetch(`${process.env.REACT_APP_BASEURL}/api/generateTemplate`, options)
        .then((response) => response.blob())
        .then((blob) => {
            var file = window.URL.createObjectURL(blob);
            window.location.assign(file);
        })
        .catch((err) => {
            console.log("error generating excel template", err);
        });
};
