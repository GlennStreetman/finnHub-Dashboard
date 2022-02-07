import MongoClient from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.mongo;
let _db = new MongoClient.MongoClient(uri);

const connectMongo = async (callback) => {
    try {
        MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
            _db = db;
            console.log("----Connected to MongoDB-----");
            return callback(err);
        });
    } catch (e) {
        console.log("1-------Failed to connect to MongoDB-------------", e);
        throw e;
    }
};

const getDB = () => _db;

const disconnectDB = () => _db.close();

export { connectMongo, getDB, disconnectDB };
