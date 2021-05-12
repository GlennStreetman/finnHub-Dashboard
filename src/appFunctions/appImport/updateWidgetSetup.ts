import { AppState, widgetSetup } from './../../App'

export const updateWidgetSetup = function (this, el: widgetSetup) { //widget ref, true/false
    const s: AppState = this.state
    const newWidgetSetup: widgetSetup = { ...s.widgetSetup, ...el }
    const payload: Partial<AppState> = { widgetSetup: newWidgetSetup }
    this.setState(payload)

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
}