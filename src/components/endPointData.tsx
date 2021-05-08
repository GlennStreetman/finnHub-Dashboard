import React from "react";
import EndPointNode from './endPointNode'
import produce from "immer"
import { reqObj, resObj } from '../server/routes/mongoDB/findMongoData'

export default class endPointData extends React.Component<any, any> {

    constructor(props) {

        super(props);
        this.state = {
            endPointData: {}
        };
        this.renderNodeData = this.renderNodeData.bind(this);
        this.toggleDataButton = this.toggleDataButton.bind(this);
        this.getData = this.getData.bind(this)

    }

    componentDidMount() {
        const p = this.props
        const startData = {}
        for (const key in p.nodeData) {
            startData[key] = {}
            this.setState({
                [key]: false,
            })
        }
        this.setState({ endPointData: startData })
    }

    componentDidUpdate(prevProps) {
        const p = this.props
        if (p.nodeData !== prevProps.nodeData) {
            for (const key in p.nodeData) {
                const checkObject = p.nodeData[key]
                typeof checkObject === 'object' && checkObject !== null && this.setState({ [key]: false })
            }
        }
    }


    async getData(stock) {

        const s = this.state
        const p = this.props

        const optionBody: reqObj = {
            searchList: [`${p.widgetID}-${stock}`],
            dashboard: p.dashboard
        }

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(optionBody),
        };
        const getData = await fetch('/findMongoData', options)
        const resData: resObj[] = await getData.json()
        const setData = await produce(s.endPointData, (draftState) => {
            if (resData !== undefined && resData.length) draftState[stock]['data'] = resData[0].data
        })
        this.setState({ endPointData: setData })
    }

    toggleDataButton(el) {
        this.setState({ [el]: !this.state[el] })
        this.getData(el)
    }

    isLink(el) {
        const p = this.props
        if (p.searchList?.[0] === 'widget') {
            const url = window.location
            let baseURL = url.protocol + "/" + url.host + "/" + url.pathname.split('/')[1] + 'graphQL';
            baseURL = baseURL.indexOf('localhost') >= 0 ?
                baseURL.replace('http:/localhost:3000', 'localhost:5000') : //makes redirect work in dev mode.
                baseURL.replace('https:/', '')
            // const defaultQuery = `{dashboardList(key: "${p.apiKey}") {dashboard}}`
            const queryProps = el !== 'market' ?
                `(key: "${p.apiKey}" dashboard: "${p.searchList[1]}" widget: "${p.searchList[2]}" security: "${el}")` :
                `(key: "${p.apiKey}" dashboard: "${p.searchList[1]}" widget: "${p.searchList[2]}")`
            const returnValues = `dashboard, widgetType, widgetName, security, data`
            const thisQuery = `{${p.searchList[0]}${queryProps} {${returnValues}}}`
            return (<a href={`//${baseURL}?query=${thisQuery}`} target='_blank' rel="noreferrer">{el}</a>)
        } else return (el)
    }

    renderNodeData() {
        const p = this.props
        //for each item in object, if object return button logic, else return string
        // const p = this.props
        const s = this.state
        const objectKeyZeroToList = Object.keys(s.endPointData).map((el, ind) => {
            if (typeof s.endPointData[el] === 'object' && s.endPointData[el] !== null && this.state[el] !== true) {
                return (
                    <li className='liNode' key={ind + 'li'}>
                        <div key={ind}>
                            {this.isLink(el)} - <button className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i className="fa fa-caret-square-o-right" aria-hidden="true"></i>
                            </button>
                        </div>
                    </li>
                )
            } else if (typeof s.endPointData[el] === 'object' && s.endPointData[el] !== null) {
                const thisNode = s.endPointData[el] && s.endPointData[el].data ?
                    <EndPointNode
                        nodeData={s.endPointData[el].data}
                        dashboard={p.dashboard}
                        apiKey={p.apiKey}
                        searchList={p.searchList}
                    /> :
                    <>...loading</>
                return (
                    <li className='liNode' key={ind + 'li'}>
                        <div className='endPointDivRow' key={ind}>
                            {this.isLink(el)} <button className='headerButtonsLeft' onClick={() => this.toggleDataButton(el)}>
                                <i className="fa fa-caret-square-o-down" aria-hidden="true"></i>
                            </button>
                            <div className='endPointDivColumn'>{thisNode}</div>
                        </div>
                    </li>
                )
            } else {
                let thisString = s.endPointData[el]
                return (
                    <li className='liNode' key={ind + 'li'}>
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
