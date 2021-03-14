import React from "react";
import {finnHub} from "../appFunctions/throttleQueue";
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
        const thisDashboard = {...p.dashBoardData}
        return Object.keys(thisDashboard).map((el) => 
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