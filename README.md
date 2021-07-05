Aweb deployable applicaiton that allows you to quickly design and visualize your [Finnhub Stock API data](https://finnhub.io/) in a [dashboard format](https://github.com/GlennStreetman/finnHub-Dashboard/blob/master/public/Example_small.jpg). Each dashboard then becomes its own API endpoint that you can query using graphQL. After you are done designing your dashboards you can push your data to Excel.

[Working Example](https://finn-dash.herokuapp.com/) requires going through registration process and working Finnhub.io API Key.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).  
Backend uses [Express Server](https://expressjs.com).  
User Login info and dashboard data is saved in a [PostgreSQL database](https://www.postgresql.org).  
See /db/postgres_schema.sql for required database schema.  
The registration process requires that express have access to an SMTP server in order to send registration emails. Recommend Mailgun.  
Register a [Mailgun Account](https://www.mailgun.com/) and add your apikeys to the .env setup below.

## .env setup

FOR LOCAL HOSTING:  
API_KEY = mailgun api key  
DOMAIN_KEY = mailgun domain  
session_secret = secret phrase used for express-session management. KEEP SECRET.  
pguser = postgres user name  
pghost = postgres host name  
pgpassword = postgress password  
pgdatabase = postgres database name  
pgport = postress server port  
devDB = PG <--SQLite3 support depricated. Some work needed for SQL3 tag to work  
ssl = allow  
live = 0 or 1 (0 for development mode NPM RUN client/server, 1 for live NPM Start)
mongo = connection string for mongo db. ex: mongodb://localhost:27017
testURL = URL for dev environment. ex: http://localhost:5000
deployURL = URL for deployment environment. ex: https://finn-dash.herokuapp.com
db_verison = 1.0

FOR HEROKU Hosting + Heroku Postgres addon:  
API_Key: mailgun api key  
DATABASE_URL: Database URL provided by Heroku  
DOMAIN_KEY: mailgun domain  
live: 1  
session_secret: secret phrase used for express-session management. KEEP SECRET.
db_verison = 1.0

## Available Scripts

In the project directory, you can run:

### `npm run client`

Runs the react app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run server`

Runs the express server in development mode.<br />
Send HTTP requests [http://localhost:5000](http://localhost:5000) to test routes.

### `npm start`

    Run the build/live version, app is returned from express server.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
