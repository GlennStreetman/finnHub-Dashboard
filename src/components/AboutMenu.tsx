import { Grid, Box, Typography } from '@material-ui/core/';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import MobileStepper from '@material-ui/core/MobileStepper';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { useState } from "react";

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
            <Typography variant="h4" gutterBottom>Welcome to Finndash! </Typography>
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
                {/* <img style={{ maxWidth: '85%' }} height='auto' src="sampleWidget2Setup.jpg" alt="sampleWidget" /> */}
                <img style={{ maxWidth: '100%' }} height='auto' src="sampleWidget2.jpg" alt="sampleWidget" />
            </div>
        </Box>
    </>

    const dashboards = <>
        <Box className={classes.center}>
            <Typography variant="h4" gutterBottom>Dashboards  </Typography>
            <Typography variant="h6" gutterBottom>Dashboards are groups of widgets  </Typography>
            <img style={{ maxWidth: '100%' }} height='auto' src="dbExample.jpg" alt="sample dashboard" />
            <Typography variant="h6">Widgets in a dashboard become a dataset that can be shared.</Typography>
        </Box>
    </>

    const dataSet = <>

    </>

    const thisStep = {
        0: intro,
        1: widgets,
        2: dashboards,
        3: <>WIP graphQL</>,
        4: <>WIP Excel</>,
        5: <>WIP Learn More / Register</>,
        6: <>WIP</>,
    }

    return (
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
    );
}

export default AboutMenu;
