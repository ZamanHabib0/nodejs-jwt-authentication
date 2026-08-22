const models = require("../models/index.models.js");
const globalServices = require("../../../services/globalService.js");
const mongoose = require("mongoose");

// Create a new contact inquiry (Public submission)
const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return globalServices.returnResponse(
        res,
        400,
        true,
        "Name, email, and message are required",
        {}
      );
    }

    const contactData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone ? phone.trim() : "",
      subject: subject ? subject.trim() : "General Inquiry",
      message: message.trim(),
      status: "pending",
    };

    const newContact = new models.contactModel(contactData);
    const savedContact = await newContact.save();

    return globalServices.returnResponse(
      res,
      201,
      false,
      "Your message has been sent successfully. We will get back to you soon!",
      savedContact
    );
  } catch (error) {
    console.error("Create contact error:", error);
    return globalServices.returnResponse(
      res,
      500,
      true,
      "Failed to submit contact message",
      { error: error.message }
    );
  }
};

// Get all contact submissions with filtering, search, and pagination
const getAllContacts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [contacts, total] = await Promise.all([
      models.contactModel.find(query).sort(sort).skip(skip).limit(pageSize),
      models.contactModel.countDocuments(query),
    ]);

    return globalServices.returnResponse(
      res,
      200,
      false,
      "Contact messages fetched successfully",
      {
        contacts,
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      }
    );
  } catch (error) {
    console.error("Get contacts error:", error);
    return globalServices.returnResponse(
      res,
      500,
      true,
      "Failed to fetch contact messages",
      { error: error.message }
    );
  }
};

// Get single contact message by ID
const getContactById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return globalServices.returnResponse(
        res,
        400,
        true,
        "Invalid contact ID format",
        {}
      );
    }

    const contact = await models.contactModel.findById(id);

    if (!contact) {
      return globalServices.returnResponse(
        res,
        404,
        true,
        "Contact message not found",
        {}
      );
    }

    // Automatically mark as 'read' if it was pending
    if (contact.status === "pending") {
      contact.status = "read";
      await contact.save();
    }

    return globalServices.returnResponse(
      res,
      200,
      false,
      "Contact message fetched successfully",
      contact
    );
  } catch (error) {
    console.error("Get contact by ID error:", error);
    return globalServices.returnResponse(
      res,
      500,
      true,
      "Failed to fetch contact message",
      { error: error.message }
    );
  }
};

// Update contact inquiry (e.g. status, adminNotes)
const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, subject, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return globalServices.returnResponse(
        res,
        400,
        true,
        "Invalid contact ID format",
        {}
      );
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;
    if (subject) updateFields.subject = subject;
    if (message) updateFields.message = message;

    const contact = await models.contactModel.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return globalServices.returnResponse(
        res,
        404,
        true,
        "Contact message not found",
        {}
      );
    }

    return globalServices.returnResponse(
      res,
      200,
      false,
      "Contact message updated successfully",
      contact
    );
  } catch (error) {
    console.error("Update contact error:", error);
    return globalServices.returnResponse(
      res,
      500,
      true,
      "Failed to update contact message",
      { error: error.message }
    );
  }
};

// Delete contact inquiry
const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return globalServices.returnResponse(
        res,
        400,
        true,
        "Invalid contact ID format",
        {}
      );
    }

    const contact = await models.contactModel.findByIdAndDelete(id);

    if (!contact) {
      return globalServices.returnResponse(
        res,
        404,
        true,
        "Contact message not found",
        {}
      );
    }

    return globalServices.returnResponse(
      res,
      200,
      false,
      "Contact message deleted successfully",
      { id: contact._id, email: contact.email }
    );
  } catch (error) {
    console.error("Delete contact error:", error);
    return globalServices.returnResponse(
      res,
      500,
      true,
      "Failed to delete contact message",
      { error: error.message }
    );
  }
};

module.exports = {
  createContact,
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
};
