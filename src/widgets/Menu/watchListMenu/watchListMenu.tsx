import React, { useState, forwardRef, useRef, useImperativeHandle } from "react";


import Papa from 'papaparse'
import StockSearchPane, { searchPaneProps } from "../../../components/stockSearchPaneFunc";
import CsvUpload from './csvUpload.js'
import ToolTip from '../../../components/toolTip.js'
import { useAppSelector } from '../../../hooks';
import { dStock } from '../../../appFunctions/formatStockSymbols'



const useSelector = useAppSelector

function WatchListMenu(p: { [key: string]: any }, ref: any) {

  const startingUploadList: string[] = []

  const [uploadList, setUploadList] = useState(startingUploadList)
  const inputReference = useRef<HTMLInputElement>(null);

  const rShowData = useSelector((state) => { //REDUX Data associated with this widget.
    return state.quotePrice.quote
  })

  useImperativeHandle(ref, () => (
    //used to copy widgets when being dragged. example: if widget body renders time series data into chart, copy chart data.
    //add additional slices of state to list if they help reduce re-render time.
    {
      state: {},
    }
  ))

  // export default class WatchListMenu extends React.PureComponent {
  //   constructor(props) {
  //     super(props);
  //     this.state = {
  // uploadList: null //pass in list to trigger up
  // };

  // let inputReference = React.createRef();
  //   this.baseState = {mounted: true}
  //   this.renderWatchedStocks = this.renderWatchedStocks.bind(this);
  //   this.fileUploadAction = this.fileUploadAction.bind(this);
  //   this.fileUploadInputChange = this.fileUploadInputChange.bind(this);
  //   this.returnKey = this.returnKey.bind(this);
  //   this.resetUploadList = this.resetUploadList.bind(this)
  // }

  // componentWillUnmount(){
  //   this.baseState.mounted = false
  // }

  function returnKey(key) {
    const retVal = key !== undefined ? key["currentPrice"] : "noDat"
    return retVal
  }

  function renderWatchedStocks() {

    // const p = this.props
    const g = p.globalStockList;
    if (g && Object.keys(g) !== undefined) {
      const stockListKey = Object.keys(g).map((el) => (
        <tr key={el + "row"}>

          {p.showEditPane === 0 &&
            <>
              <td><input
                type="radio"
                key={el + 'radio'}
                checked={p.targetSecurity === g[el].key}
                onChange={() => {
                  p.setWidgetFocus(g[el].key)
                  p.setSecurityFocus(g[el].key)
                }} /></td>
              <td key={el + "symb"}>
                {dStock(g[el], p.exchangeList)}
              </td>
              <td className="leftTE" key={el + 'desc'}>
                {g[el].description}
              </td>
              <td className="rightTEFade" key={el + "prc" + returnKey(rShowData[el])}>
                {rShowData[el] ? (
                  rShowData[el] !== undefined &&
                  rShowData[el].toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                ) : (
                  <></>
                )}
              </td>

            </>
          }
          {p.showEditPane === 1 &&
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

  function fileUploadAction() {
    if (inputReference.current !== null) inputReference.current.click();
  }

  function resetUploadList() {
    console.log("List Uploaded", uploadList)
    setUploadList([])
  }

  function fileUploadInputChange(e) {
    // const that = this
    Papa.parse(e.target.files[0], {
      complete: function (results: { data: any }) {
        const newStockList: string[] = []
        for (const stock in results.data) {
          if (results.data[stock][1] !== undefined) {
            const thisStock: string = results.data[stock][0].toUpperCase() + '-' + results.data[stock][1].toUpperCase()
            newStockList.push(thisStock)
          }
        }
        console.log('newStockList', newStockList)
        setUploadList(newStockList)
      }
    });
  }

  const tab = { 'textIndent': '25px', }

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
      {p.showEditPane === 1 && (
        <>
          <div>
            <input type="file" hidden ref={inputReference} onChange={fileUploadInputChange} />
            <button className="ui button" onClick={fileUploadAction}>
              Upload
            </button>
            <ToolTip textFragment={helpText} hintName='wl' /> <br />
            <button className="ui button" onClick={() => { p.syncGlobalStockList() }}>
              Sync
            </button>
            <ToolTip textFragment={syncText} hintName='sw' /> <br />
          </div>

        </>
      )}
      <div >
        {p.showEditPane !== 1 && (<>{React.createElement(StockSearchPane, searchPaneProps(p))}</>)}
      </div>

      <div className='.widgetTableDiv' style={{ overflow: 'scroll' }}>
        <table className='widgetBodyTable'>
          <thead>
            <tr>
              {p.showEditPane === 0 &&
                <>
                  <td className="centerTE">Focus</td>
                  <td className="centerTE">Symbol</td>
                  <td className="centerTE">Name</td>
                  <td className="centerTE">Price</td>
                </>
              }
              {p.showEditPane === 1 &&
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
          <tbody>{renderWatchedStocks()}</tbody>
        </table>
      </div>
      {uploadList.length !== 0 && (
        <CsvUpload
          uploadList={uploadList}
          resetUploadList={resetUploadList}
          uploadGlobalStockList={p.uploadGlobalStockList}
        />
      )}
    </>
  );

  // };
}

export default forwardRef(WatchListMenu)

export function watchListMenuProps(that, key = "WatchListMenu") {
  const helpText = <>
    All stocks added to Watchlist become default stocks for new widgets. <br />
    Each stock on watchlist also opens a socket connection for steaming data.<br />
  </>

  let propList = {
    apiKey: that.props.apiKey,
    globalStockList: that.props.globalStockList,
    showPane: that.props.showPane,
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

