//list of stock data used for auto complete on stock search.
import { useAppDispatch, useAppSelector } from "src/hooks";
import { useState, useEffect } from "react";
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";
import { reqObj } from "src/slices/sliceExchangeData";
import { tGetSymbolList } from "../slices/sliceExchangeData";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";

import { createTheme, ThemeProvider } from "@mui/material/styles";
const oneOffTheme = createTheme({
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    color: "black",
                    input: {
                        paddingTop: "14.5px",
                        paddingBottom: "14.5px",
                    },
                    label: {
                        top: "-9px",
                    },
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    height: "35px",
                },
                input: {
                    position: "relative",
                    top: "-8px",
                },
            },
        },
    },
    palette: {
        primary: {
            main: "#ffffff",
            light: "#ffffff",
            dark: "#ffffff",
        },
    },
});

interface props {
    searchText: string;
    finnHubQueue: finnHubQueue;
    handleChange: Function;
    handleChangeTag: Function;
    style: any;
    widgetType?: string;
}

const useDispatch = useAppDispatch;
const useSelector = useAppSelector;

export default function SecuritySearch(p: props) {
    const dispatch = useDispatch(); //allows widget to run redux actions.
    const [loading, setLoading] = useState<any>(undefined);
    const apiKey = useSelector((state) => state.apiKey);
    const defaultExchange = useSelector((state) => state.defaultExchange);
    const stockDataExchange = useSelector((state) => state.exchangeData.e.ex);
    const stockList = useSelector((state) => state.exchangeData.e?.data);
    const [dataList, setDataList] = useState<any[]>([]);

    useEffect(() => {
        if (stockList === undefined) {
            setLoading(true);
        } else {
            setLoading(false);
        }
    }, [stockList]);

    useEffect(() => {
        //update exchange data if not updating, on user input.
        if (apiKey !== "" && p.searchText.length >= 1 && defaultExchange !== stockDataExchange && stockDataExchange !== "updating") {
            const tGetSymbolObj: reqObj = {
                exchange: defaultExchange,
                apiKey: apiKey,
                finnHubQueue: p.finnHubQueue,
                dispatch: dispatch,
            };
            dispatch(tGetSymbolList(tGetSymbolObj));
        }
    }, [apiKey, defaultExchange, p.searchText, stockDataExchange]);

    useEffect(() => {
        const thisExchange = stockList;
        const newFilteredList: string[] = [];
        if (thisExchange !== undefined) {
            const availableStockCount = Object.keys(thisExchange).length;
            const exchangeKeys = Object.keys(thisExchange); //list
            for (let resultCount = 0, filteredCount = 0; resultCount < 20 && filteredCount < availableStockCount; filteredCount++) {
                const thisKey = exchangeKeys[filteredCount];
                const thisSearchPhrase = `${thisExchange[thisKey].key}: ${thisExchange[thisKey].description}`;
                if (thisSearchPhrase.includes(p.searchText) === true) {
                    resultCount = resultCount;
                    newFilteredList.push(thisSearchPhrase);
                }
            }
        }

        const stockListKey = newFilteredList.map((el) => ({ title: el }));
        setDataList(stockListKey);
    }, [stockList]);

    return (
        <Autocomplete
            data-testid={`searchPaneValue-${p.widgetType}`}
            id="autocomplete"
            options={dataList}
            renderOption={(props, option) => (
                <Box component="li" {...props}>
                    <div data-testid={`tag-${option.title}`}>{option.title}</div>
                </Box>
            )}
            getOptionLabel={(option) => option.title}
            onChange={(e, v) => {
                p.handleChangeTag(e, v);
            }}
            loading={loading}
            loadingText="...getting list of securities"
            renderInput={(params) => {
                return (
                    <ThemeProvider theme={oneOffTheme}>
                        <TextField
                            data-testid={`searchPaneTextField-${p.widgetType}`}
                            {...params}
                            className={p.style}
                            label="Add Security"
                            variant="outlined"
                            onChange={(e) => {
                                p.handleChange(e);
                            }}
                        />
                    </ThemeProvider>
                );
            }}
        />
    );
}
