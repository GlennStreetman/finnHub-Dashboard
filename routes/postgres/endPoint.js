const express = require("express");
const router = express.Router();
const format = require("pg-format");
const db = process.env.live === "1" ? require("../../db/databaseLive.js") : require("../../db/databaseLocalPG.js");
const {finnHub, createFunctionQueueObject} = require("../../src/appFunctions/throttleQueueAPI.js");
const cors = require('cors')
const {widgetDict} = require("../../src/registers/endPointsReg.js")

router.use(function timeLog(req, res, next) {
    console.log("Time: ", new Date());
    next();
    });

router.get("/endPoint", cors(),(req, res) => {
    console.log("Generating new endpoint data");
    // const data = {}
    const apiKey = format('%L', req.query['apiKey'])
    const dashBoardName = format('%L', req.query['dashBoardName'])
    const returnDashBoardQuery = `
        SELECT widgetlist
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
                // console.log(data)
                resolve(data)
            }
        })
    })}

    const buildEndPoint = (dashboard) => {return new Promise((resolve, reject) => {
    //builds query strings for finnHub API calls.
        const resObject = {}
        for (const widgetKey in dashboard) {
            const thisWidget = dashboard[widgetKey]
            const widgetFunction = widgetDict[thisWidget.widgetType] //function to create query string
            const queryStringList = widgetFunction(
                thisWidget.trackedStocks, 
                thisWidget.filters, 
                req.query['apiKey'])
            // dashboard[key].apiStrings = queryStringList
            const id = thisWidget.widgetID
            resObject[id] = {}
                resObject[id].name = thisWidget.widgetHeader
                resObject[id].finnhubEndpoint = thisWidget.widgetType
                resObject[id].filters = thisWidget.filters
                resObject[id].stockData = {}
                    // resObject[id].stockData.apiString = queryStringList[0]
        //    console.log(queryStringList)
            for (const stock in queryStringList) {
                resObject[id].stockData[stock] = {
                    'apiString': queryStringList[stock]
                } 
                // console.log(resObject[id].stockData[stock])  
            }
        }
        // console.log("res Object -->", resObject)
        resolve(resObject)
    })}

    const requestQueryData = (resObject) => {return new Promise((resolve, reject) => {
        const throttle = createFunctionQueueObject(25, 1000, true) 
        let requestList = []
        //create list of promises to be pushed to Promise.all
        for(const key in resObject) {
            for(const stock in resObject[key].stockData){
                const apiString = resObject[key].stockData[stock].apiString
                const requestID = {
                    key: key,
                    stock: stock,
                    }
                // console.log('requestID -->', requestID)
                requestList.push(finnHub(throttle, apiString, requestID))
            }
        }
            // console.log("requestList:", requestList)
            Promise.all(requestList)
            .then((response) => {
                for (const Obj in response){
                    const id = response[Obj].key
                    const stock = response[Obj].stock
                    const data = response[Obj].data
                    // console.log(id, stock, data)
                    resObject[id].stockData[stock].data = data
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