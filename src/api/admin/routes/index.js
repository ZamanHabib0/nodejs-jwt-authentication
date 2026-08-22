const express = require("express");
const authRoutes = require("./auth.routes.js");
const blogRoutes = require("./blog.routes.js");
const contactRoutes = require("./contact.routes.js");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/blogs", blogRoutes);
router.use("/blog", blogRoutes); // Convenient alias
router.use("/contacts", contactRoutes);
router.use("/contact", contactRoutes); // Convenient alias

module.exports = router;