const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');
const compression = require('compression');
const session = require('express-session');
const passport = require('passport');
const adminRoutes = require('../api/admin/routes/index.js');
const globalServices = require('../services/globalService.js');

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
  origin: '*',
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

// Server Root & Health Check Test Routes
app.get(['/', '/health'], (req, res) => {
  return globalServices.returnResponse(
    res,
    200,
    false,
    'Server is running smoothly! 🚀',
    {
      name: 'Node.js JWT Authentication, Blog & Contact API',
      status: 'online',
      timestamp: new Date().toISOString(),
      uptime: `${process.uptime().toFixed(2)}s`,
      routes: {
        auth: '/admin/auth',
        blogs: '/admin/blogs',
        contacts: '/admin/contacts'
      }
    }
  );
});

// Admin Routes
app.use("/admin", adminRoutes);

// Export the Express app for use in other files (e.g., index.js)
module.exports = app;
