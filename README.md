A web deployable applicaiton that allows you to quickly design and visualize your [Finnhub Stock API data](https://finnhub.io/) in a [dashboard format](https://github.com/GlennStreetman/finnHub-Dashboard/blob/master/public/Example_small.jpg).  
Each dashboard then becomes its own API endpoint that you can query using graphQL.  
After you are done designing your dashboards you can push your data to Excel.

[Working Example](https://finn-dash.herokuapp.com/) requires going through registration process and working Finnhub.io API Key.

### Deployed using [Docker](https://www.docker.com/).  
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).   
The user registration process requires email registration. Recommend Mailgun.  
Register a [Mailgun Account](https://www.mailgun.com/) and add your apikeys to the .env setup below.

## Setup  
Navigate to desired project folder.
>git clone https://github.com/GlennStreetman/finnHub-Dashboard.git  
>NPM install  
>NPM run build  

create the .env file, shown below, in the project folder.

## Create .env file

EMAIL = false     #set to true if you want to use email verification for site registration.
API_KEY = mailgun api key  
DOMAIN_KEY = mailgun domain key  
session_secret = supersecretkey  
pguser = postgres  
pgpassword = example  
pghost = postgresdocker  
pgdatabase = postgres  
pgport = 5432  
ssl = allow  
mongo = mongodb://root:example@mongo:27017/  #root is usename, example is password.
URL = http://localhost:5000  
version = 1.0  
legacyWatch=true  
CHOKIDAR_USEPOLLING=true  

### If default user or passwords are changed in the .env file make sure to reflect the changes in the corresponding .yaml files. 

## Available Scripts  
Best run using [make](https://www.gnu.org/software/make/)  

### `docker-compose -f  app.yaml -f app.prod.yaml  up --build`
Builds and then starts production environment.<br />
Open [http://localhost:5000](http://localhost:5000) to view it in browser.  
>make prod

### `docker-compose -f app.yaml up`
s project in development mode.
Open [http://localhost:5000](http://localhost:5000) to view it in browser.    
Make sure typescript is running in watch mode during development.  
>make dev

### `npm run tscd`  
Run while developing project.  
If this step is skipped nodemon will not hot load your changes into docker.

### $ pghost="testPostgres" docker-compose -f test.build.yaml up --build 
sets up integration testing environment
>make buildtest

### $ pghost="testPostgres" docker-compose -f test.build.yaml -f test.yaml up
runs integration tests
>make test
