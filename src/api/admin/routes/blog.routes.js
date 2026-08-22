const express = require("express");
const controller = require("../controllers/blog.controller.js");

const router = express.Router();

// Blog Routes
router.route("/")
  .post(controller.createBlog)
  .get(controller.getAllBlogs);

router.route("/:id")
  .get(controller.getBlogById)
  .put(controller.updateBlog)
  .delete(controller.deleteBlog);

module.exports = router;
