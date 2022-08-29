# Finndash

A web deployable applicaiton that allows you to quickly design and visualize your [Finnhub Stock API data](https://finnhub.io/) in a [dashboard format](https://github.com/GlennStreetman/finnHub-Dashboard/blob/master/public/Example_small.jpg).  
Each dashboard then becomes its own API endpoint that you can query using graphQL.  
After you are done designing your dashboards you can push your data to Excel.

[Working Example](https://finndash.gstreet.dev) requires going through registration process and working Finnhub.io API Key.

## Deployed using [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)  


## Setup

Navigate to desired project folder.

> git clone https://github.com/GlennStreetman/finnHub-Dashboard.git  
> NPM install

## Create .env file

rename env.example to dev.env for dev mode and prod.env for production.
Remember to rerun build after any changes to an env file
Login requires [Mailgun Account](https://www.mailgun.com/). Remember to add your apikeys to the .env file.

## Dev mode

> npm run dev-build
> npm run dUp
> npm run tsc

On slower systems changes to server take a few seconds transpile and nodemon is too fast. Save twice for server changes to reflect.

### If default user or passwords are changed in the .env file make sure to reflect the changes in the corresponding .yaml files

## Build for production

> npm run prod-build
> npm run pUp

Use nginx, or favored reverse proxy, to send requests to port 5000

### TESTS

Test need to have useRemoteLogin set to false in test.env file.

> npm run test-build
> test-buildEnv
> npm run testDeploy
> npm run connect
> npm run test 'testname'

### Debugging Tests

Use break points with the test-debug command, shown below, to debug

> npm run test-debug 'testname'

After running test-debug, with the test you want to debug appended to the end of the command go
into chrome and navigate to:

>chrome://inspect

