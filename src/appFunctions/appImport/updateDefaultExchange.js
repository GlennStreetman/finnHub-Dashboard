export const updateDefaultExchange = function(ex) {
    //needs to check local storage and send stock data as part of payload.
    const s = this.state
    if (ex.target) {
      //runs on dropdown update.
      this.setState({ defaultExchange: ex.target.value });
      this.props.tGetSymbolList(ex.target.value, this.state.apiKey, s.finnHubQueue)
    } else {
      //runs on login
      this.setState({ defaultExchange: ex });
    }
  }