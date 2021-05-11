export const updateWidgetSetup = function(el){ //widget ref, true/false
    const s = this.state
    const newWidgetSetup = {...s.widgetSetup, ...el}
    this.setState({widgetSetup: newWidgetSetup})

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