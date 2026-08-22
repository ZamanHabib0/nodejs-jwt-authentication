const express = require("express");
const controller = require("../controllers/contact.controller.js");
const { authenticate } = require("../../../middleware/auth.middleware.js");

const router = express.Router();

// Contact Routes
// Public: POST / (submit inquiry)
// Protected: GET / (view all inquiries)
router.route("/")
  .post(controller.createContact)
  .get(authenticate, controller.getAllContacts);

// Protected: GET /:id (view single inquiry), PUT /:id (update status), DELETE /:id (delete inquiry)
router.route("/:id")
  .get(authenticate, controller.getContactById)
  .put(authenticate, controller.updateContact)
  .delete(authenticate, controller.deleteContact);

module.exports = router;
