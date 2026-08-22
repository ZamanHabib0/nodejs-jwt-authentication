const express = require("express");
const controller = require("../controllers/contact.controller.js");

const router = express.Router();

// Contact Routes
router.route("/")
  .post(controller.createContact)
  .get(controller.getAllContacts);

router.route("/:id")
  .get(controller.getContactById)
  .put(controller.updateContact)
  .delete(controller.deleteContact);

module.exports = router;
