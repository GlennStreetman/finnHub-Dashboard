import React from "react";
import produce from "immer"
import EndPointNode from "./endPointNode";

export default class EndPointMenu extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            endPointData: {},
            showData: false,
            showLoader: false,
            title: '',
        };

        this.renderEndPointRows = this.renderEndPointRows.bind(this);
        this.backButton = this.backButton.bind(this);
        this.showEndPointData = this.showEndPointData.bind(this);
    }

    async showEndPointData(el){ //receives dashboard object, builds endpoint display
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
            endPointData: displayWidgetList,
            showData: true,
            showLoader: false,
        })

    }


    renderEndPointRows(){
        const p = this.props
        const thisDashboard = p.dashBoardData
        return Object.keys(thisDashboard).map((el) => 
            <tr key={el + "row"}>
                <td key={el + "dash"}>{el}</td>
                <td key={el + "api"}>{`${window.location.origin}/endPoint?apiKey=${p.apiKey}&dashBoardName=${el}`}</td>
                <td key={el + "prev"}>
                    <button onClick={()=>{this.showEndPointData(el)}}>
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

        return (
            this.state.showData === false ? <>
                <div style={divOutline}>
                    <b>Your dashboard REST API endpoints</b>
                    <table>
                        <thead>
                            <tr>
                                <td >Dashboard</td>
                                <td >API Endpoint</td>
                                <td >Preview</td>
                            </tr>
                        </thead>
                        <tbody key="endBody">
                            {this.renderEndPointRows()}
                        </tbody>
                    </table>
                </div>
            </> : //SHOW ENDPOINT
                <div style={dataStyle}>
                    {this.state.showLoader === true ? <>
                        <div style={loader} /> <br /> 
                        Loading Dashboard 
                    </>  : <></>
                    // <label>Endpoint URL: {this.state.title}</label> 
                    }
                    <EndPointNode nodeData={this.state.endPointData}/>
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
    };
    return propList;
}