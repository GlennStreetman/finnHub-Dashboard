
//list of stock data used for auto complete on stock search.
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { useState, useEffect } from "react";
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";
import { reqObj } from 'src/slices/sliceExchangeData'
import { tGetSymbolList } from "../slices/sliceExchangeData";
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { createTheme, ThemeProvider } from '@material-ui/core/styles'
const oneOffTheme = createTheme({
    overrides: {
        MuiTextField: {
            root: {
                color: 'black',
                input: {
                    paddingTop: '14.5px',
                    paddingBottom: '14.5px',
                },
                label: {
                    top: '-9px'
                }
            },
        },
        MuiInputBase: {
            root: {
                height: '35px',

            },
            input: {
                position: 'relative',
                top: '-8px',
            },
        },
        MuiFormLabel: {
            root: {
                padding: '0px',
                lineHeight: 0,
                color: 'black',
                '&$focused': {
                    color: 'black'
                },
            },
        },
        MuiFormHelperText: {
            root: {
                color: 'black'
            }
        }
    }
});

interface props {
    searchText: string,
    finnHubQueue: finnHubQueue,
    handleChange: Function,
    handleChangeTag: Function,
    style: any,
}

const useDispatch = useAppDispatch
const useSelector = useAppSelector

export default function SecuritySearch(p: props) {

    const dispatch = useDispatch(); //allows widget to run redux actions.
    const [loading, setLoading] = useState<any>(undefined)
    const apiKey = useSelector((state) => state.apiKey)
    const defaultExchange = useSelector((state) => state.defaultExchange)
    const stockDataExchange = useSelector(state => state.exchangeData.e.ex)
    const rFilteredStocks = useSelector((state) => {
        const thisExchange = state.exchangeData.e?.data
        const newFilteredList: string[] = []
        if (thisExchange !== undefined) {
            const availableStockCount = Object.keys(thisExchange).length;
            const exchangeKeys = Object.keys(thisExchange) //list
            for (let resultCount = 0, filteredCount = 0;
                resultCount < 20 && filteredCount < availableStockCount;
                filteredCount++) {
                const thisKey = exchangeKeys[filteredCount]
                const thisSearchPhrase = `${thisExchange[thisKey].key}: ${thisExchange[thisKey].description}`
                if (thisSearchPhrase.includes(p.searchText) === true) {
                    resultCount = resultCount + 1;
                    newFilteredList.push(thisSearchPhrase);
                }
            }
            return newFilteredList
        } else {
            return undefined
        }
    })

    useEffect(() => {
        if (rFilteredStocks === undefined) {
            setLoading(true)
        } else {
            setLoading(false)
        }
    }, [rFilteredStocks])

    useEffect(() => { //update exchange data if not updating, on user input.
        if (
            apiKey !== '' &&
            p.searchText.length >= 1 &&
            defaultExchange !== stockDataExchange &&
            stockDataExchange !== 'updating'
        ) {
            const tGetSymbolObj: reqObj = {
                exchange: defaultExchange,
                apiKey: apiKey,
                finnHubQueue: p.finnHubQueue,
                dispatch: dispatch,
            }
            dispatch(tGetSymbolList(tGetSymbolObj))
        }
    }, [apiKey, defaultExchange, p.searchText, stockDataExchange])

    function createDataList() {
        //creates datalist used for autocomplete of stock names.
        if (rFilteredStocks !== undefined) {
            const stockListKey = rFilteredStocks.map((el) => (
                { title: el }
            ));
            return stockListKey;
        } else {
            return ([])
        }

    }

    return (
        <Autocomplete
            id='autocomplete'
            options={createDataList()}
            getOptionLabel={(option) => option.title}
            onChange={(e, v) => p.handleChangeTag(e, v)}
            loading={loading}
            loadingText='...getting list of securities'
            // groupLabel={{width: '25px'}}
            renderInput={(params) => {
                return (
                    <ThemeProvider theme={oneOffTheme}>
                        <TextField {...params} className={p.style} label="Add Security" variant="outlined" onChange={(e) => { p.handleChange(e) }} />
                    </ThemeProvider>
                )
            }}
        />

    )

}