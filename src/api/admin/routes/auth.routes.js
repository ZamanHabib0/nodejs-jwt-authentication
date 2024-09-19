const express = require("express")
const controller = require("../controllers/auth.controller.js")
const router = express.Router()


// const { profileUpload} = require('../../../services/upload')


router.route("/signIn").post(controller.signIn);

router.route("/signUp").post(controller.signUp);

router.route("/resetPassword").post(controller.resetPassword);

router.route("/verifyOtp").post(controller.verifyOtp);

router.route("/sendOtp").post(controller.resendOtp);












module.exports = router