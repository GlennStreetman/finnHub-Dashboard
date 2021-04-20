import React from "react";
import produce from "immer"
import EndPointNode from "./endPointNode";
// import { findByLabelText } from "@testing-library/dom";


export default class EndPointMenu extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            endPointData: {},
            showData: false,
            showLoader: false,
            title: '',
            displayType: [], 
        };

        this.renderEndPointRows = this.renderEndPointRows.bind(this);
        this.backButton = this.backButton.bind(this);
        this.showEndPointDataWidget = this.showEndPointDataWidget.bind(this);
        this.showEndPointDataSecurity = this.showEndPointDataSecurity.bind(this);
    }

    async showEndPointDataWidget(el, searchType){ //receives dashboard object, builds endpoint display
        const p = this.props
        let displayWidgetList = await produce(p.dashBoardData[el].widgetlist, (draftState)=>{
            // console.log("draftstate", p.dashBoardData, p.dashBoardData[el],draftState)
            for (const w in draftState){
                const widgetName = draftState[w].widgetHeader
                const widgetNameDistinct = draftState[w].widgetHeader + w
                const widgetDetails = draftState[w]
                // const id = widgetDetails.widgetID
                delete widgetDetails.column
                delete widgetDetails.columnOrder
                delete widgetDetails.widgetConfig
                delete widgetDetails.widgetHeader
                // delete widgetDetails.widgetID
                delete widgetDetails.xAxis
                delete widgetDetails.yAxis
                if (Object.keys(widgetDetails.config).length === 0) delete widgetDetails.config
                if (Object.keys(widgetDetails.filters).length === 0) delete widgetDetails.filters
                
                const keys = Object.keys(widgetDetails.trackedStocks)
                widgetDetails.data = {}
                for (const stock of keys) {
                    widgetDetails.data[stock] = stock
                }

                draftState[widgetName] ? draftState[widgetNameDistinct] = widgetDetails : draftState[widgetName] = widgetDetails
                delete draftState[w]
            }

        })
        this.setState({ 
            displayType: searchType,
            endPointData: displayWidgetList,
            showData: true,
            showLoader: false,
            dashboard: el,
        })

    }

    async showEndPointDataSecurity(el, searchType){ //receives dashboard object, builds endpoint display.
        //build set of stocks.
        //for each stock, get list of widgets
        //for each widgget for each stock, show details and data
        const p = this.props
        const returnObj = {}
        const widgetList = p.dashBoardData[el].widgetlist 
        for (const w in widgetList){
            const stocks = widgetList[w].trackedStocks
            for (const s in stocks) {
                if (returnObj[s] === undefined) returnObj[s] = {}
                returnObj[s].security = stocks[s]
                returnObj[s][widgetList[w].widgetHeader] = {}
                returnObj[s][widgetList[w].widgetHeader].widgetType = widgetList[w].widgetType
                returnObj[s][widgetList[w].widgetHeader].filters = widgetList[w].filters
                returnObj[s][widgetList[w].widgetHeader].widgetID = widgetList[w].widgetID
                returnObj[s][widgetList[w].widgetHeader].data = {}
                returnObj[s][widgetList[w].widgetHeader].data[s] = s
            }
        }

        this.setState({ 
            displayType: searchType,
            endPointData: returnObj,
            showData: true,
            showLoader: false,
            dashboard: el,
        })

    }


    renderEndPointRows(){
        const p = this.props
        const thisDashboard = p.dashBoardData
        return Object.keys(thisDashboard).map((el) => 
            <tr key={el + "row"}>
                <td key={el + "dash"}>{el}</td>
                <td key={el + "api"}>
                    <button onClick={()=>{this.showEndPointDataWidget(el, ['widget', el])}}>
                        <i className="fa fa-check-square-o" aria-hidden="true"></i>
                    </button>
                </td>
                <td key={el + "prev"}>
                    <button onClick={()=>{this.showEndPointDataSecurity(el, ['security', el])}}>
                        <i className="fa fa-check-square-o" aria-hidden="true"></i>
                    </button>
                </td>
            </tr>
        )
    }

    backButton(){
        this.setState({showData: false})
    }

    render() {
        const divOutline = {
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: '#1d69ab',
            borderRadius: '10px',
            backgroundColor: 'white',
            padding: '5px',
        }

        const dataStyle = {
            overflow: 'scroll',
            borderWidth: '5px',
            borderStyle: 'solid',
            borderColor: '#1d69ab',
            borderRadius: '10px',
            backgroundColor: 'white',
            width: '80%',
            height: '100%',
            padding: '10px',
        }
        const loader = {
            border: '16px solid #f3f3f3',
            borderRadius: '50%',
            borderTop: '16px solid #3498db',
            width: '120px',
            height: '120px',
            WebkitAnimation: 'spin 2s linear infinite', /* Safari */
            animation: 'spin 2s linear infinite',
        }
        
        const menuConent = {
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
            textAlign: "center"
        }

        const tHeadStyle = {
            paddingLeft: '10px',
            paddingRight: '10px',
        }

        const url = window.location
        const p = this.props
        let baseURL = url.protocol + "/" + url.host + "/" + url.pathname.split('/')[1] + 'graphQL';
        baseURL = baseURL.indexOf('localhost') >= 0 ? 
            baseURL.replace('http:/localhost:3000', 'localhost:5000') : //makes redirect work in dev mode.
            baseURL.replace('https:/', '')
        const apiToggle = !(p.apiAlias in [undefined, '']) ? p.apiAlias : p.apiKey 
        const defaultQuery = `{dashboardList(key: "${apiToggle}") {dashboard}}`
        // console.log(baseURL)
        return (
            this.state.showData === false ? <>
                <div style={menuConent}>
                <div style={divOutline}>  
                    <table>
                        <thead >
                            <tr>
                                <td style={tHeadStyle}>Dashboard</td>
                                <td style={tHeadStyle}> Widget View</td>
                                <td style={tHeadStyle}> Security View</td>
                            </tr>
                        </thead>
                        <tbody key="endBody">
                            {this.renderEndPointRows()}
                        </tbody>
                    </table>
                    
                </div>
                <a href={`//${baseURL}?query=${defaultQuery}`} target='_blank' rel="noreferrer">View in graphQL</a>
                </div>
            </> : //SHOW ENDPOINT
                <div style={dataStyle}>
                    {this.state.showLoader === true ? <>
                        <div style={loader} /> <br /> 
                        Loading Dashboard 
                    </>  : <></>
                    // <label>Endpoint URL: {this.state.title}</label> 
                    }
                    <EndPointNode 
                        nodeData={this.state.endPointData} 
                        dashboard={this.state.dashboard} 
                        searchList={this.state.displayType}
                        apiKey={this.props.apiKey}
                        apiAlias={this.props.apiAlias}
                    />
                    {this.state.showLoader === false ? <>
                    <button onClick={()=>this.backButton()}>
                        Back
                    </button>
                    </> : <></> }
                </div>
        );
        
    }
}

export function endPointProps(that, key = "AccountMenu") {
    let propList = {
        dashBoardData: that.state.dashBoardData,
        apiKey: that.state.apiKey,
        apiAlias: that.state.apiAlias
    };
    return propList;
}