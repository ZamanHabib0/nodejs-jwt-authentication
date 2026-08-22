const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
    },
    shortDescription: {
      type: String,
      trim: true,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      type: String,
      default: "Admin",
      trim: true,
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "admin",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Function to generate slug
function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

BlogSchema.pre("save", async function (next) {
  try {
    if (!this.slug || this.isModified("title")) {
      let baseSlug = generateSlug(this.slug || this.title);
      let uniqueSlug = baseSlug;
      let counter = 1;

      // Ensure uniqueness
      while (
        await mongoose.models.Blog?.findOne({
          slug: uniqueSlug,
          _id: { $ne: this._id },
        })
      ) {
        uniqueSlug = `${baseSlug}-${counter}`;
        counter++;
      }
      this.slug = uniqueSlug;
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Blog", BlogSchema);
