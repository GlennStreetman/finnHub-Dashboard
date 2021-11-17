
import { BottomNavigation, BottomNavigationAction, Icon } from '@material-ui/core/';
import { useState } from "react";

import { makeStyles } from '@material-ui/core/styles';

import CenterFocusStrongSharpIcon from '@material-ui/icons/CenterFocusStrongSharp';
import CenterFocusWeakSharpIcon from '@material-ui/icons/CenterFocusWeakSharp';

const useStyles = makeStyles({
    root: {
        width: '500',
        position: 'fixed',
        bottom: 0,
        // background: 'transparent'
    },
});

interface props {
    setFocus: Function
}

export default function BottomNav(p: props) {
    const classes = useStyles();
    const [column, setColumn] = useState('0');

    const handleChange = (event, newValue) => {
        setColumn(newValue);
    };

    return (
        <BottomNavigation value={column} onChange={handleChange} className={classes.root}>
            <BottomNavigationAction label="Menus" value="0" icon={<CenterFocusStrongSharpIcon />} onClick={() => { p.setFocus(0) }} />
            <BottomNavigationAction label="Column 1" value="1" icon={<CenterFocusWeakSharpIcon />} onClick={() => { p.setFocus(1) }} />
            <BottomNavigationAction label="Column 2" value="2" icon={<CenterFocusWeakSharpIcon />} onClick={() => { p.setFocus(2) }} />
            <BottomNavigationAction label="Column 3" value="3" icon={<CenterFocusWeakSharpIcon />} onClick={() => { p.setFocus(3) }} />
            <BottomNavigationAction label="Column 4" value="4" icon={<CenterFocusWeakSharpIcon />} onClick={() => { p.setFocus(4) }} />
        </BottomNavigation>
    );
}



