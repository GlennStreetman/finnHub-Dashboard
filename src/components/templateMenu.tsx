
import { useState, useEffect, useRef } from "react";
import { useAppSelector } from 'src/hooks';

const useSelector = useAppSelector

interface checkObject {
    [key: string]: boolean
}

export default function TemplateMenu(p: 'pass', ref: any) {

    const apiKey = useSelector((state) => { return state.apiKey })
    const apiAlias = useSelector((state) => { return state.apiAlias })

    const [templateFlag, setTemplateFlag] = useState(true) //if true, retrieve template list.
    const [templateList, setTemplateList] = useState([]) //list of templates that have previously been uploaded
    const [serverMessage] = useState('') //if true, retrieve template list. 
    const [checkMulti, setCheckMulti] = useState<checkObject>({})
    const inputReference = useRef<HTMLInputElement>(null);
    //get template list if flag is true
    useEffect((flag: boolean = templateFlag) => {
        if (flag === true) {
            setTemplateFlag(false)
            fetch('/uploadTemplate')
                .then((res) => res.json())
                .then((data) => {
                    if (data.data) {
                        const d = JSON.parse(data.data)
                        const update = {}
                        for (const x in d) { update[d[x]] = false }
                        setCheckMulti(update)
                        setTemplateList(d)
                    }
                })
        }
    }, [templateFlag])

    function check(el) {
        const key = el
        const newCheck = { ...checkMulti }
        newCheck[key] = !newCheck[el]
        setCheckMulti(newCheck)
    }

    function isChecked(el) {
        if (checkMulti[el] !== undefined) {
            return checkMulti[el]
        } else {
            return false
        }
    }

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

    function runTemplate(e, apiKey, templateName, checked) {
        fetch(`/runTemplate?key=${apiKey}&template=${templateName}&multi=${isChecked(checked)}`)
            .then(response => response.blob())
            .then(blob => {
                var file = window.URL.createObjectURL(blob);
                window.location.assign(file);
            })
        e.preventDefault()
    }

    function templateTable(tempList: string[][]) {
        const keySwitch = apiAlias ? apiAlias : apiKey
        return tempList.map((el) => (
            <tr key={el[0] + 'tr'}>
                <td key={el[0] + 'td1'}>{el[0]}</td>
                <td key={el[0] + 'td2'}><a href='#template' onClick={(e) => { runTemplate(e, keySwitch, el[1], el[0]) }}>{`/runTemplate?key=${keySwitch}&template=${el[1]}&multi=${isChecked(el[0])}`}</a></td>
                <td key={el[0] + 'td3'}>
                    <input key={el[0] + 'mark'}
                        type="checkbox"
                        onChange={() => check(el[0])}
                        checked={isChecked(el[0])}
                    />
                </td>
                <td key={el[0] + 'td4'}><button onClick={() => deleteFile(el[0])}><i className="fa fa-times" aria-hidden="true"></i></button></td>
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
                        <td style={tHeadStyle}>Multi</td>
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

// export function templateMenuProps(that: AppState) {
//     let propList = {
//     };
//     return propList;
// }