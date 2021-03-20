import MongoClient from 'mongodb'

const uri = 'mongodb://localhost:27017';
// Create a new MongoClient
const client = new MongoClient(uri);

export default client

