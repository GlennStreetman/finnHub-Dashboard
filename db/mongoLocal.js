const MongoClient = require('mongodb').MongoClient;

const uri = 'mongodb://localhost:27017';
// Create a new MongoClient
const client = new MongoClient(uri);


async function run() {
    try {
      // Connect the client to the server
      await client.connect();
      // Establish and verify connection
      await client.db("dataSet").command({ ping: 1 });
      console.log("Connected successfully to server");
    } finally {
      // Ensures that the client will close when you finish/error
      return client
    //   await client.close();
    }
  }
  run().catch(console.dir);

module.exports = client