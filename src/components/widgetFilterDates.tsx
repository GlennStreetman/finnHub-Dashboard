import { dashBoardData } from 'src/App'
import { UpdateWidgetFilters } from 'src/appFunctions/appImport/widgetLogic'
import { useAppDispatch } from 'src/hooks';
import { finnHubQueue } from "src/appFunctions/appImport/throttleQueueAPI";

import 'date-fns';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import { createTheme, ThemeProvider } from '@material-ui/core/styles'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import useWindowDimensions from 'src/appFunctions/hooks/windowDimensions'


interface props {
    start: string,
    end: string,
    setStart: Function,
    setEnd: Function,
    widgetKey: string | number,
    widgetType: string,
    dashboardData: dashBoardData,
    currentDashboard: string,
    apiKey: string,
    finnHubQueue: finnHubQueue,
}

const filterTheme = createTheme({
    overrides: {
        MuiTextField: {
            root: {
                color: 'black',
                width: '150px',
                marginRight: '5px',
                marginLeft: '5px',

            },
        },
        MuiInputBase: {
            root: {
                color: 'black',
                backgroundColor: "white",
                borderRadius: 10,
                outlineRadius: 10,
            },
        },
        MuiFormLabel: {
            root: {
                color: 'white',
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



const useDispatch = useAppDispatch

export default function WidgetFilterDates(p: props) {

    const dispatch = useDispatch();

    const width = useWindowDimensions().width //also returns height
    const columnLookup = [
        [0, 400, 1],
        [400, 800, 1], //12
        [800, 1200, 2], //6
        [1200, 1600, 3], //4
        [1600, 2400, 4], //3
        [2400, 99999999, 6] //2
    ]

    const columnSetup = function (): number[] {
        let ret: number[] = columnLookup.reduce((acc, el) => {
            if (width > el[0] && width <= el[1]) {
                const newVal = el
                acc = newVal
                return (acc)
            } else { return (acc) }
        })
        return (ret)
    }()

    const columns = columnSetup[2]

    const widgetFraction = (width / columns - 20) / 12

    function updateStartDate(date) {
        console.log('update', date)
        p.setStart(date)
    }

    function updateEndDate(date) {
        p.setEnd(date)
    }

    function updateFilter(date, filterName) {
        console.log('updating filters', filterName)
        if (isNaN(new Date(date).getTime()) === false) {
            const now = Date.now()
            const target = new Date(date).getTime();
            const offset = target - now
            UpdateWidgetFilters(p.widgetKey, { [filterName]: offset }, p.dashboardData, p.currentDashboard, dispatch, p.apiKey, p.finnHubQueue)
        }
    }

    const useStyles = makeStyles((theme: Theme) =>
        createStyles({
            getTime: {
                width: Math.round(widgetFraction * 5.5),
            },
        }))

    const classes = useStyles();

    const thisStyle = {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#1d69ab',
    }


    return (
        <div style={thisStyle}>
            <ThemeProvider theme={filterTheme}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    {/* <span> */}
                    <KeyboardDatePicker
                        className={classes.getTime}
                        disableToolbar
                        variant="inline"
                        format="MM/dd/yyyy"
                        margin="normal"
                        id="date-picker-inline-Start"
                        label="Start Date:"
                        value={p.start}
                        onChange={updateStartDate}
                        onBlur={(date) => { updateFilter(date, 'startDate') }}
                        onAccept={(date) => { updateFilter(date, 'startDate') }}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                    <KeyboardDatePicker
                        className={classes.getTime}
                        disableToolbar
                        variant="inline"
                        format="MM/dd/yyyy"
                        margin="normal"
                        id="date-picker-inline-End"
                        label="End Date:"
                        value={p.end}
                        onChange={updateEndDate}
                        onBlur={(date) => { updateFilter(date, 'endDate') }}
                        onAccept={(date) => { updateFilter(date, 'startDate') }}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                    {/* </span> */}
                </MuiPickersUtilsProvider>

            </ThemeProvider>
        </div>
    )
}
