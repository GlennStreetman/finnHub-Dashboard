export const toggleBackGroundMenu = function(menu) {
    if (menu === "") {
        this.setState({
            backGroundMenu: menu,
            showStockWidgets: 1,
        });
        } else if (this.state.backGroundMenu !== menu) {
        this.setState({ 
            backGroundMenu: menu,
            showStockWidgets: 0 
            });
        } else {
        this.setState({ 
            backGroundMenu: "",
            showStockWidgets: 1 
        });
    }
}