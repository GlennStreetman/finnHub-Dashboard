export const candleExcel = async function (
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
            { Date: "date" },
            { Time: "t" },
            { Open: "c" },
            { High: "h" },
            { Low: "l" },
            { Close: "c" },
        ],
    };

    if (security) data.security = security;

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };

    let res = await etch(
        `${process.env.REACT_APP_BASEURL}/api/generateTemplate"`,
        options
    ).catch((err) => {
        console.log("error generating excel template", err);
    });
    if (res.status === 200) {
        let fileData = await res.blob();
        let file = window.URL.createObjectURL(fileData);
        window.location.assign(file);
    } else {
        console.log("Problem running excel template", res.body.message);
    }
};
