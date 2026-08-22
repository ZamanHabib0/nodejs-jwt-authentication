const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const moment = require("moment");
const jwt = require("jsonwebtoken");

const { pwEncryptionKey, jwtExpirationInterval } = require("../../../config/var");

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "UserName is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    role: {
      type: String,
      enum: ["admin", "client"],
      default: "client",
    },
    profileImage: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

UserSchema.method({
  verifyPassword(password) {
    return bcrypt.compareSync(password, this.password);
  },

  token() {
    const payload = {
      exp: moment().add(jwtExpirationInterval || 1440, "minutes").unix(),
      iat: moment().unix(),
      sub: this._id,
      role: this.role,
    };
    return jwt.sign(payload, pwEncryptionKey);
  },
});

UserSchema.pre("save", async function save(next) {
  try {
    const rounds = 10;
    if (this.password && this.isModified("password")) {
      const hash = await bcrypt.hash(this.password, rounds);
      this.password = hash;
    }
    return next();
  } catch (error) {
    return next(error);
  }
});

module.exports = mongoose.model("admin", UserSchema);
