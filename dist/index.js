import React from "react";
import ReactDOM from "react-dom";
import "./css/bodyContent.css";
import "./css/container.css";
import "./css/dropDown.css";
import "./css/index.css";
import "./css/login.css";
import "./css/topNav.css";
import "./css/widgetBody.css";
import "./css/loader.css";
import App from "./App";
import { Provider } from 'react-redux';
import { store } from './store';
ReactDOM.render(React.createElement(React.StrictMode, null,
    React.createElement(Provider, { store: store },
        React.createElement(App, null))), document.getElementById("root"));
