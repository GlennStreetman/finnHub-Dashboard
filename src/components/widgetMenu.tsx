
/* eslint-disable no-sparse-arrays */
import { useState } from 'react';
import { estimateOptions, fundamentalsOptions, priceOptions } from '../registers/topNavReg'
import { widgetSetup } from 'src/App'
import { updateWidgetSetup } from 'src/appFunctions/appImport/updateWidgetSetup'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { Button } from '@mui/material/';
import { useNavigate } from "react-router-dom";
import { Tooltip } from '@mui/material/';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Grid, Box } from '@mui/material/';


interface props {
    widgetSetup: widgetSetup,
    updateAppState: Object,
}

export default function WidgetMenu(p: props) {
    const navigate = useNavigate();

    const [openEstimates, setOpenEstimates] = useState(true);
    const [openFundamentals, setOpenFundamentals] = useState(true);
    const [openPrice, setOpenPrice] = useState(true);

    function check(el) {
        const key = el[0]
        const updateObj = {
            [key]: !isChecked(el)
        }
        const newDash = updateWidgetSetup(updateObj, p.widgetSetup)
        p.updateAppState['widgetSetup'](newDash)

    }

    function isChecked(el) {
        if (p.widgetSetup[el[0]] !== undefined) {
            return p.widgetSetup[el[0]]
        } else if (p.widgetSetup[el[0]] === undefined && el[5] === 'Free') {
            return true
        } else {
            return false
        }
    }

    function widgetMenuRows(widgets) {
        const widgetMap = widgets.map((el) => (
            <TableRow key={el + 'tr'}>

                <TableCell key={el + 'td1'}>{el[1]}</TableCell>
                <TableCell key={el + 'td2'}>{el[5]}</TableCell>
                <TableCell key={el + 'td3'}>
                    <input key={el + 'mark'}
                        type="checkbox"
                        onChange={() => check(el)}
                        checked={isChecked(el)}
                    />
                </TableCell>
            </TableRow>
        ))
        return widgetMap
    }

    return (<>
        <Grid container justifyContent="center">
            <Grid item sm={2} md={3} lg={4} xl={4} />
            <Grid item xs={12} sm={8} md={6} lg={4} xl={4} >
                <TableContainer>
                    <Table size="small" stickyHeader aria-label="Widget activation Menu" >
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    Name
                                </TableCell>
                                <Tooltip title="Premium widgets are only available for the paid API tiers at finnhub.io" placement="bottom">
                                    <TableCell>
                                        Tier
                                    </TableCell>
                                </Tooltip>
                                <TableCell>
                                    Activate
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <IconButton aria-label="expand row" size="small" onClick={() => setOpenEstimates(!openEstimates)}>
                                        <b>Estimates</b>{openEstimates ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                    </IconButton>
                                </TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                            {openEstimates ? widgetMenuRows(estimateOptions) : <></>}
                            <TableRow>
                                <TableCell>
                                    <IconButton aria-label="expand row" size="small" onClick={() => setOpenFundamentals(!openFundamentals)}>
                                        <b>Fundamentals</b>{openFundamentals ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                    </IconButton>
                                </TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                            {openFundamentals ? widgetMenuRows(fundamentalsOptions) : <></>}
                            <TableRow>
                                <TableCell>
                                    <TableCell>
                                        <IconButton aria-label="expand row" size="small" onClick={() => setOpenPrice(!openPrice)}>
                                            <b>Price</b>{openPrice ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                        </IconButton>
                                    </TableCell>
                                </TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                            {openPrice ? widgetMenuRows(priceOptions) : <></>}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
            <Grid item sm={2} md={3} lg={4} xl={4} />
        </Grid>

        <Box pt={1} alignItems='center' display='flex' justifyContent='center'>
            <Button color="primary" onClick={() => navigate('/manageAccount')}>Back</Button>
        </Box>
    </>
    )
}

export function widgetMenuProps(that) {
    let propList = {
        widgetSetup: that.widgetSetup,
        updateAppState: that.updateAppState,
    };
    return propList;
}

