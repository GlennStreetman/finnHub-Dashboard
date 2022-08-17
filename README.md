# Finndash

A web deployable applicaiton that allows you to quickly design and visualize your [Finnhub Stock API data](https://finnhub.io/) in a [dashboard format](https://github.com/GlennStreetman/finnHub-Dashboard/blob/master/public/Example_small.jpg).  
Each dashboard then becomes its own API endpoint that you can query using graphQL.  
After you are done designing your dashboards you can push your data to Excel.

[Working Example](https://finn-dash.herokuapp.com/) requires going through registration process and working Finnhub.io API Key.

## Deployed using [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)  
The user registration process can use email registration. Recommend Mailgun
Register a [Mailgun Account](https://www.mailgun.com/) and add your apikeys to the .env setup below

## Setup

Navigate to desired project folder.

> git clone https://github.com/GlennStreetman/finnHub-Dashboard.git  
> NPM install

## Create .env file

rename env.example to dev.env for dev mode and prod.env for production.
Remember to rerun build after any changes to an env file

## Dev mode

> npm run dev-build
> npm run dev
> npm run tsc

On slower systems changes to server take a few seconds transpile and nodemon is too fast. Save twice for server changes to reflect.

### If default user or passwords are changed in the .env file make sure to reflect the changes in the corresponding .yaml files

## Build for production

### NGINX

GraphQL requests need to be routed to port 5000

    location /graphQL {
        proxy_pass http://127.0.0.1:5000;
    }

    location /qGraphQL {
        proxy_pass http://127.0.0.1:5000;
    }
