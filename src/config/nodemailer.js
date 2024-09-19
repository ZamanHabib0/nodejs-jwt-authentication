const nodemailer = require('nodemailer')
const { nodemailEmail ,nodemailPassword } = require("./var")

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: nodemailEmail,
      pass: nodemailPassword
    }
  });

module.exports = transporter