
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core/';
import { useState } from "react";

import { makeStyles } from '@material-ui/core/styles';

import CenterFocusStrongSharpIcon from '@material-ui/icons/CenterFocusStrongSharp';
// import CenterFocusWeakSharpIcon from '@material-ui/icons/CenterFocusWeakSharp';

const useStyles = makeStyles({
    root: {
        width: '500',
        position: 'fixed',
        bottom: 0,
        // background: 'transparent'
    },
});

interface props {
    setFocus: Function,
    columnCount: number,
}

export default function BottomNav(p: props) {
    const classes = useStyles();
    const [column, setColumn] = useState('0');

    const handleChange = (event, newValue) => {
        setColumn(newValue);
    };

    const bottomNavCount = 7 - p.columnCount

    const navButtons = [...Array(bottomNavCount).keys()].map((el) => {
        const label = el === 0 ? 'Menus' : `Column${el}`
        return (<BottomNavigationAction key={'k' + el} label={label} value="0" icon={<CenterFocusStrongSharpIcon />} onClick={() => { p.setFocus(el) }} />)
    })


    return (
        <BottomNavigation value={column} onChange={handleChange} className={classes.root}>
            {navButtons}
        </BottomNavigation>
    );
}

