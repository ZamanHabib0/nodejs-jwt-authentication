const express = require("express");
const controller = require("../controllers/blog.controller.js");
const { authenticate } = require("../../../middleware/auth.middleware.js");

const router = express.Router();

// Blog Routes
// Public: GET / (list blogs)
// Protected: POST / (create blog)
router.route("/")
  .post(authenticate, controller.createBlog)
  .get(controller.getAllBlogs);

// Public: GET /:id (read single blog)
// Protected: PUT /:id (update blog), DELETE /:id (delete blog)
router.route("/:id")
  .get(controller.getBlogById)
  .put(authenticate, controller.updateBlog)
  .delete(authenticate, controller.deleteBlog);

module.exports = router;
