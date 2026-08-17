// const dns = require("node:dns");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);

const {MongoClient} = require("mongodb")

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const port = process.env.PORT;
const app = express()
app.use(cors());
app.use(express.json());





const client = new MongoClient(process.env.MONGODB_URI);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");

    const db = client.db("StudyNook");
    const roomCollection = db.collection("rooms");


    app.get("/", async (req, res) => {
      const result = await roomCollection
        .find()
        .sort({ _id: -1 })
        .limit(6)
        .toArray();

      res.send(result);
    });
    app.get("/rooms", async(req,res) => {
      const result = await roomCollection.find().toArray();
      res.send(result)
    })

    app.post('/add-room', async(req, res) => {
      const addedRoomData =  req.body;
      const result = await roomCollection.insertOne(addedRoomData)
      res.send(result)
    })

    return client;
  } catch (err) {
    console.dir(err);
  }
}

// Call this only when your application terminates
// export async function disconnectFromMongoDB() {
//   await client.close();
// }



connectToMongoDB(); 
// app.get('/', (req, res) => {
//   res.send('StudyNook Server is running...!')
// })

app.listen(port, () => {
  console.log(`app listening on port ${port}`)
})