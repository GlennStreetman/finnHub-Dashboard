
import { BottomNavigation, BottomNavigationAction } from '@mui/material/';
import { useState } from "react";

import { makeStyles } from '@mui/styles';

import CenterFocusStrongSharpIcon from '@mui/icons-material/CenterFocusStrongSharp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const useStyles = (width) => {
    const thisWidth = width > 800 ? 'auto' : '100%'
    return makeStyles({
        root: {
            width: thisWidth,
            position: 'fixed',
            bottom: 0,
            justifyContent: 'center'
            // background: 'transparent'
        },
    })
};

interface props {
    setFocus: Function,
    columnCount: number,
    focus: number,
    width: number,
}

export default function BottomNav(p: props) {
    const classes: any = useStyles(p.width);
    const [column, setColumn] = useState('0');

    const handleChange = (event, newValue) => {
        setColumn(newValue);
    };

    return (<>

        <BottomNavigation value={column} onChange={handleChange} className={classes.root}>
            <BottomNavigationAction label='Menu' value="0" icon={<CenterFocusStrongSharpIcon />} onClick={() => { p.setFocus(0) }} />


            {p.focus > 0 ? (
                <BottomNavigationAction value="0" icon={<ArrowBackIcon />} onClick={() => { p.setFocus(p.focus - 1) }} />
            ) : (
                <BottomNavigationAction value="0" icon={<ArrowBackIcon />} onClick={() => { }} />
            )}

            {p.focus < 6 ? (
                <BottomNavigationAction value="0" icon={<ArrowForwardIcon />} onClick={() => { p.setFocus(p.focus + 1) }} />
            ) : (
                <BottomNavigationAction value="0" icon={<ArrowBackIcon />} onClick={() => { }} />
            )}

        </BottomNavigation>
    </>);
}

