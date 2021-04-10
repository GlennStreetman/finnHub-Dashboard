// import express from 'express';
// import eg from 'express-graphql'
import g from 'graphql'
import format from 'pg-format';
import { getDB } from '../../db/mongoLocal.js'
import { filterDict } from './GQLFilters.js'

// import {getDB} from '../../db/mongoLocal.js'
import dbLive from "../../db/databaseLive.js"
import devDB from "../../db/databaseLocalPG.js"
import { GraphQLJSONObject } from 'graphql-type-json'; //GraphQLJSON

import { finnHubData } from '../../db/mongoTypes'

// const router =  express.Router();

const db = process.env.live === "1" ? dbLive : devDB;
// const postgres = db
// const mongo = getDB


const security = new g.GraphQLObjectType({
    name: 'security',
    description: 'All FinnHub data associated with target security, by widget.',
    fields: () => ({
        widgetType: { type: g.GraphQLString, description: 'Widget Type' },
        dashboard: { type: g.GraphQLString, description: 'Dashboard Name' },
        widgetName: { type: g.GraphQLString, description: 'Widget Name' },
        security: { type: g.GraphQLString, description: 'Exchange - Security ex. US-APPL' },
        data: { type: GraphQLJSONObject, description: 'Finnhub API Data' },
    })
})

const widget = new g.GraphQLObjectType({
    name: 'widget',
    description: 'All finnHub data associated with widget.',
    fields: () => ({
        // apiString: { type: g.GraphQLString, description: 'Finnhub API Key' },
        dashboard: { type: g.GraphQLString, description: 'Dashboard Name' },
        widgetName: { type: g.GraphQLString, description: 'Widget Name' },
        security: { type: g.GraphQLString, description: 'Exchange - Security ex. US-APPL' },
        data: { type: GraphQLJSONObject, description: 'Finnhub API Data' },
        widgetType: { type: g.GraphQLString, description: 'Widget Type' },
    })
})
const Widgets = new g.GraphQLObjectType({
    name: 'Widgets',
    description: 'All widgets in specified dashboard.',
    fields: () => ({
        widgets: {
            type: g.GraphQLString, description: 'Widget Names'
        },
        type: {
            type: g.GraphQLString, description: 'Widget Type'
        },
        stocks: {
            type: GraphQLJSONObject, description: 'All stocks in dashboard watchlist.'
        },
    })
})

const Dashboards = new g.GraphQLObjectType({
    name: 'Dashboard',
    description: `
    All Dashboards associated with apiKey.
    Key should be your finnHub API key.
    `,
    fields: () => ({
        dashboard: {
            type: g.GraphQLString, description: 'Dashboard name'
        },
        stocks: {
            type: GraphQLJSONObject, description: 'All stocks in dashboard watchlist.'
        },
    })
})

const RootQueryType = new g.GraphQLObjectType({
    name: 'finnDash',
    description: 'Root Query',
    fields: () => ({
        dashboardList: {
            description: "List of all dashboards.",
            args: {
                key: { type: g.GraphQLNonNull(g.GraphQLString), description: "Required: Finnhub API key" }
            },
            type: g.GraphQLList(Dashboards),
            resolve: (parrent, args) => {
                return new Promise((res, rej) => {
                    const apiKey = format('%L', args.key)
                    const query = `
                    SELECT dashboardname as dashboard, globalstocklist as stocks
                    FROM dashboard 
                    WHERE userID = (SELECT id FROM users WHERE apiKey = ${apiKey})`
                    console.log('getUserQuery', query)
                    db.query(query, (err, rows) => {
                        if (err) {
                            console.log(err)
                            res(`GQL Problem retrieving dashboards: ${err}`);
                        } else {
                            const queryRows = rows.rows
                            for (const obj in queryRows) {
                                queryRows[obj].stocks = JSON.parse(queryRows[obj].stocks)
                            }
                            res(queryRows)
                        }
                    });
                })
            }
        },
        widgetList: {
            description: "List of all widets associated with dashboard.",
            args: {
                key: { type: g.GraphQLNonNull(g.GraphQLString), description: 'Required: Finnhub API Key' },
                dashboard: { type: g.GraphQLNonNull(g.GraphQLString), description: 'Required: Dashboard name' },
            },
            type: g.GraphQLList(Widgets),
            resolve: (parrent, args) => {
                return new Promise((res, rej) => {
                    const apiKey = format('%L', args.key)
                    const dashboardName = format('%L', args.dashboard).toUpperCase()
                    const query = `
                    SELECT widgetHeader as widgets, widgettype as type, trackedstocks as stocks
                    FROM widgets 
                    WHERE dashboardkey = (
                        SELECT id
                        FROM dashboard 
                        WHERE userID = (
                            SELECT id 
                            FROM users 
                            WHERE apiKey = ${apiKey}) AND dashboardname = ${dashboardName}
                    )`
                    console.log('getUserQuery', query)
                    db.query(query, (err, rows) => {
                        if (err) {
                            console.log(err)
                            res(`GQL Problem retrieving widgets: ${err}`);
                        } else {
                            const queryRows = rows.rows
                            for (const obj in queryRows) {
                                queryRows[obj].stocks = JSON.parse(queryRows[obj].stocks)
                            }
                            res(queryRows)
                        }
                    });
                })
            }
        },
        widget: {
            description: "For target widget in dashboard, return data for each security.",
            args: {
                key: { type: g.GraphQLNonNull(g.GraphQLString), description: 'Required: Finnhub API key' },
                dashboard: { type: g.GraphQLNonNull(g.GraphQLString), description: 'Required: Dashboard name' },
                widget: { type: g.GraphQLNonNull(g.GraphQLString), description: 'Required: Widget Name' },
                security: {
                    type: g.GraphQLString, description: `
                    Optional: Filter results for security Name(s).
                    If multiple securities specified, seperate with commas.
                    Do not add extra spaces between commas.
                    Example: "US-AAPL,US-MSFT,US-TSLA".
                ` },
            },
            type: g.GraphQLList(widget),
            resolve: (parrent, args) => {
                return new Promise(async (res, rej) => {
                    const apiKey = format('%L', args.key)
                    const dashboardName = format('%L', args.dashboard).toUpperCase()
                    const widget = format('%L', args.widget)
                    //optional args
                    const securityList = () => {
                        const securityList = args.security.split(',')
                        const returnList: Object[] = []
                        for (const s in securityList) {
                            returnList.push({ security: securityList[s] })
                        }
                        return returnList
                    }
                    const security = args.security ? securityList() : false
                    const query = `
                    SELECT w.widgetID, u.id, w.widgettype
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
                    `
                    console.log('get widget: ', query)
                    try {
                        const returnData = await db.query(query)
                        // console.log('This Data: ', returnData.rows[0])
                        const findData = {
                            userID: returnData.rows[0].id,
                            dashboard: args.dashboard,
                            widget: returnData.rows[0].widgetid,
                        }
                        if (security) findData['$or'] = security
                        console.log('Find Data: ', findData)

                        const widgetType = returnData.rows[0].widgettype
                        //GET MONGO DATA
                        const client = getDB()
                        const database = client.db('finnDash');
                        const dataSet = database.collection('dataSet');
                        const findDataSet: finnHubData[] = await dataSet.find(findData)
                        const resList: Object[] = []
                        await findDataSet.forEach((data: finnHubData) => {
                            console.log('data', data)
                            if (filterDict[data.widgetType]) {//if finnHub API data needs to be filtered or reformated
                                data.data = filterDict[data.widgetType](data.data, data.config)
                            }
                            data.widgetType = widgetType
                            resList.push(data)
                        })
                        res(resList)
                    } catch (err) {
                        console.log("Problem retrieving user Data: ", err)
                    }
                })
            }
        },
        security: {
            description: "For target security in dashboard, retun data for each widget. Optionaly filter by widget name.",
            args: {
                key: { type: g.GraphQLNonNull(g.GraphQLString), description: 'Required: Finnhub API key' },
                dashboard: { type: g.GraphQLNonNull(g.GraphQLString), description: 'Required: Dashboard name' },
                security: { type: g.GraphQLNonNull(g.GraphQLString), description: 'Required: Exchange key - Security ex. US-AAPL' },
                widgetName: {
                    type: g.GraphQLString, description: `
                    Optional: Filter results for Widget Name(s).
                    If multiple names specified, seperate with commas.
                    Do not add extra spaces between commas.
                    Example: "Name1,Name2,Name3".
                ` },
                widgetType: {
                    type: g.GraphQLString, description: `
                    Optional: Filter results for widget type(s).
                    If multiple types specified, seperate with commas.
                    Do not add extra spaces between commas.
                    Example: "type1,type2,type3".
                `},

            },
            type: g.GraphQLList(security),
            resolve: (parrent, args) => {
                console.log('getting security')

                return new Promise(async (res, rej) => {

                    const apiKey = format('%L', args.key)
                    const dashboardName = format('%L', args.dashboard).toUpperCase()
                    //options args
                    const widgetNameList = () => format('%L', args.widgetName.split(','))
                    const widgetTypeList = () => format('%L', args.widgetType.split(','))
                    const widgetNameFilters = args.widgetName ? ` AND w.widgetheader IN (${widgetNameList()}) ` : `  `
                    const widgetType = args.widgetType ? ` AND w.widgettype IN (${widgetTypeList()})  ` : `  `

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
                    ${widgetNameFilters} ${widgetType} 
                    `
                    console.log('getUserQuery', query)
                    try {
                        const returnData = await db.query(query)
                        // console.log('This Data: ', returnData.rows[0])
                        const findWidgetIds = [{ widget: 'plug' }]
                        for (const r in returnData.rows) {
                            findWidgetIds.push({ widget: returnData.rows[r].widgetid })
                        }
                        const findData = {
                            userID: returnData.rows[0].id,
                            dashboard: args.dashboard,
                            $or: findWidgetIds
                        }
                        // console.log('findData', findData)
                        //GET MONGO DATA
                        const client = getDB()
                        const database = client.db('finnDash');
                        const dataSet = database.collection('dataSet');
                        const findDataSet = await dataSet.find(findData)
                        const resList: any = []
                        await findDataSet.forEach((data: any) => {
                            if (filterDict[data.widgetType]) {
                                data.data = filterDict[data.widgetType](data.data)
                            }
                            resList.push(data)
                        })
                        // console.log(resList)
                        res(resList)
                    } catch (err) {
                        console.log("Problem retrieving user Data: ", err)
                    }
                })
            }
        },
    })
})

export const schema = new g.GraphQLSchema({
    query: RootQueryType
})


