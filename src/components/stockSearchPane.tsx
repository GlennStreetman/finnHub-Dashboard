// import ToolTip from './toolTip.js'
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";
import { rSetGlobalStockList } from "src/slices/sliceDashboardData";
import { useAppDispatch, useAppSelector } from "src/hooks";
import { rSetDefaultExchange } from "src/slices/sliceDefaultExchange";
import { tSaveDashboard } from "src/thunks/thunkSaveDashboard";
import SecuritySearch from "src/components/searchSecurity";
import { Button, Select, FormControl } from "@mui/material/";
import { createStyles, makeStyles } from "@mui/styles";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useWindowDimensions from "src/appFunctions/hooks/windowDimensions";
import { tAddStock } from "src/thunks/thunkAddWidgetSecurity";
import { rSetUpdateStatus } from "src/slices/sliceDataModel"; //sliceDataModel, rRebuildTargetDashboardModel
import { tGetFinnhubData } from "src/thunks/thunkFetchFinnhub";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";

const useDispatch = useAppDispatch;
const useSelector = useAppSelector;
//compnoent used when searching for a stock via "Add stock to watchlist" on top bar or any widget searches.

interface props {
    changeSearchText: Function;
    finnHubQueue: finnHubQueue;
    searchText: string;
    widgetKey: string;
    widgetType: string;
}

function StockSearchPane(p: props) {
    const [securitySelection, setSecuritySelection] = useState("");

    const defaultExchange = useSelector((state) => {
        return state.defaultExchange;
    });
    const exchangeList = useSelector((state) => {
        return state.exchangeList.exchangeList;
    });
    const currentDashboard = useSelector((state) => {
        return state.currentDashboard;
    });
    const dashboardData = useSelector((state) => {
        return state.dashboardData;
    });
    const rUpdateStock = useSelector((state) => {
        const thisExchange = state.exchangeData.e?.data;
        const inputSymbol = securitySelection.slice(0, securitySelection.indexOf(":"));
        const updateStock: any = thisExchange !== undefined ? thisExchange[inputSymbol] : {};
        // console.log("getting rUpdateStock", inputSymbol, updateStock);
        return updateStock;
    });

    const width = useWindowDimensions().width; //also returns height
    const columnLookup = [
        [0, 400, 1],
        [400, 800, 1], //12
        [800, 1200, 2], //6
        [1200, 1600, 3], //4
        [1600, 2400, 4], //3
        [2400, 99999999, 6], //2
    ];

    const columnSetup = (function (): number[] {
        let ret: number[] = columnLookup.reduce((acc, el) => {
            if (width > el[0] && width <= el[1]) {
                const newVal = el;
                acc = newVal;
                return acc;
            } else {
                return acc;
            }
        });
        return ret;
    })();

    const columns = columnSetup[2];

    const widgetFraction = (width / columns - 20) / 12;

    const useStyles = makeStyles((theme) =>
        createStyles({
            formControl: {
                margin: 0.5,
                flexDirection: "row",
            },
            securitySearch: {
                width: exchangeList.length > 1 ? Math.round(widgetFraction * 7) : Math.round(widgetFraction * 9.5), //7 or 9.5
                marginRight: "10px",
                backgroundColor: "white",
                borderRadius: 10,
                outlineRadius: 10,
                height: "35px",
            },
            exchange: {
                width: Math.round(widgetFraction * 2),
                marginRight: "10px",
                backgroundColor: "white",
                borderRadius: 10,
                height: "35px",
            },
            submit: {
                width: Math.round(widgetFraction * 2),
                backgroundColor: "white",
                borderRadius: 10,
                height: "35px",
                color: "black",
                "&:hover": {
                    backgroundColor: "#0069d9",
                },
            },
        })
    );

    const oneOffTheme = createTheme({
        components: {
            MuiSelect: {
                styleOverrides: {
                    iconOutlined: {
                        right: "0px",
                    },
                },
            },
        },
    });

    const classes = useStyles();

    const dispatch = useDispatch(); //allows widget to run redux actions.

    function handleChange(e) {
        e.preventDefault();
        if (e.target.value && e.target.value !== null) {
            // console.log("updating ", e.target.value);
            p.changeSearchText(e.target.value.toUpperCase());
        }
    }

    function handleChangeTag(v) {
        // console.log("v", v);
        if (v && v !== null) {
            setSecuritySelection(v);
        }
        // else {
        //     p.changeSearchText("");
        // }
    }

    function changeDefault(event) {
        event.preventDefault();
        const newValue = event.target.value;
        dispatch(rSetDefaultExchange(newValue));
    }

    let widgetKey = p.widgetKey;
    const exchangeOptions = exchangeList.map((el) => (
        <MenuItem key={el + "ex"} value={el}>
            {el}
        </MenuItem>
    ));
    // const helpText = <>
    //     Select exchange to be used in "Add Security" search. <br />
    //     Click manage account to update exchange list.<br />
    // </>

    const submit = async function (e) {
        //submit stock to be added/removed from global & widget stocklist.
        e.preventDefault();
        if (rUpdateStock !== undefined && widgetKey === "watchListMenu") {
            const thisStock = rUpdateStock;
            const stockKey = thisStock.key;
            dispatch(
                rSetGlobalStockList({
                    stockRef: stockKey,
                    currentDashboard: currentDashboard,
                    stockObj: thisStock,
                })
            );
            dispatch(tSaveDashboard({ dashboardName: currentDashboard }));
        } else if (Number.isNaN(widgetKey) === false && rUpdateStock !== undefined) {
            //Not menu widget. Menus named, widgets numbered.
            const thisStock = rUpdateStock;
            const stockKey = thisStock.key;

            await dispatch(
                tAddStock({
                    widgetId: widgetKey,
                    symbol: stockKey,
                    currentDashboard: currentDashboard,
                    stockObj: thisStock,
                })
            ); //consider updating data model on remove?
            dispatch(
                tGetFinnhubData({
                    dashboardID: dashboardData[currentDashboard].id,
                    targetDashBoard: currentDashboard,
                    widgetList: [widgetKey],
                    finnHubQueue: p.finnHubQueue,
                    rSetUpdateStatus: rSetUpdateStatus,
                    dispatch: dispatch,
                })
            );
            dispatch(tSaveDashboard({ dashboardName: currentDashboard }));
        } else {
            // console.log(`invalid stock selection:`, rUpdateStock, p.searchText, typeof widgetKey);
        }
    };
    // console.log("running stock search");
    return (
        <div data-testid={`stockSearchPane-${p.widgetType}`} style={{ backgroundColor: "#1d69ab", display: "flex", justifyContent: "center", padding: "5px" }}>
            <FormControl className={classes.formControl}>
                {
                    exchangeList.length > 1 && (
                        // <Tooltip title={helpText} >
                        <ThemeProvider theme={oneOffTheme}>
                            <Select
                                variant="outlined"
                                label="select-security-exchange"
                                className={classes.exchange}
                                value={defaultExchange}
                                onChange={changeDefault}
                            >
                                {exchangeOptions}
                            </Select>
                        </ThemeProvider>
                    )

                    // </Tooltip>
                }

                <SecuritySearch
                    searchText={p.searchText}
                    finnHubQueue={p.finnHubQueue}
                    handleChange={handleChange}
                    handleChangeTag={handleChangeTag}
                    style={classes.securitySearch}
                    widgetType={p.widgetType}
                />
                <Button className={classes.submit} variant="contained" data-testid={`SubmitSecurity-${p.widgetType}`} onClick={submit}>
                    Submit
                </Button>
            </FormControl>
        </div>
    );
}

export default StockSearchPane;

export function searchPaneProps(p) {
    const propList = {
        changeSearchText: p.changeSearchText,
        finnHubQueue: p.finnHubQueue,
        searchText: p.searchText,
        widgetKey: p.widgetKey,
        widgetType: p.widgetType,
    };
    return propList;
}
