const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');
const compression = require('compression');
const session = require('express-session');
const passport = require('passport');
const adminRoutes = require('../api/admin/routes/index.js'); // Adjust route path if needed

/**
 * Express instance
 * @public
 */
const app = express();

// Set up the view engine (optional, if you're using EJS)
app.set('view engine', 'ejs');

// Apply Compression Middleware (should be applied early)
app.use(compression());

// Body parser for parsing JSON and URL-encoded bodies
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Set up method override (for supporting PUT/DELETE HTTP verbs)
app.use(methodOverride());

// Set up CORS
var corsOptions = {
  origin: '*', // Replace '*' with specific origins if necessary for security
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(
  session({
    secret: "TOPSECREAT",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/admin", adminRoutes); 

// Default route (root path)
app.get('/', (req, res, next) => {
  res.send("Server is running");
});

// Export the Express app for use in other files (e.g., index.js)
module.exports = app;
