import express from "express";
import format from "pg-format";
import cors from 'cors';
import { widgetDict } from "./../src/registers/endPointsReg.js";
import { finnHub, createFunctionQueueObject } from "../src/appFunctions/throttleQueueAPI.js";
import dbLive from "../db/databaseLive.js";
import devDB from '../db/databaseLocalPG.js';
const db = process.env.live === "1" ? dbLive : devDB;
const router = express.Router();
router.use(function timeLog(req, res, next) {
    // console.log("Time: ", new Date());
    next();
});
router.get("/endPoint", cors(), (req, res, next) => {
    console.log("Generating new endpoint data");
    // const data = {}
    const apiKey = format('%L', req.query['apiKey']);
    const dashBoardName = format('%L', req.query['dashBoardName']);
    const returnDashBoardQuery = `
        SELECT d.globalstocklist, w.*
        FROM dashboard as d
        LEFT JOIN widgets as w ON d.id = w.dashboardkey
        WHERE dashboardname = ${dashBoardName} AND
            userID = (SELECT id FROM users WHERE apiKey = ${apiKey} limit 1)
    `;
    // console.log(returnDashBoardQuery)
    const getDashBoard = () => {
        return new Promise((resolve, reject) => {
            //returns dashboard object from DB.
            db.query(returnDashBoardQuery, (err, rows) => {
                if (err) {
                    res.json({ message: "Problem generating endpoint." });
                    console.log(err, "ERROR returnDashBoardQuery: ", returnDashBoardQuery);
                    reject(err);
                }
                else {
                    const data = rows.rows;
                    const stockList = JSON.parse(rows.rows[0].globalstocklist);
                    const resObj = { data: data, stockList: stockList };
                    // console.log(data)
                    resolve(resObj);
                }
            });
        });
    };
    const buildEndPoint = (dashboard) => {
        return new Promise((resolve, reject) => {
            //builds query strings for finnHub API calls.
            // console.log("building end point", dashboard)
            const resObject = {
                widget: {},
                security: {},
                streamingData: {},
            };
            //build socket list, US stocks only.
            for (const stock in dashboard.stockList) {
                if (dashboard.stockList[stock].exchange === 'US') {
                    const socket = {
                        type: 'subscirbe',
                        symbol: dashboard.stockList[stock].symbol
                    };
                    resObject.streamingData[dashboard.stockList[stock].symbol] = socket;
                }
            }
            for (const widget in dashboard.data) {
                // console.log('buildendpoint widget:', dashboard.data[widgetKey])
                const thisWidget = dashboard.data[widget];
                const widgetFunction = widgetDict[thisWidget.widgettype]; //function to create query string
                const thisTrackedStocks = JSON.parse(thisWidget.trackedstocks);
                const thisFilter = JSON.parse(thisWidget.filters);
                const queryStringList = widgetFunction(thisTrackedStocks, thisFilter, req.query['apiKey']);
                //Info for each widget
                const wid = resObject.widget[thisWidget.widgetHeader] ? thisWidget.widgetid : thisWidget.widgetheader;
                resObject.widget[wid] = {
                    name: thisWidget.widgetheader,
                    Endpoint: thisWidget.widgettype,
                    filters: thisFilter,
                    stockData: {},
                };
                for (const stock in queryStringList) {
                    resObject.widget[wid].stockData[stock] = {
                        'apiString': queryStringList[stock]
                    };
                    // console.log('QUERY LIST:',queryStringList)
                    //Info for each STOCK/security
                    if (resObject.security[stock] === undefined) {
                        resObject.security[stock] = {};
                    }
                    resObject.security[stock][wid] = {
                        apiString: queryStringList[stock],
                        EndPoint: thisWidget.widgettype,
                        filters: thisFilter,
                        stockData: {},
                    };
                }
            }
            // console.log(resObject)
            resolve(resObject);
        });
    };
    const requestQueryData = (resObject) => {
        return new Promise((resolve, reject) => {
            const throttle = createFunctionQueueObject(25, 1000, true);
            let requestList = [];
            //create list of promises to be pushed to Promise.all
            for (const key in resObject.widget) {
                for (const stock in resObject.widget[key].stockData) {
                    const apiString = resObject.widget[key].stockData[stock].apiString;
                    const requestID = {
                        key: key,
                        stock: stock,
                    };
                    // console.log('REQUEST -->', requestID, apiString)
                    requestList.push(finnHub(throttle, apiString, requestID));
                    // finnHub(throttle, apiString, requestID)
                }
            }
            console.log("----------starting endpoint promise chain---------");
            // console.log(throttle.queue)
            Promise.all(requestList)
                .then((response) => {
                console.log("--------------DONE generating endpoint-------------------");
                for (const Obj in response) {
                    const id = response[Obj].key;
                    const stock = response[Obj].stock;
                    const data = response[Obj].data;
                    resObject.widget[id].stockData[stock].data = data;
                    resObject.security[stock][id].stockData = data;
                }
                resolve(resObject);
            });
            //submit all apicalls and receive data. Bind data to dashboard object. Parse data in next step.
        });
    };
    getDashBoard()
        .then((data) => {
        console.log("1.BUILDING");
        return buildEndPoint(data);
    })
        .then((data) => {
        console.log("2.Data");
        return requestQueryData(data);
    })
        .then((data) => {
        console.log("3.endpoint request complete");
        res.json(data);
    })
        .catch((err => {
        console.log("Endpoint request error:", err);
    }));
});
export default router;
//# sourceMappingURL=endPoint.js.map