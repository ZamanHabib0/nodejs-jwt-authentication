const cloudinary = require('cloudinary').v2;
const {cloud_name, api_key ,api_secret} = require("./var")


cloudinary.config({
  cloud_name: cloud_name,
  api_key: api_key,
  api_secret: api_secret,
});

module.exports = cloudinary;
