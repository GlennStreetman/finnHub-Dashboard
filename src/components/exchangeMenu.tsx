import { useState } from 'react';
import { rUpdateExchangeList } from '../slices/sliceExchangeList'
import { useAppDispatch, useAppSelector } from 'src/hooks';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { useNavigate } from "react-router-dom";
import { Grid, Box, Typography, Button } from '@material-ui/core/';


const useDispatch = useAppDispatch
const useSelector = useAppSelector

export default function ExchangeMenu(p) {
    const navigate = useNavigate();
    const dispatch = useDispatch()
    const rExchangeList = useSelector(state => state.exchangeList.exchangeList)
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const rows = [
        ["US", 'US exchanges (NYSE Nasdaq)'],
        ["AS", 'NYSE EURONEXT - EURONEXT AMSTERDAM'],
        ["AT", 'ATHENS EXCHANGE S.A. CASH MARKET'],
        ["AX", 'ASX - ALL MARKETS'],
        ["BA", 'BOLSA DE COMERCIO DE BUENOS AIRES'],
        ["BC", 'BOLSA DE VALORES DE COLOMBIA'],
        ["BD", 'BUDAPEST STOCK EXCHANGE'],
        ["BE", 'BOERSE BERLIN'],
        ["BK", 'STOCK EXCHANGE OF THAILAND'],
        ["BO", 'BSE LTD'],
        ["BR", 'NYSE EURONEXT - EURONEXT BRUSSELS'],
        ["CN", 'CANADIAN NATIONAL STOCK EXCHANGE'],
        ["CO", 'OMX NORDIC EXCHANGE COPENHAGEN A/S'],
        ["CR", 'CARACAS STOCK EXCHANGE'],
        ["DB", 'DUBAI FINANCIAL MARKET'],
        ["DE", 'XETRA'],
        ["DU", 'BOERSE DUESSELDORF'],
        ["F", 'DEUTSCHE BOERSE AG'],
        ["HE", 'NASDAQ OMX HELSINKI LTD.'],
        ["HK", 'HONG KONG EXCHANGES AND CLEARING LTD'],
        ["HM", 'HANSEATISCHE WERTPAPIERBOERSE HAMBURG'],
        ["IC", 'NASDAQ OMX ICELAND'],
        ["IR", 'IRISH STOCK EXCHANGE - ALL MARKET'],
        ["IS", 'BORSA ISTANBUL'],
        ["JK", 'INDONESIA STOCK EXCHANGE'],
        ["JO", 'JOHANNESBURG STOCK EXCHANGE'],
        ["KL", 'BURSA MALAYSIA'],
        ["KQ", 'KOREA EXCHANGE (KOSDAQ)'],
        ["KS", 'KOREA EXCHANGE (STOCK MARKET)'],
        ["L", 'LONDON STOCK EXCHANGE'],
        ["LS", 'NYSE EURONEXT - EURONEXT LISBON'],
        ["MC", 'BOLSA DE MADRID'],
        ["ME", 'MOSCOW EXCHANGE'],
        ["MI", 'Italian Stock Exchange'],
        ["MU", 'BOERSE MUENCHEN'],
        ["MX", 'BOLSA MEXICANA DE VALORES (MEXICAN STOCK EXCHANGE)'],
        ["NE", 'AEQUITAS NEO EXCHANGE'],
        ["NS", 'NATIONAL STOCK EXCHANGE OF INDIA'],
        ["NZ", 'NEW ZEALAND EXCHANGE LTD'],
        ["OL", 'OSLO BORS ASA'],
        ["PA", 'NYSE EURONEXT - MARCHE LIBRE PARIS'],
        ["PR", 'PRAGUE STOCK EXCHANGE'],
        ["QA", 'QATAR EXCHANGE'],
        ["RG", 'NASDAQ OMX RIGA'],
        ["SA", 'Brazil Bolsa - Sao Paolo'],
        ["SG", 'BOERSE STUTTGART'],
        ["SI", 'SINGAPORE EXCHANGE'],
        ["SN", 'SANTIAGO STOCK EXCHANGE'],
        ["SR", 'SAUDI STOCK EXCHANGE'],
        ["SS", 'SHANGHAI STOCK EXCHANGE'],
        ["ST", 'NASDAQ OMX NORDIC'],
        ["SW", 'SWISS EXCHANGE'],
        ["SZ", 'SHENZHEN STOCK EXCHANGE'],
        ["T", 'TOKYO STOCK EXCHANGE-TOKYO PRO MARKET'],
        ["TA", 'TEL AVIV STOCK EXCHANGE'],
        ["TL", 'NASDAQ OMX TALLINN'],
        ["TO", 'TORONTO STOCK EXCHANGE'],
        ["TW", 'TAIWAN STOCK EXCHANGE'],
        ["V", 'TSX VENTURE EXCHANGE - NEX'],
        ["VI", 'Vienna Stock Exchange'],
        ["VN", 'Vietnam exchanges including HOSE HNX and UPCOM'],
        ["VS", 'NASDAQ OMX VILNIUS'],
        ["WA", 'WARSAW STOCK EXCHANGE/EQUITIES/MAIN MARKET'],
    ]

    function changeExchange(ex) {
        const newExchangeList = [...rExchangeList]
        if (rExchangeList.indexOf(ex) >= 0) {
            newExchangeList.splice(rExchangeList.indexOf(ex), 1)
        } else {
            newExchangeList.push(ex)
        }

        const payload = {
            'exchangeList': newExchangeList,
        }

        dispatch(rUpdateExchangeList(payload))

        const data = {
            field: "exchangelist",
            newValue: newExchangeList.toString().replace("'", ""),
        };

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        };

        fetch("/accountData", options)
            .then((response) => response.json())
            .then((data) => {
                dispatch(rUpdateExchangeList({ exchangeList: newExchangeList }))
            });

    }

    function exchangeListRows() {
        return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((el) =>
            <TableRow key={el[0] + 'row'}>
                <TableCell key={el[0] + 'symbol'}>{el[0]}</TableCell>
                <TableCell key={el[0] + 'desc'}>{el[1]}</TableCell>
                <TableCell key={el[0] + 'box'}>
                    <input key={el[0] + 'mark'}
                        type="checkbox"
                        onChange={() => changeExchange(el[0])}
                        checked={rExchangeList.indexOf(el[0]) >= 0} />
                </TableCell>
            </TableRow>
        )
    }

    return (<>
        <Grid container justifyContent="center">
            <Grid item sm={2} md={3} lg={4} xl={4} />
            <Grid item xs={12} sm={8} md={6} lg={4} xl={4} >
                <TableContainer>
                    <Table size="small" stickyHeader aria-label="Exchange Menu">
                        <TableHead>
                            <TableRow>
                                <TableCell>Short</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Activate</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {exchangeListRows()}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[10, 25, 100]}
                        component="div"
                        count={rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
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

export function exchangeMenuProps(that) {
    let propList = {
        finnHubQueue: that.finnHubQueue,
    };
    return propList;
}

