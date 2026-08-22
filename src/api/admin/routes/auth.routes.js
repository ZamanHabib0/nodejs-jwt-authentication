const express = require("express");
const controller = require("../controllers/auth.controller.js");
const passport = require("../../../config/google.auth.js");

const router = express.Router();

router.post("/signUp", controller.signUp);
router.post("/signIn", controller.signIn);
router.post("/resetPassword", controller.resetPassword);

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
      req.body = req.user;
      await controller.googleLogin(req, res);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

module.exports = router;