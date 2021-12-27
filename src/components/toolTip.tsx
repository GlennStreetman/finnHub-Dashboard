// import React from 'react'
import ReactTooltip from 'react-tooltip';
function ToolTip(p: any) {

    const toolTipText = p.textFragment
    const buttonStyle = {
        'backgroundColor': 'transparent',
        'border': 'none',
    }
    return (
        <>
            {toolTipText !== undefined ? (<>
                <button style={buttonStyle} data-tip data-for={p.hintName}>
                    <i className="fa fa-question-circle-o" aria-hidden="true" />
                </button>
                <ReactTooltip place='bottom' type='dark' id={p.hintName} >
                    <span>{toolTipText}</span>
                </ReactTooltip>
            </>)
                :
                (<></>)}
        </>
    )
}

export default ToolTip