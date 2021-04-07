// import express from 'express';
// import eg from 'express-graphql'
import g from 'graphql';
import format from 'pg-format';
import { getDB } from '../../db/mongoLocal.js';
// import {getDB} from '../../db/mongoLocal.js'
import dbLive from "../../db/databaseLive.js";
import devDB from "../../db/databaseLocalPG.js";
import { GraphQLJSONObject } from 'graphql-type-json';
// const router =  express.Router();
const db = process.env.live === "1" ? dbLive : devDB;
// const postgres = db
// const mongo = getDB
const security = new g.GraphQLObjectType({
    name: 'security',
    description: 'All FinnHub data associated with target security, by widget.',
    fields: () => ({
        widget: { type: g.GraphQLString, description: 'Widget ID' },
        apiString: { type: g.GraphQLString, description: 'FinnHub API Key' },
        dashboard: { type: g.GraphQLString, description: 'Dashboard Name' },
        description: { type: g.GraphQLString, description: 'Widget Name' },
        security: { type: g.GraphQLString, description: 'Exchange - Security ex. US-APPL' },
        data: { type: GraphQLJSONObject, description: 'Finnhub API Data' },
    })
});
const widget = new g.GraphQLObjectType({
    name: 'widget',
    description: 'All finnHub data associated with widget.',
    fields: () => ({
        apiString: { type: g.GraphQLString, description: 'Finnhub API Key' },
        dashboard: { type: g.GraphQLString, description: 'Dashboard Name' },
        description: { type: g.GraphQLString, description: 'Widget Name' },
        security: { type: g.GraphQLString, description: 'Exchange - Security ex. US-APPL' },
        data: { type: GraphQLJSONObject, description: 'Finnhub API Data' },
    })
});
const Widgets = new g.GraphQLObjectType({
    name: 'Widgets',
    description: 'All widgets in specified dashboard.',
    fields: () => ({
        widgets: {
            type: g.GraphQLString, description: 'Widget Names'
        }
    })
});
const Dashboards = new g.GraphQLObjectType({
    name: 'Dashboard',
    description: `
    All Dashboards associated with apiKey.
    Key should be your finnHub API key.
    `,
    fields: () => ({
        db: {
            type: g.GraphQLString, description: 'Finnhub API Key'
        }
    })
});
const RootQueryType = new g.GraphQLObjectType({
    name: 'finnDash',
    description: 'Root Query',
    fields: () => ({
        dashboardList: {
            args: {
                key: { type: g.GraphQLString }
            },
            type: g.GraphQLList(Dashboards),
            resolve: (parrent, args) => {
                return new Promise((res, rej) => {
                    const apiKey = format('%L', args.key);
                    const query = `
                    SELECT dashboardname as db
                    FROM dashboard 
                    WHERE userID = (SELECT id FROM users WHERE apiKey = ${apiKey})`;
                    console.log('getUserQuery', query);
                    db.query(query, (err, rows) => {
                        if (err) {
                            console.log(err);
                            res(`GQL Problem retrieving dashboards: ${err}`);
                        }
                        else {
                            res(rows.rows);
                        }
                    });
                });
            }
        },
        widgetList: {
            args: {
                key: { type: g.GraphQLString, description: 'Finnhub API Key' },
                db: { type: g.GraphQLString, description: 'Dashboard name' },
            },
            type: g.GraphQLList(Widgets),
            resolve: (parrent, args) => {
                return new Promise((res, rej) => {
                    const apiKey = format('%L', args.key);
                    const dashboardName = format('%L', args.db).toUpperCase();
                    const query = `
                    SELECT widgetHeader as widgets
                    FROM widgets 
                    WHERE dashboardkey = (
                        SELECT id
                        FROM dashboard 
                        WHERE userID = (
                            SELECT id 
                            FROM users 
                            WHERE apiKey = ${apiKey}) AND dashboardname = ${dashboardName}
                    )`;
                    console.log('getUserQuery', query);
                    db.query(query, (err, rows) => {
                        if (err) {
                            console.log(err);
                            res(`GQL Problem retrieving widgets: ${err}`);
                        }
                        else {
                            res(rows.rows);
                        }
                    });
                });
            }
        },
        widget: {
            args: {
                key: { type: g.GraphQLString, description: 'Finnhub API key' },
                db: { type: g.GraphQLString, description: 'Dashboard name' },
                widget: { type: g.GraphQLString, description: 'Widget Name' },
            },
            type: g.GraphQLList(widget),
            resolve: (parrent, args) => {
                return new Promise(async (res, rej) => {
                    const apiKey = format('%L', args.key);
                    const dashboardName = format('%L', args.db).toUpperCase();
                    const widget = format('%L', args.widget);
                    const query = `
                    SELECT w.widgetID, u.id
                    FROM widgets w
					LEFT JOIN USERS U ON U.apiKey = ${apiKey}
                    WHERE dashboardkey = (
                        SELECT id
                        FROM dashboard
                        WHERE userID = (
                            SELECT id
                            FROM users
                            WHERE apiKey = ${apiKey}) AND dashboardname = ${dashboardName})
					AND widgetHeader = ${widget}
                    `;
                    // console.log('getUserQuery', query)
                    try {
                        const returnData = await db.query(query);
                        // console.log('This Data: ', returnData.rows[0])
                        const findData = {
                            userID: returnData.rows[0].id,
                            dashboard: args.db,
                            widget: returnData.rows[0].widgetid,
                        };
                        console.log('findData', findData);
                        //GET MONGO DATA
                        const client = getDB();
                        const database = client.db('finnDash');
                        const dataSet = database.collection('dataSet');
                        console.log('findData', findData);
                        const findDataSet = await dataSet.find(findData);
                        const resList = [];
                        await findDataSet.forEach((data) => {
                            resList.push(data);
                        });
                        console.log(resList);
                        res(resList);
                    }
                    catch (err) {
                        console.log("Problem retrieving user Data: ", err);
                    }
                });
            }
        },
        security: {
            args: {
                key: { type: g.GraphQLString, description: 'Finnhub API key' },
                db: { type: g.GraphQLString, description: 'Dashboard name' },
                security: { type: g.GraphQLString, description: 'Exchange key - Security ex. US-AAPL' },
            },
            type: g.GraphQLList(widget),
            resolve: (parrent, args) => {
                return new Promise(async (res, rej) => {
                    const apiKey = format('%L', args.key);
                    const dashboardName = format('%L', args.db).toUpperCase();
                    const widget = format('%L', args.widget);
                    const query = `
                    SELECT w.widgetID, u.id
                    FROM widgets w
					LEFT JOIN USERS U ON U.apiKey = ${apiKey}
                    WHERE dashboardkey = (
                        SELECT id
                        FROM dashboard
                        WHERE userID = (
                            SELECT id
                            FROM users
                            WHERE apiKey = ${apiKey}) AND dashboardname = ${dashboardName})
					AND widgetHeader = ${widget}
                    `;
                    // console.log('getUserQuery', query)
                    try {
                        const returnData = await db.query(query);
                        // console.log('This Data: ', returnData.rows[0])
                        const findData = {
                            userID: returnData.rows[0].id,
                            dashboard: args.db,
                            widget: returnData.rows[0].widgetid,
                        };
                        console.log('findData', findData);
                        //GET MONGO DATA
                        const client = getDB();
                        const database = client.db('finnDash');
                        const dataSet = database.collection('dataSet');
                        console.log('findData', findData);
                        const findDataSet = await dataSet.find(findData);
                        const resList = [];
                        await findDataSet.forEach((data) => {
                            resList.push(data);
                        });
                        console.log(resList);
                        res(resList);
                    }
                    catch (err) {
                        console.log("Problem retrieving user Data: ", err);
                    }
                });
            }
        },
    })
});
export const schema = new g.GraphQLSchema({
    query: RootQueryType
});
//select widgetID from widget and userID from apiKey
//# sourceMappingURL=graphQL.js.map