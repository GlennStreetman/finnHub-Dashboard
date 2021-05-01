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
        baseURL = baseURL.indexOf('localhost') >= 0 ? 
            baseURL.replace('http:/localhost:3000', 'localhost:5000') : //makes redirect work in dev mode.
            baseURL.replace('https:/', '')
        if (p?.searchList?.length === 3 && el === 'data' && p?.searchList[0] === 'widget') {
            const apiToggle = !(p.apiAlias in [undefined, '']) ? p.apiAlias : p.apiKey 
            const queryProps = `(key: "${apiToggle}" dashboard: "${p.searchList[1]}" widget: "${p.searchList[2]}")`
            const returnValues = `dashboard, widgetType, widgetName, security, data`
            const thisQuery = `{${p.searchList[0]}${queryProps} {${returnValues}}}`
            return(<a href={`//${baseURL}?query=${thisQuery}`} target='_blank' rel="noreferrer">{el}</a>)
        } else if (p?.searchList?.length === 2 && p.searchList[0] === 'security'){
            const apiToggle = !(p.apiAlias in [undefined, '']) ? p.apiAlias : p.apiKey 
            const queryProps = `(key: "${apiToggle}" dashboard: "${p.searchList[1]}" security: "${el}")`
            const returnValues = `dashboard, widgetType, widgetName`
            const thisQuery = `{${p.searchList[0]}${queryProps} {${returnValues}}}`
            return(<a href={`//${baseURL}?query=${thisQuery}`} target='_blank' rel="noreferrer">{el}</a>)
        } else if (p?.searchList?.length === 4 && el === 'data' && p.searchList[0] === 'security'){
            const apiToggle = !(p.apiAlias in [undefined, '']) ? p.apiAlias : p.apiKey 
            const queryProps = `(key: "${apiToggle}" dashboard: "${p.searchList[1]}" security: "${p.searchList[2]}" widgetName: "${p.searchList[3]}")`
            const returnValues = `dashboard, widgetType, widgetName, data`
            const thisQuery = `{${p.searchList[0]}${queryProps} {${returnValues}}}`
            return(<a href={`//${baseURL}?query=${thisQuery}`} target='_blank' rel="noreferrer">{el}</a>)
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
                    <li className='liNode'  key={ind + 'dataObj1'}>
                    <div key={ind + 'dataObj1Div1'} className='endPointDivRow' >
                        {this.isLink(el)} - <button key={ind + 'dataObj1button1'} className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                            <i key={ind + 'dataObj1link'} className="fa fa-caret-square-o-down" aria-hidden="true"></i>
                        </button>
                    </div>
                </li> 
                )
            } else if (el === 'data' && p.searchList && p.searchList.filter(w=>w==='data').length === 0) {//data Object open
                const pushSearchList = p.searchList ? [...p.searchList, el] : [el]
                return (
                    <li className='liNode' key={ind + 'dataObj2'}>
                        <div key={ind + 'dataObj2Div1'} className='endPointDivRow' >
                            {this.isLink(el)}<button key={ind + 'dataObj2button1'}  className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i key={ind + 'dataObj2link1'}  className="fa fa-caret-square-o-down" aria-hidden="true"></i>
                            </button>
                            <div key={ind + 'dataObj2div2'} className='endPointDivColumn'>
                                <EndPointData
                                    nodeData={p.nodeData[el]} 
                                    widgetID = {p.nodeData.widgetID}
                                    dashboard = {p.dashboard}
                                    apiKey={p.apiKey}
                                    apiToggle={p.apiToggle}
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
                        <div  key={ind + 'NotDatadiv1'}>
                            {this.isLink(el)} <button  key={ind + 'NotDatabutton1'} className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i  key={ind + 'NotDatalink1'}  className="fa fa-caret-square-o-right" aria-hidden="true"></i>
                            </button>
                        </div>
                    </li>
                )
            } else if (typeof p.nodeData[el] === 'object' && p.nodeData[el] !== null) {
                //open object not data
                const isSearchList = p.searchList ? p.searchList : []
                const pushSearchList = [...isSearchList, el]
                return (
                    <li className='liNode'  key={ind + 'NotData'}>
                        <div key={ind + 'NotDatadiv1'} className='endPointDivRow' >
                            {this.isLink(el)}
                            <button key={ind + 'NotDatabutton1'}  className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i key={ind + 'NotDatalink1'} className="fa fa-caret-square-o-down" aria-hidden="true"></i>
                            </button>
                            <div key={ind + 'NotDatadiv2'} className='endPointDivColumn'>
                                <EndPointNode 
                                    nodeData={p.nodeData[el]} 
                                    dashboard={p.dashboard}
                                    apiKey={p.apiKey}
                                    apiAlias={p.apiAlias}
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
                        <div key={ind + 'listringdiv1'}>{el} - {thisString} </div>
                    </li>
                )
            }
            else {return (<div key='plug'></div>)}
        })
        
        return <ul className='ulNode'>{objectKeyZeroToList}</ul>
    }
    
    render() {
        return (
            <>
                <><div className='endPointDivColumn'>{this.renderNodeData()}</div></>
            </>
        );
        
    }
}