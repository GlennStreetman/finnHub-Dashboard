import React from "react";
import StockDataList from "./stockDataList";
import { connect } from "react-redux";
import ToolTip from './toolTip.js';
import { tGetSymbolList } from "./../slices/sliceExchangeData";
//compnoent used when searching for a stock via "Add stock to watchlist" on top bar or any widget searches.
class StockSearchPane extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleChange = this.handleChange.bind(this);
        this.changeDefault = this.changeDefault.bind(this);
    }
    componentDidMount() {
        const p = this.props;
        if (p.defaultExchange !== p.currentExchange) {
            console.log("updating exchange data");
            p.tGetSymbolList({ exchange: p.defaultExchange, apiKey: p.apiKey });
        }
    }
    handleChange(e) {
        const p = this.props;
        p.changeSearchText(e.target.value.toUpperCase());
    }
    changeDefault(event) {
        this.props.updateDefaultExchange(event);
    }
    render() {
        const p = this.props;
        let widgetKey = p.widgetKey;
        const exchangeOptions = this.props.exchangeList.map((el) => React.createElement("option", { key: el, value: el }, el));
        const helpText = React.createElement(React.Fragment, null,
            "Select Exchange to search. ",
            React.createElement("br", null),
            "Click manage account to update exchange list.");
        const helpText2 = React.createElement(React.Fragment, null,
            "Enter stock name or symbol to search for stocks. ",
            React.createElement("br", null));
        return (React.createElement("div", { className: "stockSearch" },
            React.createElement("form", { className: "form-stack", onSubmit: (e) => {
                    if (this.props.rUpdateStock !== undefined && widgetKey === 'WatchListMenu') {
                        const thisStock = this.props.rUpdateStock;
                        const stockKey = thisStock.key;
                        this.props.updateGlobalStockList(e, stockKey, thisStock);
                        this.props.showSearchPane();
                        e.preventDefault();
                    }
                    else if (widgetKey / 1 !== undefined && this.props.rUpdateStock !== undefined) { //Not menu widget. Menus named, widgets numbered.
                        const thisStock = this.props.rUpdateStock;
                        const stockKey = thisStock.key;
                        this.props.updateWidgetStockList(widgetKey, stockKey, thisStock);
                        e.preventDefault();
                    }
                    else {
                        console.log("invalid stock selection");
                        e.preventDefault();
                    }
                } },
                this.props.exchangeList.length > 1 && React.createElement(React.Fragment, null,
                    React.createElement(ToolTip, { textFragment: helpText, hintName: 'sspe' }),
                    React.createElement("label", { htmlFor: "exchangeList" }, "Exchange: "),
                    React.createElement("select", { value: this.props.defaultExchange, name: 'exchangeList', onChange: this.changeDefault }, exchangeOptions)),
                React.createElement("br", null),
                React.createElement(ToolTip, { textFragment: helpText2, hintName: 'sspe2' }),
                React.createElement("label", { htmlFor: "stockSearch" }, "Symbol: "),
                React.createElement("input", { size: '18', autoComplete: "off", className: "btn", type: "text", id: "stockSearch", list: "stockSearch1", value: this.state.inputText, onChange: this.handleChange }),
                React.createElement("datalist", { id: "stockSearch1" },
                    React.createElement(StockDataList, { defaultExchange: this.props.defaultExchange, inputText: this.props.searchText })),
                React.createElement("input", { className: "btn", type: "submit", value: "Submit" }))));
    }
}
const mapStateToProps = (state, ownProps) => {
    // console.log("OWNPROPS:", ownProps)
    const p = ownProps;
    const thisExchange = state.exchangeData.e?.data;
    const inputSymbol = p.searchText.slice(0, p.searchText.indexOf(":"));
    const updateStock = thisExchange !== undefined ? thisExchange[inputSymbol] : {};
    const currentExchange = state.exchangeData.e.ex;
    return {
        rUpdateStock: updateStock,
        currentExchange: currentExchange,
    };
};
export default connect(mapStateToProps, { tGetSymbolList })(StockSearchPane);
export function searchPaneProps(p) {
    const propList = {
        updateGlobalStockList: p.updateGlobalStockList,
        showSearchPane: () => p.showPane("showEditPane", 1),
        updateWidgetStockList: p.updateWidgetStockList,
        widgetKey: p.widgetKey,
        exchangeList: p.exchangeList,
        defaultExchange: p.defaultExchange,
        updateDefaultExchange: p.updateDefaultExchange,
        searchText: p.searchText,
        changeSearchText: p.changeSearchText,
        apiKey: p.apiKey,
    };
    return propList;
}
//# sourceMappingURL=stockSearchPaneFunc.js.map