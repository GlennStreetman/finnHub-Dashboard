import { Grid, Box, Typography } from '@mui/material/';
import { useTheme } from '@mui/material/styles';
import MobileStepper from '@mui/material/MobileStepper';
import Button from '@mui/material/Button';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { makeStyles } from '@mui/styles';



const aboutTheme = createTheme({
    typography: {
        h4: {
            fontSize: '2em'
        },
        h5: {
            fontSize: '1.5em'
        },
        h6: {
            fontSize: '1em'
        }
    },
})

const useStyles = makeStyles({
    root: {
        maxWidth: 400,
        flexGrow: 1,
    },
    center: {
        marginBottom: '1em',
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
    },

});


function AboutMenu() {
    const navigate = useNavigate();
    const classes = useStyles();
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const divInline = {
        display: 'flex',
        'flex-direction': 'row',
        justifyContent: 'center',
        gap: '15px',
        'flex-wrap': 'wrap',
    }


    const intro = <>
        <Box className={classes.center}>
            <Typography style={{ 'fontSize': 'size-300' }} variant="h4" gutterBottom>Welcome to Finndash! </Typography>
            <Typography variant="h5" gutterBottom>Finndash is a data specification, collaboration, and productivity tool. </Typography>
            <Typography variant="h6" gutterBottom>Finndash consumes, formats, displays, and repackages your Finnhub.io API data. </Typography>
        </Box>
    </>

    const widgets = <>
        <Box className={classes.center}>
            <Typography variant="h4" gutterBottom>Widgets! </Typography>
            <Typography variant="h6" gutterBottom>The foundation of FinnDash </Typography>
            <Typography variant="h6" gutterBottom>Instead of code: </Typography>
            <img style={{ maxWidth: '100%' }} height='auto' src="sampleCode.jpeg" alt="code example: http request" />
            <Typography variant="h6">Use Widgets:</Typography>
            <div style={divInline}>
                {/* <img style={{ maxWidth: '85%' }} height='auto' src="sampleWidgetSetup.jpg" alt="sampleWidget" /> */}
                <img style={{ maxWidth: '100%' }} height='auto' src="sampleWidget.jpg" alt="sampleWidget" />
            </div>
            <div style={divInline}>
                <img style={{ maxWidth: '100%' }} height='auto' src="sampleWidget2.jpg" alt="sampleWidget" />
            </div>
        </Box>
    </>

    const dashboards = <>
        <Box className={classes.center}>
            <Typography variant="h4" gutterBottom>Dashboards  </Typography>
            <Typography variant="h6" gutterBottom>Dashboards are groups of widgets.  </Typography>
            <Typography variant="h6" gutterBottom>Each dashboard is its own dataset. </Typography>
            <img style={{ maxWidth: '100%' }} height='auto' src="dbExample.jpg" alt="sample dashboard" />
        </Box>
    </>

    const graphQL = <>
        <Box className={classes.center}>
            <Typography variant="h4" gutterBottom>Share your datasets using graphQL.</Typography>
            <Typography variant="h6" gutterBottom> Updates to Dashboards immidiatly flow through to GraphQL. </Typography>
            <Typography variant="h6" gutterBottom>Share your data while protecting your finnhub.io API key. </Typography>
            <img style={{ maxWidth: '100%' }} height='auto' src="graphQL.jpg" alt="sample dashboard" />

        </Box>
    </>

    const excel = <>
        <Box className={classes.center}>
            <Typography variant="h4" gutterBottom>Expore your data using Excel.</Typography>
            <Typography variant="h6" gutterBottom> Push data to excel with a single click. </Typography>
            {/* <Typography variant="h6" gutterBottom>Share your data while protecting your finnhub.io API key. </Typography> */}
            <iframe
                style={{ pointerEvents: 'none' }}
                width="720"
                height="405"
                title='iFrameTemplate'
                src="https://giphy.com/embed/4kl7W11ntfC0qUoSWN"
                frameBorder="0"
                className="giphy-embed"
                allowFullScreen
            />
        </Box>
    </>

    const start = <>
        <Box className={classes.center}>
            <Typography variant="h4" gutterBottom>Before your start</Typography>
            <Typography variant="h6" gutterBottom> Register for your free <a href="https://finnhub.io/register" target="_blank" rel="noopener noreferrer">
                Finnhub.io
            </a> API key</Typography>
            <Typography variant="h6" gutterBottom>Then</Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
                <Typography variant="h6" >Login</Typography>
            </Button>

        </Box>
    </>

    const thisStep = {
        0: intro,
        1: widgets,
        2: dashboards,
        3: graphQL,
        4: excel,
        5: start,
    }

    return (
        <ThemeProvider theme={aboutTheme}>
            <Grid container justifyContent="center">
                <Grid item xs={1} sm={2} md={3} lg={3} xl={3} />
                <Grid item xs={10} sm={8} md={6} lg={6} xl={6} >
                    {thisStep[activeStep]}
                    <Box className={classes.center}>
                        <MobileStepper
                            variant="dots"
                            steps={6}
                            position="static"
                            activeStep={activeStep}
                            className={classes.root}
                            nextButton={
                                <Button size="small" onClick={handleNext} disabled={activeStep === 5}>
                                    Next
                                    {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                                </Button>
                            }
                            backButton={
                                <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                                    {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                                    Back
                                </Button>
                            }
                        />
                    </Box>
                    {/* Take control of your Finnhub API data using widgets.

                Groups of widgets become dashboards.

                Dashboards are dataspecifications that can easily be updated, shared, and reviewed.

                Push your Dashboard data into excel.

                Share your Dashboard data with your team using GraphQL.

                Want to know more? Take the tour. */}


                </Grid>
                <Grid item xs={1} sm={2} md={3} lg={3} xl={3} />
            </Grid>
        </ThemeProvider>
    );
}

export default AboutMenu;
