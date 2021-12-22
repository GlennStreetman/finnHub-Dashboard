
import { useState, useEffect, useRef } from "react";
import { useAppSelector } from 'src/hooks';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Button } from '@mui/material/';
import { Grid, Paper, Box, Typography } from '@mui/material/';
import { styled } from '@mui/material/styles';

const MyPaper = styled(Paper)({ color: "#1d69ab", variant: "outlined", borderRadius: 20, padding: 25 });

const useSelector = useAppSelector

interface checkObject {
    [key: string]: boolean
}

const tHeadStyle = {
    paddingLeft: '10px',
    paddingRight: '10px',
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
            <TableRow key={el[0] + 'tr'}>
                <TableCell key={el[0] + 'td1'}>{el[0].replace('.xlsx', '')}</TableCell>
                <TableCell key={el[0] + 'td2'}><a href='#template' onClick={(e) => { runTemplate(e, keySwitch, el[1], el[0]) }}>{`/runTemplate?key=${keySwitch}&template=${el[1]}&multi=${isChecked(el[0])}`}</a></TableCell>
                <TableCell key={el[0] + 'td3'}>
                    <input key={el[0] + 'mark'}
                        type="checkbox"
                        onChange={() => check(el[0])}
                        checked={isChecked(el[0])}
                    />
                </TableCell>
                <TableCell key={el[0] + 'td4'}><button onClick={() => deleteFile(el[0])}><i className="fa fa-times" aria-hidden="true"></i></button></TableCell>
            </TableRow>
        ))
    }

    return (<>
        <Grid container justifyContent="center">
            <Grid item sm={2} md={3} lg={4} xl={4} />
            <Grid item xs={12} sm={8} md={6} lg={4} xl={4} >
                <Box pt={2}>
                    <MyPaper elevation={6}>
                        <Box alignItems='center' display='flex' justifyContent='center'><Typography variant="h6">Manage Excel Templates:</Typography></Box>

                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell style={tHeadStyle}>Name</TableCell>
                                        <TableCell style={tHeadStyle}>Link</TableCell>
                                        <TableCell style={tHeadStyle}>Multi</TableCell>
                                        <TableCell style={tHeadStyle}>Delete</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {templateTable(templateList)}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '5px'
                        }}>
                            <input type="file" hidden ref={inputReference} onChange={uploadNewTemplate} />
                            <Box pt={1} alignItems='center' display='flex' justifyContent='center'>
                                <Button color="primary" onClick={fileUploadAction}>
                                    Upload New Template
                                </Button>
                            </Box>
                        </div>
                    </MyPaper>
                </Box>
            </Grid>
            <Grid item sm={2} md={3} lg={4} xl={4} />
        </Grid>
        {serverMessage !== "" && (
            <div>
                <b >{serverMessage}</b>
            </div>
        )}
    </>)
}