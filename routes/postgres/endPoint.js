const express = require("express");
const router = express.Router();
const format = require("pg-format");
const db = process.env.live === "1" ? require("../../db/databaseLive.js") : require("../../db/databaseLocalPG.js");
const {finnHub, createFunctionQueueObject} = require("../../src/appFunctions/throttleQueueAPI.js");
const cors = require('cors')
const {widgetDict} = require("../../src/registers/endPointsReg.js")

router.use(function timeLog(req, res, next) {
    // console.log("Time: ", new Date());
    next();
    });

router.get("/endPoint", cors(),(req, res) => {
    console.log("Generating new endpoint data");
    // const data = {}
    const apiKey = format('%L', req.query['apiKey'])
    const dashBoardName = format('%L', req.query['dashBoardName'])
    const returnDashBoardQuery = `
        SELECT widgetlist, globalstocklist
        FROM dashboard
        WHERE dashboardname = ${dashBoardName} AND
            userID = (SELECT id FROM users WHERE apiKey = ${apiKey} limit 1)
        limit 1
    `

    const getDashBoard = () => {return new Promise((resolve, reject) => {
        //returns dashboard object from DB.
        db.query(returnDashBoardQuery, (err, rows) => {

            if (err) {
                res.json({message: "Problem generating endpoint."});
                console.log(err)
            } else {
                const data = JSON.parse(rows.rows[0].widgetlist)
                const stockList = JSON.parse(rows.rows[0].globalstocklist)
                const resObj = {data: data, stockList: stockList} 
                // console.log(data)
                resolve(resObj)
            }
        })
    })}

    const buildEndPoint = (dashboard) => {return new Promise((resolve, reject) => {
    //builds query strings for finnHub API calls.
        const resObject = {
            widget: {},
            security: {},
            streamingData: {},
        }
        for (const stock in dashboard.stockList){
            if (dashboard.stockList[stock].exchange === 'US'){
                const socket = {
                    type: 'subscirbe',
                    symbol: dashboard.stockList[stock].symbol}
                resObject.streamingData[dashboard.stockList[stock].symbol] = socket}
            }

        for (const widgetKey in dashboard.data) {
            const thisWidget = dashboard.data[widgetKey]
            const widgetFunction = widgetDict[thisWidget.widgetType] //function to create query string
            const queryStringList = widgetFunction(
                thisWidget.trackedStocks, 
                thisWidget.filters, 
                req.query['apiKey'])
            //Info for each widget
            const id = resObject.widget[thisWidget.widgetHeader] ? thisWidget.widgetID : thisWidget.widgetHeader
            resObject.widget[id] = {
                name: thisWidget.widgetHeader,
                Endpoint: thisWidget.widgetType,
                filters: thisWidget.filters,
                stockData: {},
            }
            for (const stock in queryStringList) {
                resObject.widget[id].stockData[stock] = {
                    'apiString': queryStringList[stock]
                } 
            //Info for each STOCK/security
                if (resObject.security[stock] === undefined) {resObject.security[stock] = {} }
                resObject.security[stock][id] = {
                    apiString: queryStringList[stock],
                    EndPoint: thisWidget.widgetType,
                    filters: thisWidget.filters,
                    stockData: {},
                }
            }
        }
        resolve(resObject)
    })}

    const requestQueryData = (resObject) => {return new Promise((resolve, reject) => {
        const throttle = createFunctionQueueObject(25, 1000, true) 
        let requestList = []
        //create list of promises to be pushed to Promise.all
        for(const key in resObject.widget) {
            for(const stock in resObject.widget[key].stockData){
                const apiString = resObject.widget[key].stockData[stock].apiString
                const requestID = {
                    key: key,
                    stock: stock,
                    }
                // console.log('requestID -->', requestID)
                requestList.push(finnHub(throttle, apiString, requestID))
                // finnHub(throttle, apiString, requestID)
            }
        }
            console.log("----------starting endpoint promise chain---------")
            // console.log(throttle.queue)
            Promise.all(requestList)
            .then((response) => {
                console.log("DONE generating endpoint")
                for (const Obj in response){
                    const id = response[Obj].key
                    const stock = response[Obj].stock
                    const data = response[Obj].data
                    resObject.widget[id].stockData[stock].data = data
                    resObject.security[stock][id].stockData = data
                }
                resolve(resObject)
            })
            //submit all apicalls and receive data. Bind data to dashboard object. Parse data in next step.
    })}


    getDashBoard()
    .then((data) => {
        //build endpoint from dashboard
        return buildEndPoint(data)
    })
    .then((data) => {
        // console.log(data)
        return requestQueryData(data)
    })
    .then((data) => {
        console.log("endpoint request complete")
        res.json(data)
    })
    .catch((err => {
        console.log(err)
    }))
});

module.exports = router;