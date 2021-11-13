
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
    menuWidgetToggle: Function,
    showMenuColumn: boolean,
}

export default function BottomNav(p: props) {
    const classes = useStyles();
    const [column, setColumn] = useState('0');

    const handleChange = (event, newValue) => {
        setColumn(newValue);
    };

    return (
        <BottomNavigation value={column} onChange={handleChange} className={classes.root}>
            <BottomNavigationAction label="Menus" value="0" icon={<CenterFocusStrongSharpIcon />} onClick={() => { if (p.showMenuColumn === false) p.menuWidgetToggle(true) }} />
            <BottomNavigationAction label="Column 1" value="1" icon={<CenterFocusWeakSharpIcon />} onClick={() => { if (p.showMenuColumn === true) p.menuWidgetToggle(false) }} />
            <BottomNavigationAction label="Column 2" value="2" icon={<CenterFocusWeakSharpIcon />} onClick={() => { if (p.showMenuColumn === true) p.menuWidgetToggle(false) }} />
            <BottomNavigationAction label="Column 3" value="3" icon={<CenterFocusWeakSharpIcon />} onClick={() => { if (p.showMenuColumn === true) p.menuWidgetToggle(false) }} />
            <BottomNavigationAction label="Column 4" value="4" icon={<CenterFocusWeakSharpIcon />} onClick={() => { if (p.showMenuColumn === true) p.menuWidgetToggle(false) }} />
        </BottomNavigation>
    );
}



