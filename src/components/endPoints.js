import React from "react";
import {finnHub} from "../appFunctions/throttleQueue.js";
import EndPointNode from "./endPointNode.js";

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
        this.retrieveEndPointData = this.retrieveEndPointData.bind(this);
        this.backButton = this.backButton.bind(this);

    }

    retrieveEndPointData(el){
        const that = this
        const p = this.props
        const queryString = `${window.location.origin}/endPoint?apiKey=${p.apiKey}&dashBoardName=${el}`
        this.setState({
            showData: true,
            showLoader: true,
            title: queryString,     
        }, ()=> {
            finnHub(this.props.throttle, queryString)
            .then((data) => {
            try {
                that.setState({ 
                        endPointData: data,
                        showData: true,
                        showLoader: false,
                        });

            } catch (err) {
                console.log("Could not parse endpoint data.", err);
            }
            })
            .catch(error => {
            console.log(error.message)
            });
        })
    }

    renderEndPointRows(){
        const p = this.props
        // console.log(Object.keys(p.dashBoardData))
        return Object.keys(p.dashBoardData).map((el) => 
            <tr key={el + "row"}>
                <td key={el + "dash"}>{el}</td>
                <td key={el + "api"}>{`${window.location.origin}/endPoint?apiKey=${p.apiKey}&dashBoardName=${el}`}</td>
                <td key={el + "prev"}>
                    <button onClick={()=>{this.retrieveEndPointData(el)}}>
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
        const dataStyle = {
            overflow: 'scroll',
            border: '10px solid',
            borderRadius: '10px',
            backgroundColor: 'white',
            width: '80%',
            height: '100%',
            padding: '10px',
            borderColor: '#1d69ab',
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
                <table key="endTable">
                    <thead key="endHead">
                        <tr key="endHeadRow">
                            <td key="headItemDash">Dashboard</td>
                            <td key="headItemEnd">API Endpoint</td>
                            <td key="headItemPrev">Preview</td>
                        </tr>
                    </thead>
                    <tbody key="endBody">
                        {this.renderEndPointRows()}
                    </tbody>
                </table>
            </> : <div style={dataStyle}>
                    {this.state.showLoader === true ? <>
                        <div style={loader} /> <br /> 
                        Loading Dashboard 
                    </>  : <label>Endpoint URL: {this.state.title}</label> }
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
        throttle: that.state.throttle,
    };
    return propList;
}