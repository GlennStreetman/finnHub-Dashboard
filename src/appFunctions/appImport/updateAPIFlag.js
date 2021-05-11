export const updateAPIFlag = function(val) {
    if (val > 0) {
        this.setState({
            apiFlag: val,
            showStockWidgets: 0,
            backGroundMenu: "about",
        });
    } else {
        this.setState({ apiFlag: val });
    }
}