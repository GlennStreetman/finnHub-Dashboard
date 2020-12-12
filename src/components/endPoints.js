import React from "react";
import {finnHub} from "../appFunctions/throttleQueue.js";
import EndPointNode from "./endPointNode.js";

export default class EndPointMenu extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            endPointData: {},
            showData: false,
        };

        this.renderEndPointRows = this.renderEndPointRows.bind(this);
        this.retrieveEndPointData = this.retrieveEndPointData.bind(this);

    }

    retrieveEndPointData(el){
        const that = this
        const p = this.props
        const queryString = `${window.location.origin}/endPoint?apiKey=${p.apiKey}&dashBoardName=${el}`
        finnHub(this.props.throttle, queryString)
        .then((data) => {
          try {
            that.setState({ 
                    endPointData: data,
                    showData: true,
                    });

          } catch (err) {
            console.log("Could not parse endpoint data.", err);
          }
        })
        .catch(error => {
          console.log(error.message)
        });
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

    render() {
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
            {/* </> : <></> */}

            </> : <EndPointNode nodeData={this.state.endPointData}/>
        );
        
    }
}

// fetch(`http://localhost:3000/endPoint?apiKey=bsuu7qv48v6qu589jlj0&dashBoardName=TEST`)
//     .then(res => res.json())
//     .then(data => console.log(data));