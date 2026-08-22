// const dns = require("node:dns");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { MongoClient, ObjectId } = require("mongodb");

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const port = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");

    const db = client.db("StudyNook");
    const roomCollection = db.collection("rooms");
    const bookingCollection = db.collection("booking");

    app.get("/", async (req, res) => {
      const result = await roomCollection
        .find()
        .sort({ _id: -1 })
        .limit(6)
        .toArray();

      res.send(result);
    });

    // All rooms
    app.get("/rooms", async (req, res) => {
      const result = await roomCollection.find().toArray();
      res.send(result);
    });

    // single room
    app.get("/rooms/:id", async (req, res) => {
      const { id } = req.params;
      const result = await roomCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result)
    });

    // update room
    app.patch('/rooms/:id', async(req,res) => {
      const {id} = req.params;
      const updatedRoom = req.body;
      const result = await roomCollection.updateOne(
        {_id: new ObjectId(id)},
        { $set: updatedRoom},
      );
      res.send(result);
    })

    // Delete Room 
    app.delete('/rooms/:id', async(req, res) => {
      const {id} = req.params;
      const result = await roomCollection.deleteOne({
        _id: new ObjectId(id)
      })
      res.send(result);
    })

    // POST add my-bookings
    app.post("/bookings", async(req, res) => {
      const bookingData = req.body;
      const {roomId, date, startHour, endHour} = bookingData
      const conflict = await bookingCollection.findOne({
        roomId: roomId,
        date: date,
        startHour: { $lt: endHour },
        endHour: { $gt: startHour },
      });

      if (conflict) {
        return res.status(409).send({
          message: "This room is already booked for the selected date and time.",
        });
      }

      const result = await bookingCollection.insertOne(bookingData);
      await roomCollection.updateOne(
        { _id: new ObjectId(bookingData.roomId) },
        { $inc: { bookingCount: 1 } }
      );
      res.send(result)
    })

    
    // Add room
    app.post("/add-room", async (req, res) => {
      const addedRoomData = req.body; 
      const result = await roomCollection.insertOne(addedRoomData);
      res.send(result);
    });

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
  console.log(`app listening on port ${port}`);
});
