const mongoose = require("mongoose")
const bcrypt = require('bcrypt');
const moment = require('moment');
const jwt = require('jsonwebtoken')

const { pwEncryptionKey , jwtExpirationInterval } = require('../../../config/var')



const UserSchema = new mongoose.Schema({

    userName : {
        type :  String,
        required : [true , "UserName is required"]
    },
    email : {
        type :  String,
        required : [true , "email is required"],
        unique : [true , "email must be unique"]
    },
    password : {
        type :  String,
        required : [true , "password is required"]
    },
    role : {
        type :  String,
        enum : ["admin" , "client"],
        required : [true , "role is required"]
    },
    profileImage : {
        type : String,
        default : ""
    },
    otp : {
      type : String,
      default :""
    },
    isVerified:{
      type : Boolean,
      default : false
    }
});

UserSchema.method({
  verifyPassword(password) {
    return bcrypt.compareSync(password, this.password);
  },

  token() {
    const playload = {
      exp: moment().add(jwtExpirationInterval, 'minutes').unix(),
      iat: moment().unix(),
      sub: this._id,
    };
    return jwt.sign(playload, pwEncryptionKey);
  },
});

UserSchema.pre('save', async function save(next) {
    try {
      const rounds = 10;
      if (this.password) {
        if (!this.isModified('password')) return next();
        const hash = await bcrypt.hash(this.password, rounds);
        this.password = hash;
      }
  
    await mongoose
        .model('User', UserSchema)
        .findOne()
        .limit(1)
        .sort({ createdAt: -1 });
  
      return next();
    } catch (error) {
      return next(error);
    }
  });

module.exports = mongoose.model('admin', UserSchema);
