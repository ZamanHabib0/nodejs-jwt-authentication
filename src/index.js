const app = require("./config/express.js");
const mongoose = require("./config/mongoose.js");
const { port } = require("./config/var.js");

// Connect to MongoDB
mongoose.connect();

const PORT = process.env.PORT || port || 8080;

// Start Server on 0.0.0.0 for Cloud Deployment (Railway, Render, Heroku)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is live on port ${PORT}`);
});