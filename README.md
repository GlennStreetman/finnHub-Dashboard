A web deployable applicaiton that allows you to quickly design and visualize your [Finnhub Stock API data](https://finnhub.io/) in a [dashboard format](https://github.com/GlennStreetman/finnHub-Dashboard/blob/master/public/Example_small.jpg). Each dashboard then becomes its own API endpoint that you can query using graphQL. After you are done designing your dashboards you can push your data to Excel.

[Working Example](https://finn-dash.herokuapp.com/) requires going through registration process and working Finnhub.io API Key.

Deploy using [Docker](https://www.docker.com/).  
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).  
Backend uses [Express Server](https://expressjs.com).  
User Login info and dashboard data is saved in a [PostgreSQL database](https://www.postgresql.org).  
Required Postgres schema should auto build the first time express is launched. 
The registration process requires that express have access to an SMTP server in order to send registration emails. Recommend Mailgun.  
Register a [Mailgun Account](https://www.mailgun.com/) and add your apikeys to the .env setup below.


## .env setup

### FOR LOCAL HOSTING:  
API_KEY = mailgun api key  
DOMAIN_KEY = mailgun domain  
session_secret = secret phrase used for express-session management. KEEP SECRET.  
pguser = postgres user name  
pghost = postgres host name  
pgpassword = postgress password  
pgdatabase = postgres database name  
pgport = postress server port (5432 is default)
ssl = allow  
mongo = connection string for mongo db. ex: mongodb://localhost:27017  
URL = URL for dev environment. ex: http://localhost:5000  
version = 1.0
SKIP_PREFLIGHT_CHECK=true
echo = message prints on startup of express server

## Available Scripts  
See Makefile if you have make installed.

### `docker-compose -f  app.yaml -f app.prod.yaml  up --build`

Builds and then starts production environment.<br />
Open [http://localhost:5000](http://localhost:5000) to view it in browser.  
make prod

### `docker-compose -f app.yaml up`

Runs project in development mode.
Open [http://localhost:5000](http://localhost:5000) to view it in browser.    
Make sure typescript is running in watch mode during development.  
make dev


### `npm run tscd`

Run while developing project.  
If this step is skipped nodemon will not hot load your changes into docker.

