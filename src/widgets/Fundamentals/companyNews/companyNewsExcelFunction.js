export const companyNewsExcel = function (
    apiKey,
    currentDashBoard,
    widgetHeader,
    security,
    config
) {
    const data = {
        apiKey: apiKey,
        dashboard: currentDashBoard,
        widget: widgetHeader,
        columnKeys: [
            //<-- DEFINE Column headers and finnHub data keys.
            { Category: "category" },
            { Datetime: "datetime" },
            { Headline: "headline" },
            { ID: "id" },
            { Image: "image" },
            { Related: "related" },
            { Source: "source" },
            { Summary: "summary" },
            { URL: "url" },
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
