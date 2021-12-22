import { Grid, Button, Box, Typography } from '@mui/material/';
import { makeStyles } from '@mui/styles';
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
    root: {
        background: '#08336f',
        height: '100vh',
    },
    splashText: {
        color: 'white'
    },
    splashButton: {
        color: '#f5c76b'
    },
    center: {
        marginBottom: '1em',
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',

    }
});

const flexButtons = {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px'
}

function Splash() {
    const classes = useStyles();
    const navigate = useNavigate();
    return (
        <Box className={classes.root} height='100vh'>
            <Grid container justifyContent="center">

                <Grid item sm={2} md={3} lg={4} xl={4} />
                <Grid item xs={12} sm={8} md={6} lg={4} xl={4} >
                    <Box className={classes.center}>
                        <img height='auto' width='90%' src="splashLogo.png" alt="logo" />

                    </Box>
                    <Box height='5%' />
                    <Box className={classes.center}>
                        <Typography variant="h6" className={classes.splashText}>A window into Finnhub.io! </Typography>
                    </Box>
                    <Box height='15%' />
                    <div style={flexButtons} >
                        <Button variant="contained" color="primary" onClick={() => navigate('/about')}>
                            <Typography variant="h6" className={classes.splashButton}>Explore</Typography>
                        </Button>

                        <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
                            <Typography variant="h6" className={classes.splashButton}>Login</Typography>
                        </Button>
                    </div>

                </Grid>
                <Grid item sm={2} md={3} lg={4} xl={4} />

            </Grid>
        </Box>
    );
}

export default Splash;
