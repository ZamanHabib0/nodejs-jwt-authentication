const express = require('express');
const app = require("./config/express.js");
const mongoose = require("./config/mongoose.js");

const { port } = require("./config/var.js")

mongoose.connect()

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});