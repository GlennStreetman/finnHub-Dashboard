export const updateGlobalStockList = function(event, stockRef, stockObj = {}) {
    console.log("updating global stock list", stockRef, stockObj)
    //pass stockRef to delete, pass in stockObj to update.
    // console.log("update global: ", stockRef, stockObj)
    const s = this.state;
    const currentStockObj = { ...s.globalStockList };
    if (currentStockObj[stockRef] === undefined) {
      // console.log('updating global list:', stockRef)
        currentStockObj[stockRef] = { ...stockObj };
        currentStockObj[stockRef]["dStock"] = function (ex) {
        //pass in exchange list
        if (ex.length === 1) {
            return this.symbol;
        } else {
            return this.key;
        }
        };
    } else {
        delete currentStockObj[stockRef];
    }
    this.setState({ globalStockList: currentStockObj });
    event instanceof Event === true && event.preventDefault();
}