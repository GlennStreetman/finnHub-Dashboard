import React from "react";
import { widgetSetup } from './../App'
import { finnHubQueue } from "./../appFunctions/appImport/throttleQueueAPI";
import { toggleBackGroundMenu } from 'src/appFunctions/appImport/toggleBackGroundMenu'
import { rSetApiKey } from 'src/slices/sliceAPIKey'
import { rSetApiAlias } from 'src/slices/sliceAPIAlias'
import { connect } from "react-redux";
import { storeState } from 'src/store'

interface AccountMenu { //plug
    [key: string]: any
}

interface accountMenuProps2 {
    finnHubQueue: finnHubQueue,
    apiKey: string,
    apiAlias: string,
    widgetKey: string,
    exchangeList: string[],
    tGetSymbolList: Function,
    defaultExchange: string,
    updateAppState: Function,
    backgroundMenu: string,
    rSetApiKey: Function,
    rSetApiAlias: Function,

}

interface accountMenuState {
    loginName: string,
    email: string,
    webHook: string,
    editToggle: number,
    editField: string,
    inputText: string,
    serverMessage: string,
    rateLimit: number,
    widgetSetup: widgetSetup | null
}

interface payload {
    loginName: string,
    email: string,
    webHook: string,
    rateLimit: number,
    widgetSetup: widgetSetup | null
}

class AccountMenu extends React.Component<accountMenuProps2, accountMenuState> {
    constructor(props: accountMenuProps2) {
        super(props);
        this.state = {
            loginName: "",
            email: "",
            // apiKey: "",
            webHook: "",
            editToggle: 0,
            editField: "",
            inputText: "",
            serverMessage: "",
            rateLimit: 0,
            widgetSetup: null,
        };
        this.baseState = { mounted: true }
        this.getAccountData = this.getAccountData.bind(this);
        this.changeAccountData = this.changeAccountData.bind(this);
        this.showEditPane = this.showEditPane.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    componentDidMount() {
        this.getAccountData(this.baseState);
    }

    componentWillUnmount() {
        this.baseState.mounted = false
    }

    handleChange(e: any) {
        this.setState({ inputText: e.target.value });
    }

    getAccountData(baseState: { mounted: boolean }) {
        fetch(`/accountData`)
            .then((response) => response.json())
            .then((data) => {
                if (baseState.mounted === true) {
                    const dataSet = data["userData"];
                    const rateLimit = dataSet.ratelimit !== null ? dataSet.ratelimit : 25
                    const widgetSetup = JSON.parse(dataSet['widgetsetup'])
                    const payload: payload = {
                        loginName: dataSet["loginname"],
                        email: dataSet["email"],
                        webHook: dataSet["webhook"],
                        rateLimit: rateLimit,
                        widgetSetup: widgetSetup,
                    }
                    this.props.rSetApiAlias(dataSet["apialias"])
                    this.props.rSetApiKey(dataSet["apikey"])
                    this.setState(payload)
                }
            })
            .catch((error) => {
                console.error("Failed to retrieve user data" + error);
            });
    }

    changeAccountData(changeField: string, newValue: string, baseState: { mounted: boolean }) {
        const data = {
            field: changeField,
            newValue: newValue,
        };
        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        };
        if (changeField === "apikey") {
            console.log('updating apikey')
            this.props.updateAppState({ apiKey: newValue })
        }
        if (changeField === 'ratelimit') {
            this.props.finnHubQueue.updateInterval(newValue)
        }
        fetch("/accountData", options)
            .then((response) => response.json())
            .then((data) => {
                if (baseState.mounted === true) {
                    this.getAccountData(baseState);
                    this.setState({
                        editToggle: 0,
                        inputText: "",
                        serverMessage: data.message,
                    });
                }
            });
        if (changeField === 'apikey' && newValue !== '') this.props.tGetSymbolList({
            exchange: this.props.defaultExchange,
            apiKey: newValue,
            finnHubQueue: this.props.finnHubQueue,
        })
    }

    showEditPane(targetField: string) {
        this.setState({ editField: targetField });
        this.setState({ editToggle: 1 });
        this.setState({ serverMessage: "" });
    }

    render() {
        const s: accountMenuState = this.state

        const divOutline = {
            border: '5px solid',
            borderRadius: '10px',
            backgroundColor: 'white',
            padding: '5px',
            borderColor: '#1d69ab',
        }
        const messageStyle = {
            'textAlign': 'center' as const
        }

        //@ts-ignore
        const edit = s[s.editField]
        return (
            <>
                {this.state.editToggle === 0 && (
                    <div style={divOutline}>
                        <b>Account Data:</b>
                        <table>
                            <tbody>
                                <tr>
                                    <td>Login:</td>
                                    <td>{this.state.loginName}</td>
                                    <td>
                                        <button onClick={() => this.showEditPane("loginname")}>edit</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Email:</td>
                                    <td>{this.state.email}</td>
                                    <td>
                                        <button onClick={() => this.showEditPane("email")}>edit</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>apiKey:</td>
                                    <td>{this.props.apiKey}</td>
                                    <td>
                                        <button onClick={() => this.showEditPane("apikey")}>edit</button>
                                    </td>
                                </tr>
                                {/* <tr>
                                    <td>webHook Key:</td>
                                    <td>{this.state.webHook}</td>
                                    <td>
                                        <button onClick={() => this.showEditPane("webhook")}>edit</button>
                                    </td>
                                </tr> */}
                                <tr>
                                    <td>Active Exchanges: </td>
                                    <td>{this.props.exchangeList.toString()}</td>
                                    <td>
                                        <button onClick={() => toggleBackGroundMenu("exchangeMenu", this.props.updateAppState, this.props.backgroundMenu)}>edit</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>API Rate Limit: </td>
                                    <td>{this.state.rateLimit}</td>
                                    <td>
                                        <button onClick={() => this.showEditPane("ratelimit")}>edit</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>API Alias: </td>
                                    <td>{this.props.apiAlias}</td>
                                    <td>
                                        <button onClick={() => this.showEditPane("apialias")}>edit</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Manage Widgets: </td>
                                    <td></td>
                                    <td>
                                        <button onClick={() => toggleBackGroundMenu("widgetMenu", this.props.updateAppState, this.props.backgroundMenu)}>edit</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        {this.state.serverMessage !== "" && (
                            <div style={messageStyle}><b >{this.state.serverMessage}</b></div>
                        )}
                    </div>
                )}
                {this.state.editToggle === 1 && (
                    <table>
                        <tbody>
                            <tr>
                                <td>{edit}</td>
                            </tr>
                            <tr>
                                <td>{"New " + this.state.editField + ":"}</td>
                                <td>
                                    <input type="text" value={this.state.inputText} onChange={this.handleChange}></input>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <button value="Submit" onClick={() => this.setState({ editToggle: 0 })}>
                                        Cancel
                                    </button>
                                </td>
                                <td>
                                    <button value="Submit" onClick={() => this.changeAccountData(this.state.editField, this.state.inputText, this.baseState)}>
                                        Submit
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                )}
            </>
        );
    }
}

const mapStateToProps = (state: storeState) => ({
    apiKey: state.apiKey,
    apiAlias: state.apiAlias,
    exchangeList: state.exchangeList.exchangeList,
    defaultExchange: state.defaultExchange,
});

export function accountMenuProps(that: any, key = "AccountMenu") {
    let propList = {
        finnHubQueue: that.state.finnHubQueue,
        widgetKey: key,
        updateAppState: that.updateAppState,
        tGetSymbolList: that.props.tGetSymbolList,
        backgroundMenu: that.state.backgroundMenu,
    };
    return propList;
}

export default connect(mapStateToProps, { rSetApiKey, rSetApiAlias })(AccountMenu);
