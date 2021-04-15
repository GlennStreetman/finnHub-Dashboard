import React from "react";
import EndPointData from './endPointData'

export default class EndPointNode extends React.PureComponent {

    constructor(props) {
        super(props);
            this.state = {
        };
            this.renderNodeData = this.renderNodeData.bind(this);
            this.toggleDataButton = this.toggleDataButton.bind(this);
            this.isLink = this.isLink.bind(this);
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

    isLink(el){
        const p = this.props
        const url = window.location
        let baseURL = url.protocol + "/" + url.host + "/" + url.pathname.split('/')[1] + 'graphQL';
        baseURL = baseURL.replace('http:/localhost:3000', '//localhost:5000') //makes redirect work in dev mode.
        // const defaultQuery = `{dashboardList(key: "${p.apiKey}") {dashboard}}`

        if (p.searchList.length === 3 && el === 'data' && p.searchList[0] === 'widget') {
            const queryProps = `(key: "${p.apiKey}" dashboard: "${p.searchList[1]}" widget: "${p.searchList[2]}")`
            const returnValues = `dashboard, widgetType, widgetName, security, data`
            const thisQuery = `{${p.searchList[0]}${queryProps} {${returnValues}}}`
            return(<a href={`${baseURL}?query=${thisQuery}`} target='_blank' rel="noreferrer">{el}</a>)
        } else if (p.searchList.length === 2 && p.searchList[0] === 'security'){
            const queryProps = `(key: "${p.apiKey}" dashboard: "${p.searchList[1]}" security: "${el}")`
            const returnValues = `dashboard, widgetType, widgetName`
            const thisQuery = `{${p.searchList[0]}${queryProps} {${returnValues}}}`
            return(<a href={`${baseURL}?query=${thisQuery}`} target='_blank' rel="noreferrer">{el}</a>)
        } else if (p.searchList.length === 4 && el === 'data' && p.searchList[0] === 'security'){
            const queryProps = `(key: "${p.apiKey}" dashboard: "${p.searchList[1]}" security: "${p.searchList[2]}" widgetName: "${p.searchList[3]}")`
            const returnValues = `dashboard, widgetType, widgetName, data`
            const thisQuery = `{${p.searchList[0]}${queryProps} {${returnValues}}}`
            return(<a href={`${baseURL}?query=${thisQuery}`} target='_blank' rel="noreferrer">{el}</a>)
        } else {
            return el
        }
    }

    renderNodeData() {
        
        //for each item in object, if object return button logic, else return string
        const p = this.props
        
        // console.log("nodeData", p.nodeData)
        const objectKeyZeroToList = Object.keys(p.nodeData).map((el, ind) => {
            // console.log('el',ind, Object.keys(p.nodeData))
            if (el === 'data' && this.state[el] !== true) { //data Object closed                  
                return (
                    <li className='liNode'  key={ind + 'dataObj'}>
                    <div className='endPointDivRow' >
                        {this.isLink(el)} - <button className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                            <i className="fa fa-caret-square-o-down" aria-hidden="true"></i>
                        </button>
                    </div>
                </li> 
                )
            } else if (el === 'data' ) {//data Object open
                const pushSearchList = [...p.searchList, el]
                return (
                    <li className='liNode' key={ind + 'dataObj'}>
                        <div className='endPointDivRow' >
                            {this.isLink(el)}<button  className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i  className="fa fa-caret-square-o-down" aria-hidden="true"></i>
                            </button>
                            <div className='endPointDivColumn'>
                                <EndPointData
                                    nodeData={p.nodeData[el]} 
                                    widgetID = {p.nodeData.widgetID}
                                    dashboard = {p.dashboard}
                                    apiKey={p.apiKey}
                                    searchList={pushSearchList}
                                />
                            </div>
                        </div>
                    </li>
                )
            } else if (typeof p.nodeData[el] === 'object' && p.nodeData[el] !== null && this.state[el] !== true) {
                //closed object not data
                return (
                    <li className='liNode' key={ind + 'NotData'}>
                        <div>
                            {this.isLink(el)} <button className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i  className="fa fa-caret-square-o-right" aria-hidden="true"></i>
                            </button>
                        </div>
                    </li>
                )
            } else if (typeof p.nodeData[el] === 'object' && p.nodeData[el] !== null) {
                //open object not data
                const pushSearchList = [...p.searchList, el]
                return (
                    <li className='liNode'  key={ind + 'NotData'}>
                        <div className='endPointDivRow' >
                            {this.isLink(el)}
                            <button  className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i  className="fa fa-caret-square-o-down" aria-hidden="true"></i>
                            </button>
                            <div  className='endPointDivColumn'>
                                <EndPointNode 
                                    nodeData={p.nodeData[el]} 
                                    dashboard={p.dashboard}
                                    apiKey={p.apiKey}
                                    searchList={pushSearchList}
                                />
                            </div>
                        </div>
                    </li>
                )
            }  else if (el !== 'widgetID') {
                let thisString = this.props.nodeData[el]
                return(
                    <li className='liNode'  key={ind + 'listring'}>
                        <div>{el} - {thisString} </div>
                    </li>
                )
            }
            else {return (<></>)}
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