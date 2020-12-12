import React from "react";

export default class EndPointNode extends React.Component {
      
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

        this.renderNodeData()
    }

    toggleDataButton(el){
        this.setState({[el]: !this.state[el]})
    }

    renderNodeData() {
        //for each item in object, if object return button logic, else return string
        const p = this.props
        const objectKeyZeroToList = Object.keys(p.nodeData).map((el, ind) => {
            // console.log(el, p.nodeData[el])
            if (typeof p.nodeData[el] === 'object' && p.nodeData[el] !== null && this.state[el] === false) {
                return (
                    <li key={ind + 'li'}>
                        <div key={ind}>
                            {el} - <button className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i className="fa fa-caret-square-o-right" aria-hidden="true"></i>
                            </button>
                        </div>
                    </li>
                )
            } else if (typeof p.nodeData[el] === 'object' && p.nodeData[el] !== null) {
                return (
                    <li key={ind + 'li'}>
                        <div className='endPointDivRow' key={ind}>
                            {el} - <button className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i className="fa fa-caret-square-o-down" aria-hidden="true"></i>
                            </button>
                            <div className='endPointDivColumn'><EndPointNode nodeData={p.nodeData[el]} /></div>
                        </div>
                    </li>
                )
            } else {
                let thisString = this.props.nodeData[el]
                // console.log("----------->", thisString)
                return(
                    <li key={ind + 'li'}>
                    <div key={ind}>{el} - {thisString} </div>
                    </li>
                )
            }
        })
        

        return <ul>{objectKeyZeroToList}</ul>
    }
    
     render() {
        return (
            <>
                <><div className='endPointDivColumn'>{this.renderNodeData()}</div></>
            </>
        );
        
    }
}