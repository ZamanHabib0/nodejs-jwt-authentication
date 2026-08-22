const app = require("./config/express.js");
const mongoose = require("./config/mongoose.js");
const { port } = require("./config/var.js");

// Connect to MongoDB
mongoose.connect();

// Start Server
app.listen(port || 8080, () => {
  console.log(`🚀 Server listening at http://localhost:${port || 8080}`);
});