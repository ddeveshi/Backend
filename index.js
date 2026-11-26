const express = require("express");

const app = express();
app.use(express.json());

const cors = require("cors");
app.use(cors());

const port = 3000;

// Logger middleware
const morgan = require("morgan");
app.use(morgan("dev"));

// --------------------Database Connection-------------------
require("dotenv").config({ path: "./config.env" });
const { MongoClient } = require("mongodb");
const uri =
  process.env.MONGODB_PREFIX +
  process.env.MONGODB_USERNAME +
  ":" +
  process.env.MONGODB_PASSWORD +
  process.env.MONGODB_URL;
const client = new MongoClient(uri);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}
connectToMongoDB();

const db = client.db("CST3144_CW");

app.get("/collections/lessons", async (req, res) => {
  try {
    const lessonsCollection = db.collection("Lessons");
    const lessons = await lessonsCollection.find({}).toArray();
    res.json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving lessons from the database.");
  }
});

app.post("/collections/orders", async (req, res) => {
  const { name, phone, lessonIDs, spaces } = req.body || {};
  const validItems =
    Array.isArray(lessonIDs) &&
    Array.isArray(spaces) &&
    lessonIDs.length > 0 &&
    lessonIDs.length === spaces.length &&
    lessonIDs.every((id) => Number.isInteger(id) && id > 0) &&
    spaces.every((quantity) => Number.isInteger(quantity) && quantity > 0);

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof phone !== "string" ||
    !phone.trim() ||
    !validItems
  ) {
    return res.status(400).json({ error: "Invalid order details." });
  }

  try {
    const ordersCollection = db.collection("Orders");
    const result = await ordersCollection.insertOne({
      name: name.trim(),
      phone: phone.trim(),
      lessonIDs,
      spaces,
    });
    res.status(201).json({ orderId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error saving the order." });
  }
});

// Linking Images
var path = require("path");
var publicPath = path.resolve(__dirname, "images");
app.use("/images", express.static(publicPath));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
