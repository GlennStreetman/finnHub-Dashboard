export const updateExchangeList = function(ex) {
    const p = this.props;

    if (typeof ex === "string") {
        const newList = ex.split(",");

        const payload = {
            exchangeList: newList,
            apiKey: this.state.apiKey,
            finnHub: this.state.finnHub,
        };
        p.rUpdateExchangeList(payload);

        this.setState({ exchangeList: newList });
    } else {
        this.setState({ exchangeList: ex });
    }
}