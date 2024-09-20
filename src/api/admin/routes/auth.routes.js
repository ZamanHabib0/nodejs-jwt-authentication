const express = require("express")
const controller = require("../controllers/auth.controller.js")
const router = express.Router()
const passport = require('../../../config/google.auth.js');



router.route("/signIn").post(controller.signIn);

router.route("/signUp").post(controller.signUp);

router.route("/resetPassword").post(controller.resetPassword);

router.route("/verifyOtp").post(controller.verifyOtp);

router.route("/sendOtp").post(controller.resendOtp);


router.get(
        "/google",
        passport.authenticate("google", {
          scope: ["profile", "email"],
        })
      );
      
      router.get(
        "/google/callback",
        passport.authenticate("google", {
          failureRedirect: "/error", 
        }),
        async (req, res) => {
        
          try {
            req.body = req.user
      
            // Call the signIn function from the controller
            await controller.googleLogin(req, res);
          } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error" });
          }
        }
      );
      


module.exports = router