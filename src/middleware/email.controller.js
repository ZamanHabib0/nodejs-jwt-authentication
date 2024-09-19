const transporter = require('../config/nodemailer')



const sendEmail = (receiver,subject,msg) =>{

    var mailOptions = {
        from: 'Zaman Habib',
        to: receiver,
        subject: subject,
        html: msg
      };



    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

module.exports = sendEmail