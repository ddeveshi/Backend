const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
app.use(cors());

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Linking list of tuitions
let myLesson = require("./list/lessons.js");
console.log(myLesson);

app.get("/collections/lessons", (req, res) => {
  res.json(myLesson);
});

// Linking Images
var path = require("path");
var publicPath = path.resolve(__dirname, "images");
app.use("/images", express.static(publicPath));
