import MongoClient from 'mongodb'
import dotenv from 'dotenv';
dotenv.config()

const uri = process.env.mongo;
// const uri = 'mongodb://localhost:27017';
// Create a new MongoClient
let _db = new MongoClient.MongoClient(uri);

const connectMongo = async (callback) => {
    try {
        MongoClient.connect(uri, (err, db) => {
            _db = db
            console.log("Connected to MongoDB")
            return callback(err)
        })
    } catch (e) {
        console.log("Failed to connect to MongoDB")
        throw e
    }
}

const getDB = () => _db

const disconnectDB = () => _db.close()

export {connectMongo, getDB, disconnectDB}
