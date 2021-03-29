import React from "react";
import EndPointData from './endPointData'

export default class EndPointNode extends React.PureComponent {

    constructor(props) {
        super(props);
            this.state = {
        };
            this.renderNodeData = this.renderNodeData.bind(this);
            this.toggleDataButton = this.toggleDataButton.bind(this);

        }

    componentDidMount(){
        for (const key in this.props.nodeData) {
            const checkObject = this.props.nodeData[key]
            typeof checkObject === 'object' && checkObject !== null && this.setState({[key]: false})
        }
    }

    componentDidUpdate(prevProps){
        const p = this.props
        if (p.nodeData !== prevProps.nodeData) {
            for (const key in this.props.nodeData) {
                const checkObject = this.props.nodeData[key]
                typeof checkObject === 'object' && checkObject !== null && this.setState({[key]: false})
            }
        }
    }

    toggleDataButton(el){
        this.setState({[el]: !this.state[el]})
    }

    renderNodeData() {
        // console.log("rendering node data")
        //for each item in object, if object return button logic, else return string
        const p = this.props
        // console.log("nodeData", p.nodeData)
        const objectKeyZeroToList = Object.keys(p.nodeData).map((el, ind) => {
            console.log("found data")
            if (el === 'data' && this.state[el] !== true) {
                return (
                    <li className='liNode'  key={ind + 'li'}>
                        <div className='endPointDivRow' key={ind}>
                            {el} - <button className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i className="fa fa-caret-square-o-down" aria-hidden="true"></i>
                            </button>
                            {/* <div className='endPointDivColumn'><EndPointData nodeData={p.nodeData[el]} /></div> */}
                        </div>
                    </li>
                )
            } else if (el === 'data' ) {
                return (
                    <li className='liNode'  key={ind + 'li'}>
                        <div className='endPointDivRow' key={ind}>
                            {el} - <button className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i className="fa fa-caret-square-o-down" aria-hidden="true"></i>
                            </button>
                            <div className='endPointDivColumn'><EndPointData nodeData={p.nodeData[el]} widgetID = {p.nodeData.widgetID}  /></div>
                        </div>
                    </li>
                )

            } else if (typeof p.nodeData[el] === 'object' && p.nodeData[el] !== null && this.state[el] !== true) {
                // console.log("Closed Node detected", p.nodeData[el])
                return (
                    <li className='liNode' key={ind + 'li'}>
                        <div key={ind}>
                            {el} - <button className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i className="fa fa-caret-square-o-right" aria-hidden="true"></i>
                            </button>
                        </div>
                    </li>
                )
            } else if (typeof p.nodeData[el] === 'object' && p.nodeData[el] !== null) {
                return (
                    <li className='liNode'  key={ind + 'li'}>
                        <div className='endPointDivRow' key={ind}>
                            {el} - <button className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i className="fa fa-caret-square-o-down" aria-hidden="true"></i>
                            </button>
                            <div className='endPointDivColumn'><EndPointNode nodeData={p.nodeData[el]} /></div>
                        </div>
                    </li>
                )
            }  else if (el !== 'widgetID') {
                let thisString = this.props.nodeData[el]
                // console.log("----------->", thisString)
                return(
                    <li className='liNode'  key={ind + 'li'}>
                    <div key={ind}>{el} - {thisString} </div>
                    </li>
                )
            }
        })
        

        return <ul className='ulNode' >{objectKeyZeroToList}</ul>
    }
    
     render() {
        return (
            <>
                <><div className='endPointDivColumn'>{this.renderNodeData()}</div></>
            </>
        );
        
    }
}