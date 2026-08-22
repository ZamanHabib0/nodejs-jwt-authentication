const models = require("../models/index.models.js");
const globalServices = require("../../../services/globalService.js");
const cloudinary = require("../../../config/cloudinary.js");
const multer = require("multer");
const mongoose = require("mongoose");

const storage = multer.diskStorage({});
const upload = multer({ storage }).single("image");

// Helper to format tags
const parseTags = (tags) => {
  if (Array.isArray(tags)) return tags;
  if (typeof tags === "string") {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return tags.split(",").map((t) => t.trim()).filter(Boolean);
    }
  }
  return [];
};

// Create a new Blog post
const createBlog = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return globalServices.returnResponse(
        res,
        400,
        true,
        "Error uploading image",
        { error: err.message }
      );
    }

    try {
      const { title, content, shortDescription, category, tags, author, status, slug } = req.body;

      if (!title || !content) {
        return globalServices.returnResponse(
          res,
          400,
          true,
          "Title and content are required",
          {}
        );
      }

      let imageUrl = req.body.image || "";
      if (req.file) {
        try {
          const uploadResult = await cloudinary.uploader.upload(req.file.path);
          imageUrl = uploadResult.secure_url;
        } catch (uploadErr) {
          console.warn("Cloudinary upload failed for blog image:", uploadErr.message);
          imageUrl = req.file.path || "";
        }
      }

      const blogData = {
        title,
        content,
        shortDescription: shortDescription || "",
        category: category || "General",
        tags: parseTags(tags),
        author: author || (req.user ? req.user.userName : "Admin"),
        authorId: req.user ? req.user._id : undefined,
        status: status || "published",
        image: imageUrl,
      };

      if (slug) {
        blogData.slug = slug;
      }

      const newBlog = new models.blogModel(blogData);
      const savedBlog = await newBlog.save();

      return globalServices.returnResponse(
        res,
        201,
        false,
        "Blog post created successfully",
        savedBlog
      );
    } catch (error) {
      console.error("Create blog error:", error);
      return globalServices.returnResponse(
        res,
        500,
        true,
        "Failed to create blog post",
        { error: error.message }
      );
    }
  });
};

// Get all blogs with pagination, filtering, and search
const getAllBlogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      status,
      tag,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    // Filter by category
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }

    // Filter by tag
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Search keyword in title, content, category, or tags
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * pageSize;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const [blogs, total] = await Promise.all([
      models.blogModel.find(query).sort(sort).skip(skip).limit(pageSize),
      models.blogModel.countDocuments(query),
    ]);

    return globalServices.returnResponse(
      res,
      200,
      false,
      "Blogs fetched successfully",
      {
        blogs,
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      }
    );
  } catch (error) {
    console.error("Get blogs error:", error);
    return globalServices.returnResponse(
      res,
      500,
      true,
      "Failed to fetch blogs",
      { error: error.message }
    );
  }
};

// Get single blog by ID or slug
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    let blog;
    if (mongoose.Types.ObjectId.isValid(id)) {
      blog = await models.blogModel.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      );
    }

    if (!blog) {
      blog = await models.blogModel.findOneAndUpdate(
        { slug: id },
        { $inc: { views: 1 } },
        { new: true }
      );
    }

    if (!blog) {
      return globalServices.returnResponse(
        res,
        404,
        true,
        "Blog post not found",
        {}
      );
    }

    return globalServices.returnResponse(
      res,
      200,
      false,
      "Blog fetched successfully",
      blog
    );
  } catch (error) {
    console.error("Get blog by ID error:", error);
    return globalServices.returnResponse(
      res,
      500,
      true,
      "Failed to fetch blog",
      { error: error.message }
    );
  }
};

// Update blog post
const updateBlog = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return globalServices.returnResponse(
        res,
        400,
        true,
        "Error uploading image",
        { error: err.message }
      );
    }

    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      if (req.file) {
        try {
          const uploadResult = await cloudinary.uploader.upload(req.file.path);
          updateData.image = uploadResult.secure_url;
        } catch (uploadErr) {
          console.warn("Cloudinary upload failed on update:", uploadErr.message);
          updateData.image = req.file.path || "";
        }
      }

      if (updateData.tags) {
        updateData.tags = parseTags(updateData.tags);
      }

      let blog;
      if (mongoose.Types.ObjectId.isValid(id)) {
        blog = await models.blogModel.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        });
      }

      if (!blog) {
        blog = await models.blogModel.findOneAndUpdate(
          { slug: id },
          updateData,
          { new: true, runValidators: true }
        );
      }

      if (!blog) {
        return globalServices.returnResponse(
          res,
          404,
          true,
          "Blog post not found",
          {}
        );
      }

      return globalServices.returnResponse(
        res,
        200,
        false,
        "Blog updated successfully",
        blog
      );
    } catch (error) {
      console.error("Update blog error:", error);
      return globalServices.returnResponse(
        res,
        500,
        true,
        "Failed to update blog post",
        { error: error.message }
      );
    }
  });
};

// Delete blog post
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    let blog;
    if (mongoose.Types.ObjectId.isValid(id)) {
      blog = await models.blogModel.findByIdAndDelete(id);
    }

    if (!blog) {
      blog = await models.blogModel.findOneAndDelete({ slug: id });
    }

    if (!blog) {
      return globalServices.returnResponse(
        res,
        404,
        true,
        "Blog post not found",
        {}
      );
    }

    return globalServices.returnResponse(
      res,
      200,
      false,
      "Blog post deleted successfully",
      { id: blog._id, title: blog.title }
    );
  } catch (error) {
    console.error("Delete blog error:", error);
    return globalServices.returnResponse(
      res,
      500,
      true,
      "Failed to delete blog post",
      { error: error.message }
    );
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
