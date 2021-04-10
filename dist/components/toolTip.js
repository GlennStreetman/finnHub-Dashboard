import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip';
export default class ToolTip extends Component {
    render() {
        const toolTipText = this.props.textFragment;
        const buttonStyle = {
            'backgroundColor': 'transparent',
            'border': 'none',
        };
        return (React.createElement(React.Fragment, null, toolTipText !== undefined ? (React.createElement(React.Fragment, null,
            React.createElement("button", { style: buttonStyle, "data-tip": true, "data-for": this.props.hintName },
                React.createElement("i", { className: "fa fa-question-circle-o", "aria-hidden": "true" })),
            React.createElement(ReactTooltip, { place: 'bottom', type: 'dark', id: this.props.hintName },
                React.createElement("span", null, toolTipText))))
            :
                (React.createElement(React.Fragment, null))));
    }
}
//# sourceMappingURL=toolTip.js.map