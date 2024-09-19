const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');
const compression = require('compression');
const adminRoutes= require('../api/admin/routes/index.js');
// const multer = require('multer');



/**
* Express instance
* @public
*/
const app = express();


app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


// const storage = multer.diskStorage({});
// const upload = multer({ storage }).single('image');


app.use(methodOverride());

var corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

app.use("/admin" , adminRoutes)

// compress all responses
app.use(compression());



app.get('/', (req ,res,next)=>{
  res.send("here we are")
})

module.exports = app;