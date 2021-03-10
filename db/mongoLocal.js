const MongoClient = require('mongodb').MongoClient;

const uri = 'mongodb://localhost:27017';
// Create a new MongoClient
const client = new MongoClient(uri);

module.exports = client

