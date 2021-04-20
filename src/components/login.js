import React from "react";
 
import {checkPassword} from "../appFunctions/client/checkPassword";
import {forgotLogin} from "../appFunctions/client/forgotLogin";
import {secretQuestion} from "../appFunctions/client/secretQuestion";
import {newPW} from "../appFunctions/client/newPW";
import {checkLoginStatus} from "../appFunctions/client/checkLoginStatus";
import {registerAccount} from "../appFunctions/client/registerAccount";
// import e from "express";

class login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showMenu: 0, //0 = login, 1 = recover, 2 = register, 3 = secret question, 4 reset password
            secretQuestion: "", //Secret Question
            message: "", //message from server
            userName: "",
            text0: "", 
            text1: "", 
            text2: "", 
            text3: "", 
            text4: "", 
            warn0: "",
            warn1: "",
            warn2: "",
            warn3: "",
            warn4: "",
        };

        this.handleChange = this.handleChange.bind(this);
        this.clearText = this.clearText.bind(this);
        this.handleEnterKeyPress = this.handleEnterKeyPress.bind(this)
        this.emailIsValid = this.emailIsValid.bind(this);
        this.completeLogin = this.completeLogin.bind(this);
        //import functions
        this.checkPassword = checkPassword.bind(this);
        this.checkLoginStatus = checkLoginStatus.bind(this)  
        this.forgotLogin = forgotLogin.bind(this); 
        this.newPW = newPW.bind(this); 
        this.secretQuestion = secretQuestion.bind(this); 
        this.registerAccount = registerAccount.bind(this);
    }

    componentDidMount(){
        const p = this.props
        console.log("Loading loggin screen.")
        if (this.props.queryData.reset === '1') {
            const user = this.props.queryData.users
            fetch(`/findSecret?user=${user}`)
            .then((response) => response.json())
            .then((data) => {
                if (data) {
                    this.setState({showMenu: 3})
                    this.setState({secretQuestion: data.question})
                    this.setState({userName: data.user})
                } else {
                console.log("No response from server")
                }
        })
        .catch((error) => {
            console.error("No server response: ", error);
        });
        }
        if (this.props.queryData.message === '1'){
            this.setState({message: "Thank you for registering. Please login."})
        }
        if (this.props.queryData.message === '2'){
            this.setState({message: "Problem validating email address."})
        }
        
        this.checkLoginStatus(p.processLogin, p.updateExchangeList, p.updateDefaultExchange)
    }

    emailIsValid(email) {
        return /\S+@\S+\.\S+/.test(email);
    };

    handleChange(e) {
        this.setState({ [e.target.name]: e.target.value });
    }

    clearText(showMenuRef) {
        this.setState({ 
            text0: "",
            text1: "",
            text2: "",
            text3: "",
            text4: "",
            text5: "",
            text6: "",
            warn0: "",
            warn1: "",
            warn2: "",
            warn3: "",
            warn4: "",
            warn5: "",
            warn6: "",
            showMenu: showMenuRef,
        });
    }

    handleEnterKeyPress(e, keyFunction) {
        if (e.key === "Enter") {
        // console.log('enter detected')
        keyFunction()
        }
    }

    completeLogin(data){
        const p = this.props
        if (data.login) {
            this.setState({message: ""})
            console.log('login data: ', data)
            p.processLogin(data["key"], data["login"], data['ratelimit'], data['apiAlias']);
            p.updateExchangeList(data.exchangelist)
            p.updateDefaultExchange(data.defaultexchange)
        }
    }

    render() {
        const s = this.state
        //0 = login, 1 = recover, 2 = register
        const submitFunctionLookup = {
        0: () => {
            // console.log("0")
            this.checkPassword(s.text0, s.text1)
            .then((data) => {
                console.log("attempting login")
                if (data.status === 200) {
                    console.log('loggin in')
                    this.completeLogin(data)
                } else {
                    console.log("Failed to login", data)
                    this.setState({message: data.message})
                }
            })
            .catch(() => {
                this.setState({message: "No response from server. Check network connection."})
            })},
        1: () => {
            // console.log("1")
            this.forgotLogin(s.text0)
            .then((data) => {
                this.setState({ message: data.message })
            })
            .catch(() => {
                this.setState({message: "No response from server. Check network connection."})
            })},
        2: () => {
            // console.log("2")
            this.registerAccount(s.text0 , s.text1 , s.text2 , s.text3 , s.text4 , s.text5 , this.emailIsValid)
            .then((data) => {
                if (data.message === 'Please review warnings') {
                    this.setState({...data})
                } else if (data.status === 200) {
                    this.setState({...data}, ()=>this.clearText(0))
                } else {
                    this.setState({...data})
                }
                // this.setState({ message: data.message })
            })
            .catch(() => {
                this.setState({message: "No response from server. Check network connection."})
            })},
        3: () => {
            // console.log("3")
            this.secretQuestion(s.text0, s.userName)
            .then((data) => {
                console.log(data)
                if (data.question) {
                    this.setState({
                        message: "username: " + data["users"],
                        secretQuestion: data["question"]
                    }, ()=>this.clearText(4))
                } else {  
                    this.setState({ message: "Wrong answer, try again." });
                }
            })
            .catch(() => {
                this.setState({message: "No response from server. Check network connection."})
            })
        },
        4: () => {
            // console.log("4")
            this.newPW(s.text0, s.text1)
            .then((data)=>{
                if (data.message === 'true') {
                    this.setState({ message: "Password Updated." }, ()=>this.clearText(0));
                } else {
                    this.setState(data)
                }
            })
            .catch(() => {
                this.setState({message: "No response from server. Check network connection."})
            })
        },
        };
        //[titleText, [inputList], [link names], [link functions]]]
        const formSetup = {
            0: {
                title: "Login to FinnDash", 
                inputs: ["UserName", "Password"],
                linkNames: ["Forgot Login", "Register"],
                linkFunctions: [() => this.clearText(1), () => this.clearText(2)]
            },
            1: {
                title: "Recover login name", 
                inputs: ["Enter Email" ],
                linkNames: ["Back", "Register"],
                linkFunctions: [() => this.clearText(0), () => this.clearText(2)]
            },
            2: {
                title: "Register Finndash Account", 
                inputs:["UserName", "Password", "Re-Enter Password","Email", "Secret Question", "Secret Answer"],
                linkNames: ["Back", "Forgot Login"],
                linkFunctions: [() => this.clearText(0), () => this.clearText(1)]
            },
            3: {
                title:"Answer Secret Question:", 
                inputs: ["Secret Answer"],
                linkNames: ["Back", "Register"],
                linkFunctions: [() => this.clearText(0), () => this.clearText(2)]
            },
            4: {
                title: "New Password", 
                inputs: ["Enter New Password", "Re-Enter Password"],
                linkNames: ["Back", "Register"],
                linkFunctions: [() => this.clearText(0), () => this.clearText(2)]
            },
        }

        const thisForm = formSetup[s.showMenu]
        const renderInputs = thisForm.inputs.map((el, index)=>
            <div key={el + index + s.showMenu}>
                <div className="login-div" key={el+"div"}>
                    {s["warn"+ index] === "" ? 
                    <b className="login-text" key={el+"title"}>{el}</b> :
                    <b className='login-Message' key={el + "b"}>{s["warn"+ index]}</b>
                }
                </div>
                <div className="login-div" key={el+"div2"}>
                    <input  
                        key={el+"txt"} 
                        type={el.indexOf("Password") >= 0 ? "password" : "text"} 
                        name={"text"+ index} value={s["txt"+el]} 
                        onChange={this.handleChange} 
                    />
                </div>
            </div>
        )

        return (
        <>
            <div className="login-splash" onKeyDown = { (e) => this.handleEnterKeyPress(e, submitFunctionLookup[this.state.showMenu])}>
                <div className="login-container" >
                    <img src="logo.png" alt="logo"></img>
                    {/* render titles and text input fields */}
                    {renderInputs}
                    <div className="login-div">
                        <input href='#home' className="loginBtn" type="submit" value="Submit" onClick={submitFunctionLookup[this.state.showMenu]} />
                    </div>
                    {/* render hyperlinks */}
                    <div className="div-inline-login">
                        <div className="login-div-options">
                            <a href="#login" onClick={thisForm.linkFunctions[0]}>
                            <b>{thisForm.linkNames[0]}</b>
                            </a>
                        </div>
                        <div className="login-div-options">
                            <a href="#login" onClick={thisForm.linkFunctions[1]}>
                            <b>{thisForm.linkNames[1]}</b>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className='login-Message'>
                {this.state.message}
            </div>
        </>
        );
    }
}

export default login;