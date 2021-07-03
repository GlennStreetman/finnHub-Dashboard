    import React from "react";
    import StockDataList from "./stockDataList";
    import { connect } from "react-redux";
    import ToolTip from './toolTip.js'
    import { tGetSymbolList } from "./../slices/sliceExchangeData";
    //compnoent used when searching for a stock via "Add stock to watchlist" on top bar or any widget searches.
    class StockSearchPane extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {

        };
        this.handleChange = this.handleChange.bind(this);
        this.changeDefault = this.changeDefault.bind(this);
    }

    componentDidMount(){
        const p = this.props
        if (p.defaultExchange !== p.currentExchange){
        p.tGetSymbolList({exchange: p.defaultExchange, apiKey: p.apiKey, finnHubQueue: p.finnHubQueue})
        }
    }

    handleChange(e) {
        const p = this.props
        p.changeSearchText(e.target.value.toUpperCase())
    }

    changeDefault(event){
        this.props.updateDefaultExchange(event.target.value, true)
        event.preventDefault()
    }
    
    render() {
        const p = this.props
        let widgetKey = p.widgetKey;
        const exchangeOptions = this.props.exchangeList.map((el) => 
        <option key={el} value={el}>{el}</option>
        )
        const helpText = <>
            Select Exchange to search. <br />
            Click manage account to update exchange list. 
        </>
        const helpText2 = <>
            Enter stock name or symbol to search for stocks. <br />
        </>
        return (
        <div className="stockSearch" data-testid="stockSearchPane">
            <form
            className="form-stack"
            onSubmit={(e) => { //submit stock to be added/removed from global & widget stocklist.
                e.preventDefault();
                if (this.props.rUpdateStock !== undefined && widgetKey === 'watchListMenu') {
                const thisStock = this.props.rUpdateStock
                const stockKey = thisStock.key
                this.props.updateGlobalStockList(e, stockKey, thisStock);
                } else if (widgetKey / 1 !== undefined && this.props.rUpdateStock !== undefined) { //Not menu widget. Menus named, widgets numbered.
                const thisStock = this.props.rUpdateStock
                const stockKey = thisStock.key
                this.props.updateWidgetStockList(widgetKey, stockKey, thisStock);
                } else {
                console.log("invalid stock selection");
                }
            }}
            >
            {this.props.exchangeList.length > 1 && <>
                <ToolTip textFragment={helpText} hintName='sspe' />
            <label htmlFor="exchangeList">Exchange:</label>
            <select value={this.props.defaultExchange} name='exchangeList' onChange={this.changeDefault}>
                {exchangeOptions}
            </select></>
            } 

            <ToolTip textFragment={helpText2} hintName='sspe2' />
            <label htmlFor="stockSearch">Security: </label>
            <input size='18' autoComplete="off" className="btn" type="text" id="stockSearch" list={`${this.props.widgetKey}-dataList`} value={this.state.inputText} onChange={this.handleChange} />
            <datalist id={`${this.props.widgetKey}-dataList`}>
                <StockDataList  
                defaultExchange={this.props.defaultExchange}
                inputText={this.props.searchText}
                />
            </datalist>
            <input className="btn" type="submit" value="Submit" />
            </form>
        </div>
        );
    }
    }

    const mapStateToProps = (state, ownProps) => {

    const p = ownProps
    const thisExchange = state.exchangeData.e?.data
    const inputSymbol = p.searchText.slice(0, p.searchText.indexOf(":"))
    const updateStock = thisExchange !== undefined ? thisExchange[inputSymbol] : {}
    const currentExchange = state.exchangeData.e.ex
    return {
        rUpdateStock: updateStock,
        currentExchange: currentExchange,
    }
    }

    export default connect(mapStateToProps, {tGetSymbolList})(StockSearchPane);

    export function searchPaneProps(p) {
    const propList = {
        updateGlobalStockList: p.updateGlobalStockList,
        updateWidgetStockList: p.updateWidgetStockList,
        widgetKey: p.widgetKey,
        exchangeList: p.exchangeList,
        defaultExchange: p.defaultExchange,
        updateDefaultExchange: p.updateDefaultExchange,
        searchText: p.searchText,
        changeSearchText: p.changeSearchText,
        apiKey: p.apiKey,
        finnHubQueue: p.finnHubQueue,
    };
    return propList;
    }
    