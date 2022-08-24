export const financialsAsReportedExcel = function (
    apiKey,
    currentDashBoard,
    widgetHeader,
    security
) {
    const columnKeys = [
        { AccessNumber: "accessNumber" },
        { Symbol: "symbol" },
        { CIK: "cik" },
        { Year: "year" },
        { Quarter: "quarter" },
        { Form: "form" },
        { StartDate: "startDate" },
        { EndDate: "endDate" },
        { FiledDate: "filedDate" },
        { AcceptedDate: "acceptedDate" },
        { Unit: "unit" },
        { Label: "label" },
        { Concept: "concept" },
        { Value: "value" },
    ];

    const data = {
        apiKey: apiKey,
        dashboard: currentDashBoard,
        widget: widgetHeader,
        columnKeys: columnKeys,
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
