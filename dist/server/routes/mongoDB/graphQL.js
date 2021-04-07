// import express from 'express';
// import eg from 'express-graphql'
import g from 'graphql';
import format from 'pg-format';
// import {getDB} from '../../db/mongoLocal.js'
import dbLive from "../../db/databaseLive.js";
import devDB from "../../db/databaseLocalPG.js";
// const router =  express.Router();
const db = process.env.live === "1" ? dbLive : devDB;
// const postgres = db
// const mongo = getDB
const RootQueryType = new g.GraphQLObjectType({
    name: 'finnDash',
    description: 'Root Query',
    fields: () => ({
        apiKey: {
            type: g.GraphQLList(Dashboards),
            resolve: function (args) {
                return new Promise((res, rej) => {
                    const apiKey = format('%L', args.apiKey);
                    const getUserQuery = `
                    SELECT dashboardname 
                    FROM dashboard 
                    WHERE userID = (SELECT id FROM users WHERE apiKey = '${apiKey}')`;
                    console.log('getUserQuery', getUserQuery);
                    db.query(getUserQuery, (err, rows) => {
                        if (err) {
                            console.log(err);
                            res(`Problem retrieving dashboards: ${err}`);
                        }
                        else {
                            res(rows.rows);
                        }
                    });
                });
            }
        }
    })
});
const Dashboards = new g.GraphQLObjectType({
    name: 'Dashboard',
    description: 'User Dashboard',
    fields: () => ({
        dashboardname: { type: g.GraphQLString }
    })
});
export const schema = new g.GraphQLSchema({
    query: RootQueryType
});
//# sourceMappingURL=graphQL.js.map