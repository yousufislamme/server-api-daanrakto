const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;
const uri = process.env.MONGO_URI || `mongodb+srv://${process.env.MONGO_NAME}:${process.env.MONGO_PASSWORD}@bloodapi.u5bta.mongodb.net/?retryWrites=true&w=majority&appName=${process.env.MONGO_APP_NAME}`;

app.use(cors());
app.use(express.json());

let bloodDataCollection; // Declare bloodDataCollection

const client = new MongoClient(uri, {
   serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
   }
});

async function run() {
   try {
      await client.connect();
      const database = client.db("bloodDB");
      bloodDataCollection = database.collection("BloodData");
      console.log("Connected to MongoDB!");
   } catch (error) {
      console.error("MongoDB connection error:", error);
   }
}

run().catch(console.dir);

// Routes
app.get("/", (req, res) => {
   res.send("Server is running");
});

app.get("/blood_api", async (req, res) => {
   try {
      const bloodFind = bloodDataCollection.find();
      const result = await bloodFind.toArray();
      res.send(result);
   } catch (error) {
      res.status(500).send({ message: "Error fetching blood data", error });
   }
});

// Get blood by ID
app.get("/blood_api/:id", async (req, res) => {
   const id = req.params.id;
   try {
      const query = { _id: new ObjectId(id) }; // Ensure valid ObjectId
      const result = await bloodDataCollection.findOne(query);
      if (result) {
         res.send(result);
      } else {
         res.status(404).send({ message: "Blood data not found" });
      }
   } catch (error) {
      res.status(500).send({ message: "Error fetching blood data by ID", error });
   }
});

// Add new blood data
app.post("/blood_api", async (req, res) => {
   const bloodAPI = req.body;
   try {
      const result = await bloodDataCollection.insertOne(bloodAPI);
      res.send(result);
   } catch (error) {
      res.status(500).send({ message: "Error inserting blood data", error });
   }
});

// Start server
app.listen(port, () => {
   console.log(`Server running on http://localhost:${port}`);
});

// Close MongoDB connection when app terminates
process.on('SIGINT', async () => {
   await client.close();
   console.log('MongoDB client closed');
   process.exit(0);
});
