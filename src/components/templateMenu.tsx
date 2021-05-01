import * as React from "react"
import { useState, useEffect, useRef } from "react";


export default function TemplateMenu(p: { [key: string]: any }, ref: any) {

    const [templateFlag, setTemplateFlag] = useState(true) //if true, retrieve template list.
    const [templateList, setTemplateList] = useState([['test1', 'testlink1'], ['test2', 'testlink2'], ['test3', 'testlink3looooooooooooooooooooooooooooooooong']]) //list of templates that have previously been uploaded
    const [serverMessage, setServerMessage] = useState('') //if true, retrieve template list. 
    const inputReference = useRef<HTMLInputElement>(null);
    //get template list if flag is true
    useEffect((flag: boolean = templateFlag) => {
        if (flag === true) {
            console.log("updating template list")
            setTemplateFlag(false)
            fetch('/uploadTemplate')
                .then((res) => res.json())
                .then((data) => {
                    // console.log(JSON.parse(data.data))
                    setTemplateList(JSON.parse(data.data))
                })
            //setTemplateList('[newlist])
        }
    }, [templateFlag])

    function fileUploadAction() {
        if (inputReference.current !== null) inputReference.current.click();
    }

    function uploadNewTemplate(e) {
        const data = new FormData()
        data.append('file', e.target.files[0])
        fetch('/uploadTemplate', {
            method: 'POST',
            body: data,
        })
            .then(() => {
                setTemplateFlag(true)
            })
    }

    function deleteFile(e) {
        fetch(`/deleteTemplate?template=${e}`)
            .then(() => {
                console.log('delete complete')
                setTemplateFlag(true)
            })
    }

    function runTemplate(e, apiKey, templateName) {
        fetch(`/runTemplate?key=${apiKey}&template=${templateName}`)
        e.preventDefault()
    }

    function templateTable(tempList: string[][]) {
        const apiKey = p.apiAlias ? p.apiAlias : p.apiKey
        return tempList.map((el) => (
            <tr key={el[0] + 'tr'}>
                <td key={el[0] + 'td1'}>{el[0]}</td>
                <td key={el[0] + 'td2'}><a href='#' onClick={(e) => { runTemplate(e, apiKey, el[1]) }}>{`/runTemplate?key=${apiKey}&template=${el[1]}`}</a></td>
                <td key={el[0] + 'td3'}><button onClick={() => deleteFile(el[0])}><i className="fa fa-times" aria-hidden="true"></i></button></td>
            </tr>
        ))
    }

    const divOutline = {
        border: '5px solid',
        borderRadius: '10px',
        backgroundColor: 'white',
        padding: '5px',
        borderColor: '#1d69ab',
    }

    const tHeadStyle = {
        paddingLeft: '10px',
        paddingRight: '10px',
    }

    return (<>
        <div style={divOutline}>
            <b>Excel Templates:</b>
            <table>
                <thead>
                    <tr>
                        <td style={tHeadStyle}>Name</td>
                        <td style={tHeadStyle}>Link</td>
                        <td style={tHeadStyle}>Delete</td>
                    </tr>
                </thead>
                <tbody>
                    {templateTable(templateList)}
                </tbody>
            </table>
            <div>
                <input type="file" hidden ref={inputReference} onChange={uploadNewTemplate} />
                <button className="ui button" onClick={fileUploadAction}>
                    Upload New Template
                </button>
            </div>
        </div>
        {serverMessage !== "" && (
            <div>
                <b >{serverMessage}</b>
            </div>
        )}
    </>)
}

export function templateMenuProps(that, key = "templateMenu") {
    let propList = {
        apiKey: that.state.apiKey,
        apiAlias: that.state.apiAlias
    };
    return propList;
}