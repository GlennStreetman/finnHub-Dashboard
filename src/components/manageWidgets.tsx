import { useState, } from "react";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { estimateOptions, fundamentalsOptions, priceOptions, widgetDescriptions } from '../registers/topNavReg'
import { useAppSelector } from 'src/hooks';
import FormControl from '@material-ui/core/FormControl';
import Card from '@material-ui/core/Card';
import FormHelperText from '@material-ui/core/FormHelperText';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { tAddNewWidgetContainer } from 'src/thunks/thunkAddNewWidgetContainer'
import { filters } from 'src/App'
import { useAppDispatch } from 'src/hooks';
import { tSaveDashboard } from 'src/thunks/thunkSaveDashboard'

import { makeStyles } from '@material-ui/core/styles';


// import Card from '@material-ui/core/Card';
// import CardActions from '@material-ui/core/CardActions';
// import CardContent from '@material-ui/core/CardContent';
// import Button from '@material-ui/core/Button';

import { BottomNavigation, BottomNavigationAction } from '@material-ui/core/';

// const useDispatch = useAppDispatch
const useSelector = useAppSelector

const flexInline = {
    display: 'flex',
    'flexDirection': 'row',
    'justifyContent': 'center',
    'gap': '10px',
    marginTop: '7px',
}

const background = {
    display: 'flex',
    'flexDirection': 'row',
    'justifyContent': 'center',
    'gap': '10px',
    backgroundColor: 'white',
    position: 'fixed',
    bottom: 0,
    zIndex: 9999,
    width: '100%',
}

const cardColumn = {
    display: 'flex',
    'flexDirection': 'column',
    'justifyContent': 'center',
    'gap': '10px',
    padding: '5px',
    maxWidth: '400px',
}

const cardContainer = {
    display: 'flex',
    'flexGrow': 1,
    'justifyContent': 'center',
    'alignItems': 'center',
    'maxWidth': '400px',
}

const cardStyle = {
    display: 'flex',
    'flexGrow': 1,
    'justifyContent': 'center',
    'alignItems': 'center',
    'maxWidth': '400px',
}

const useStyles = () => {

    return makeStyles({
        root: {
            width: '100%',
            position: 'fixed',
            bottom: 0,
            justifyContent: 'center'
            // background: 'transparent'
        },
        MuiButtonBase: {

            position: 'inherit'
        }
    })
};

function ManageWidgets() {

    const useDispatch = useAppDispatch
    const dispatch = useDispatch(); //allows widget to run redux actions.

    const classes = useStyles()();
    const dashboardData = useSelector((state) => { return state.dashboardData })
    const currentDashboard = useSelector((state) => { return state.currentDashboard })
    const dashboardList = Object.keys(dashboardData)

    const [toggle, setToggle] = useState(0) //true is add widget, false is manage widget
    const [dashboard, setDashboard] = useState(currentDashboard)
    const [widgetHeading, setWidgetHeading] = useState('Stock Estimates')

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setToggle(newValue);
    };

    const handDashboardChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setDashboard(event.target.value as string);
    };

    const handleHeadingChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setWidgetHeading(event.target.value as string);
    };

    const dashboardSelections = dashboardList.map((el) =>
        <MenuItem value={el} key={el + 'dbSelection'}>{el}</MenuItem>
    )

    const widgetLookup = {
        'Stock Estimates': estimateOptions,
        'Stock Fundamentals': fundamentalsOptions,
        'Stock Price': priceOptions,
    }

    const addWIdget = async (el: [string, string, string, string, filters | undefined, string], currentDashboard: string) => {
        let [widgetDescription, widgetHeader, widgetConfig, d, defaultFilters] = el
        await dispatch(tAddNewWidgetContainer({
            widgetDescription: widgetDescription, //a
            widgetHeader: widgetHeader, //b
            widgetConfig: widgetConfig, //c
            defaultFilters: defaultFilters, //d
        })).unwrap()

        dispatch(tSaveDashboard({ dashboardName: currentDashboard }))
    }

    const widgetHeadings = Object.keys(widgetLookup).map((el) => <MenuItem value={el} key={el + 'headerSelect'}>{el}</MenuItem>)

    const renderCards = () => {

        if (dashboardData[currentDashboard]) {
            const currentSelection = widgetLookup[widgetHeading]
            return (currentSelection.map((el) => {
                const thisCount = Object.values(dashboardData[currentDashboard].widgetlist)
                    .reduce((r, w) => {
                        if (el[0] === w['widgetType']) {
                            const newVal = r + 1
                            console.log('match', newVal, r)
                            return (newVal)
                        }
                        else {
                            return (r)
                        }
                    }, 0)
                return (
                    <Card raised={true} key={'card' + el[1]} >
                        <CardContent>
                            <Typography><b>{el[1]}:</b> {widgetDescriptions[el[0]]}</Typography>
                            {/* @ts-ignore */}
                            <div style={cardContainer}>
                                <div style={cardStyle}><Typography>Widget Count: {thisCount}</Typography></div>
                                <div style={cardStyle}><Button className={classes.MuiButtonBase} variant="contained" onClick={() => addWIdget(el, currentDashboard)}>Add</Button></div>
                            </div>
                        </CardContent>
                    </Card>
                )
            }
            ))
        }
    }

    return (
        <div>
            <div className={classes.root}>
                {/* @ts-ignore */}
                <div style={background} >
                    <Tabs
                        value={toggle}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                    >
                        <Tab key='select1key' label='Add Widgets'></Tab>
                        <Tab key='select2Key' label='Manage Widgets'></Tab>
                    </Tabs>
                </div>
            </div>
            {/* @ts-ignore */}
            <div style={flexInline}>
                <FormControl variant="outlined">
                    <Select
                        value={dashboard}
                        onChange={handDashboardChange}>
                        {dashboardSelections}
                    </Select>
                    <FormHelperText>Select Dashboard</FormHelperText>
                </FormControl>
                <FormControl variant="outlined">
                    <Select
                        value={widgetHeading}
                        onChange={handleHeadingChange}>
                        {widgetHeadings}
                    </Select>
                    <FormHelperText>API Heading</FormHelperText>
                </FormControl>
            </div>

            {toggle === 0 ? <>
                {/* @ts-ignore */}
                <div style={flexInline}>
                    {/* @ts-ignore */}
                    <div style={cardColumn}>{renderCards()}</div>
                </div>
                <div style={{ height: '75px' }}></div>
            </> :
                <></>}

        </div>
    )
}

export default ManageWidgets
