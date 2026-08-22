const mongoose = require('mongoose');
const { mongo, env } = require('./var.js');


mongoose.Promise = Promise;


mongoose.connection.on('error', (err) => {
  process.exit(-1);
});


if (env === 'development') {
  mongoose.set('debug', true);
}

/**
* Connect to mongo db
*
* @returns {object} Mongoose connection
* @public
*/
exports.connect = () => {
    try{
        mongoose.connect(mongo.uri, {
    
          } 
        );
        return mongoose.connection;
    }
    catch (error){
        console.log("error: ",error)
    }

};