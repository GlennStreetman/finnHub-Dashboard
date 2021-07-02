import Papa from 'papaparse'
import React from "react";
import StockSearchPane, {searchPaneProps} from "../../../components/stockSearchPane";
import CsvUpload from './csvUpload.js'
import ToolTip from '../../../components/toolTip.js'

import { dStock } from './../../../appFunctions/formatStockSymbols'

export default class WatchListMenu extends React.PureComponent {
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
    if (g && Object.keys(g) !== undefined) {
    const stockListKey = Object.keys(g).map((el) => ( 
    <tr key={el + "row"}>

        {this.props.showEditPane === 0 &&
          <>
            <td><input 
              type="radio" 
              key={el+'radio'} 
              checked={p.targetSecurity === g[el].key} 
              onChange={() => {
                  p.setWidgetFocus(g[el].key)
                  p.setSecurityFocus(g[el].key)
                }} /></td>
            <td key={el + "symb"}>
              {dStock(g[el],p.exchangeList)}
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
            <td className="centerTE">{g[el]['exchange']}</td>
            <td className="centerTE">{g[el]['symbol']}</td>
            <td className="leftTe">{g[el]['description']}</td>
            <td className="centerTE">{g[el]['currency']}</td>
            <td className="leftTe">{g[el]['figi']}</td>
            <td className="rightTE">{g[el]['mic']}</td>  
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

  fileUploadAction() {
    this.inputReference.current.click();
    console.log("upload action")
  }
  
  resetUploadList() {
    console.log("List Uploaded", this.state.uploadList)
    this.setState({uploadList: null})
  }

  fileUploadInputChange(e){
    const that = this
    Papa.parse(e.target.files[0], {
      complete: function(results) {
        const newStockList = []
        for (const stock in results.data) {
          if (results.data[stock][1] !== undefined) {
            const thisStock = results.data[stock][0].toUpperCase() + '-' + results.data[stock][1].toUpperCase()
            newStockList.push(thisStock)
          }
        }
        console.log('newStockList', newStockList)
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
    Set all widgets security list equal to Watchlist Menu security list.<br />
    Also useful after copying a dashboard and quickly updating all widgets with new security list. <br />
    </>

    return (
      <>
        {this.props.showEditPane === 1 && (
          <>
          <div>
            <input type="file" hidden ref={this.inputReference} onChange={this.fileUploadInputChange} />
            <button className="ui button" onClick={this.fileUploadAction}>
                Upload CSV
            </button>
            <ToolTip textFragment={helpText} hintName='wl' /> <br />
            <button className="ui button" onClick={()=> {this.props.syncGlobalStockList()}}>
                Sync
            </button>
            <ToolTip textFragment={syncText} hintName='sw' /> <br />
          </div>

          </>
        )}
        <div >
        {this.props.showEditPane !== 1 &&(<>{React.createElement(StockSearchPane, searchPaneProps(this))}</>)}
        </div>

        <div className='.widgetTableDiv' style={{overflow: 'scroll'}}>
          <table className='widgetBodyTable'>
            <thead>
              <tr>
                {this.props.showEditPane === 0 &&
                  <>
                    <td className="centerTE">Focus</td>
                    <td className="centerTE">Symbol</td>
                    <td className="centerTE">Name</td>
                    <td className="centerTE">Price</td>
                  </>
                }
                {this.props.showEditPane === 1 &&  
                  <> 
                    <td className="centerTE">Remove</td>
                    <td className="centerTE">Exchange</td>
                    <td className="centerTE">Symbol</td>
                    <td className="centerTE">Name</td>
                    <td className="centerTE">Currency</td>
                    <td className="centerTE">FIGI</td>
                    <td className="centerTE">MIC</td>

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
    </>
  
  let propList = {
    apiKey: that.props.apiKey,
    globalStockList: that.props.globalStockList,
    showPane: that.props.showPane,
    streamingPriceData: that.props.streamingPriceData,
    updateGlobalStockList: that.props.updateGlobalStockList,
    updateWidgetStockList: that.props.updateWidgetStockList,
    widgetKey: key,
    exchangeList: that.props.exchangeList,
    defaultExchange: that.props.defaultExchange,
    updateDefaultExchange: that.props.updateDefaultExchange,
    uploadGlobalStockList: that.props.uploadGlobalStockList,
    helpText: [helpText, 'WLM'],
    refreshFinnhubAPIDataCurrentDashboard: that.props.refreshFinnhubAPIDataCurrentDashboard,
    syncGlobalStockList: that.props.syncGlobalStockList,
    setSecurityFocus: that.props.setSecurityFocus,
    targetSecurity: that.props.targetSecurity,
    setWidgetFocus: that.props.setWidgetFocus,
  };
  return propList;
}
