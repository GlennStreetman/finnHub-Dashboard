export const priceTargetExcel = function (
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
            { "Last Updated": "lastUpdated" },
            { Symbol: "symbol" },
            { "Target High": "targetHigh" },
            { "Target Low": "targetLow" },
            { "Target Mean": "targetMean" },
            { "Target Median": "targetMedian" },
        ],
    };

    if (security) data.security = security;

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };

    fetch("/api/generateTemplate", options)
        .then((response) => response.blob())
        .then((blob) => {
            var file = window.URL.createObjectURL(blob);
            window.location.assign(file);
        });
};
