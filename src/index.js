import React from "react";
import ReactDOM from "react-dom";
import "./css/index.css";
import "./css/container.css"; //draggable containers.
import "./css/topNav.css"; //top navigation bar.
import "./css/dropDown.css"; //top navigation bar.
import "./css/bodyContent.css"; //top navigation bar.
import "./css/login.css"; //top navigation bar.
import App from "./App";

import { Provider } from 'react-redux'
import store from './store'

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
