import Papa from 'papaparse'
import React from "react";
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane.js";
import CsvUpload from './csvUpload.js'
import ToolTip from '../../../components/toolTip.js'

class WatchListMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      uploadList: null //pass in list to trigger up
    };

    this.inputReference = React.createRef();
    this.baseState = {mounted: true}
    this.renderWatchedStocks = this.renderWatchedStocks.bind(this);
    this.fileUploadAction = this.fileUploadAction.bind(this);
    this.fileUploadInputChange = this.fileUploadInputChange.bind(this);
    this.returnKey = this.returnKey.bind(this);
    this.resetUploadList = this.resetUploadList.bind(this)
  }

  componentWillUnmount(){
    this.baseState.mounted = false
  }

  returnKey(ref){
    const retVal = ref !== undefined ? ref["currentPrice"] : "noDat"
    return retVal
  }

  renderWatchedStocks() {
      
    const p = this.props
    const g = p.globalStockList;
    if (g.sKeys !== undefined) {
    // console.log(g, '-------------')
    const stockListKey = g.sKeys().map((el) => ( 
    <tr key={el + "row"}>

        {this.props.showEditPane === 0 &&
          <>
            <td key={el + "symb"}>
              {g[el].dStock(p.exchangeList)}
            </td>
            <td className="leftTE" key={el + 'desc'}>
              {g[el].description}
            </td>
            <td className="rightTEFade" key={el + "prc" + this.returnKey(p.streamingPriceData[el])}>
              {p.streamingPriceData[el] ? (
                p.streamingPriceData[el]["currentPrice"] !== undefined &&
                p.streamingPriceData[el]["currentPrice"].toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              ) : (
                <></>
              )}
            </td>
          </>
        }
        {this.props.showEditPane === 1 && 
          <>
            <td className="centerTE">{g[el]['exchange']}</td>
            <td className="centerTE">{g[el]['symbol']}</td>
            <td className="leftTe">{g[el]['description']}</td>
            <td className="centerTE">{g[el]['currency']}</td>
            <td className="leftTe">{g[el]['figi']}</td>
            <td className="rightTE">{g[el]['mic']}</td>
            <td className="centerTE" key={el + "rmv"}>
              <button
                key={el + "clck"}
                onClick={(e) => {
                  p.updateGlobalStockList(e, el);
                }}
              >
                <i className="fa fa-times" aria-hidden="true"></i>
              </button>
            </td>
          </>
        }
      </tr>
    )
    );

    return <>{stockListKey}</>;
  } else {
    return <></>
  }

  }

  fileUploadAction() { //what does this do?
    this.inputReference.current.click();
    console.log("upload action")
  }
  
  resetUploadList() {
    this.setState({uploadList: null})
  }

  fileUploadInputChange(e){
    const that = this
    Papa.parse(e.target.files[0], {
      complete: function(results) {
        const newStockList = []
        for (const stock in results.data) {
          // console.log(results.data, stock, "<--------------")
          if (results.data[stock][1] !== undefined) {
            const thisStock = results.data[stock][0].toUpperCase() + '-' + results.data[stock][1].toUpperCase()
            newStockList.push(thisStock)
          }
        }
        that.setState({uploadList: newStockList})
      }
    });
  }

  render() {
    
    const tab = {'textIndent': '25px',}

    const helpText = <>
      Upload a .CSV file to load a new stock watchlist.<br />
      The CSV should contain two values per line: <br />
      <div style={tab}>  1. Exchange symbol <br /></div>
      <div style={tab}>2. Stock Symbol <br /></div>
      Example file shown below: <br />
      <div style={tab}>US, AAPL <br /></div>
      <div style={tab}>US, MSFT <br /></div>
      <div style={tab}>US, GOOGL <br /></div>
    </>

    const syncText = <>
    Set all widgets stocklists equal to global stock list.<br />
    Useful after copying a dashboard and quickly updating all widgets to new stock list. <br />

    </>

    return (
      <>
        {this.props.showEditPane === 1 && (
          <>
          {React.createElement(StockSearchPane, searchPaneProps(this))}
          <div>
            <input type="file" hidden ref={this.inputReference} onChange={this.fileUploadInputChange} />
            <button className="ui button" onClick={this.fileUploadAction}>
                Upload CSV
            </button>
            <ToolTip textFragment={helpText} hintName='wl' /> <br />
            <button className="ui button" onClick={this.props.syncGlobalStockList}>
                Sync Widgets
            </button>
            <ToolTip textFragment={syncText} hintName='sw' /> <br />
          </div>

          </>
        )}
        <div className='.widgetTableDiv' style={{overflow: 'scroll'}}>
          <table className='widgetBodyTable'>
            <thead>
              <tr>
                {this.props.showEditPane === 0 &&
                  <>
                    <td className="centerTE">Symbol</td>
                    <td className="centerTE">Name</td>
                    <td className="centerTE">Price</td>
                  </>
                }
                {this.props.showEditPane === 1 &&  <> 
                  <td className="centerTE">Exchange</td>
                  <td className="centerTE">Symbol</td>
                  <td className="centerTE">Name</td>
                  <td className="centerTE">Currency</td>
                  <td className="centerTE">FIGI</td>
                  <td className="centerTE">MIC</td>
                  <td className="centerTE">Remove</td>
                  </>
                }
              </tr>
            </thead>
            <tbody>{this.renderWatchedStocks()}</tbody>
          </table>
        </div>
      {this.state.uploadList !== null && (
        <CsvUpload 
          uploadList={this.state.uploadList} 
          resetUploadList={this.resetUploadList}
          uploadGlobalStockList={this.props.uploadGlobalStockList}
        />
      )}
      </>
    );
    
  };
}

export function watchListMenuProps(that, key = "WatchListMenu") {
  const helpText = <>
    All stocks added to Watchlist become default stocks for new widgets. <br />
    Each stock on watchlist also opens a socket connection for steaming data.<br />
    Some widgets are updating by socket connections.
    </>
  
  let propList = {
    apiKey: that.props.apiKey,
    globalStockList: that.props.globalStockList,
    showPane: that.props.showPane,
    streamingPriceData: that.props.streamingPriceData,
    updateGlobalStockList: that.props.updateGlobalStockList,
    updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: key,
    throttle: that.props.throttle,
    exchangeList: that.props.exchangeList,
    defaultExchange: that.props.defaultExchange,
    updateDefaultExchange: that.props.updateDefaultExchange,
    uploadGlobalStockList: that.props.uploadGlobalStockList,
    helpText: [helpText, 'WLM'],
    syncGlobalStockList: that.props.syncGlobalStockList
  };
  return propList;
}

export default WatchListMenu;
