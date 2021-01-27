import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip';
export default class ToolTip extends Component {
    
    render() {
        const toolTipText = this.props.textFragment
        const buttonStyle = {
            'backgroundColor': 'transparent',
            'border': 'none',
        }
        return (
            <>
                {toolTipText !== undefined ? ( <>
                    <button style={buttonStyle} data-tip data-for={this.props.hintName}> 
                        <i className="fa fa-question-circle-o" aria-hidden="true" />
                    </button>
                    <ReactTooltip place='bottom' type='dark' id={this.props.hintName} >
                        <span>{toolTipText}</span>
                    </ReactTooltip>
                    </>) 
                :
                    (<></>)}
            </>
        )
    }
}
