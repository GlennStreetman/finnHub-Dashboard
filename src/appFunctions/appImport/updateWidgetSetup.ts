import { AppState, widgetSetup } from './../../App'

export const updateWidgetSetup = function (el: widgetSetup, widgetSetup: widgetSetup) { //widget ref, true/false
    //saved widet setup in postgres
    const newWidgetSetup: widgetSetup = { ...widgetSetup, ...el }

    const data = {
        field: "widgetsetup",
        newValue: JSON.stringify(newWidgetSetup),
    };

    const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    };

    fetch("/accountData", options)
        .then((response) => response.json())
        .then((data) => {
            console.log(data.message)
        });

    return newWidgetSetup
}