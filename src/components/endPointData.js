import React from "react";
import EndPointNode from './endPointNode'
import produce from "immer"


export default class endPointData extends React.Component {

    constructor(props) {
        
        super(props);
            this.state = {
                endPointData: {}
        };
            this.renderNodeData = this.renderNodeData.bind(this);
            this.toggleDataButton = this.toggleDataButton.bind(this);
            this.getData = this.getData.bind(this)

        }

    componentDidMount(){
        const startData = {}
        for (const key in this.props.nodeData) {
            startData[key] = {}
            this.setState({
                [key]: false,
            })
        }
        this.setState({endPointData: startData})
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


    async getData(stock){
        console.log("searching for: ", stock)
        const s = this.state
        const p = this.props
        const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([`${p.dashboard}-${p.widgetID}-${stock}`]),
        };
        const getData = await fetch('/findMongoData', options)
        const foundData = await getData.json()
        console.log('foundData', foundData, options)
        const newData = foundData.resList[0]
        const setData = await produce(s.endPointData, (draftState) => {
            if (newData !== undefined) draftState[stock]['data'] = newData.data
        }) 
        this.setState({endPointData: setData})
}

    toggleDataButton(el){
        this.setState({[el]: !this.state[el]})
        this.getData(el)
    }

    renderNodeData() {
        console.log("rendering node data")
        const p = this.props
        //for each item in object, if object return button logic, else return string
        // const p = this.props
        const s = this.state
        const objectKeyZeroToList = Object.keys(s.endPointData).map((el, ind) => {
            // console.log("1")
            if (typeof s.endPointData[el] === 'object' && s.endPointData[el] !== null && this.state[el] !== true) {
                return (
                    <li className='liNode' key={ind + 'li'}>
                        <div key={ind}>
                            {el} - <button className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i className="fa fa-caret-square-o-right" aria-hidden="true"></i>
                            </button>
                        </div>
                    </li>
                )
            } else if (typeof s.endPointData[el] === 'object' && s.endPointData[el] !== null) {
                const thisNode = s.endPointData[el] && s.endPointData[el].data ? 
                    <EndPointNode nodeData={s.endPointData[el].data } dashboard={p.dashboard}/> : 
                    <>...loading</>
                return (
                    <li className='liNode'  key={ind + 'li'}>
                        <div className='endPointDivRow' key={ind}>
                            {el} - <button className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i className="fa fa-caret-square-o-down" aria-hidden="true"></i>
                            </button>
                            <div className='endPointDivColumn'>{thisNode}</div>
                        </div>
                    </li>
                )
            } else {
                let thisString = s.endPointData[el]
                // console.log("3")
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
