const models = require("../models/index.models.js");
const globalServices = require("../../../services/globalService.js");
const cloudinary = require("../../../config/cloudinary.js");
const multer = require("multer");

const storage = multer.diskStorage({});
const upload = multer({ storage }).single("image");

const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return globalServices.returnResponse(
        res,
        400,
        true,
        "Email and password are required",
        {}
      );
    }

    const user = await models.authAdmin.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return globalServices.returnResponse(
        res,
        404,
        true,
        "User not found",
        {}
      );
    }

    if (user.verifyPassword(password)) {
      const accessToken = user.token();

      const data = {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
        authToken: accessToken,
      };

      return globalServices.returnResponse(
        res,
        200,
        false,
        "Logged in successfully",
        data
      );
    } else {
      return globalServices.returnResponse(
        res,
        401,
        true,
        "Incorrect Password",
        {}
      );
    }
  } catch (error) {
    console.error("Sign in error:", error);
    return globalServices.returnResponse(
      res,
      500,
      true,
      "Internal server error",
      { error: error.message }
    );
  }
};

const signUp = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return globalServices.returnResponse(
        res,
        400,
        true,
        "An error occurred while uploading the image",
        { error: err.message }
      );
    }

    try {
      const payload = req.body;
      const image = req.file;

      if (!payload.email || !payload.password || !payload.userName) {
        return globalServices.returnResponse(
          res,
          400,
          true,
          "Essential fields (email, password, userName) are missing",
          {}
        );
      }

      const userEmail = payload.email.toLowerCase().trim();
      const userExist = await models.authAdmin.findOne({ email: userEmail });

      if (userExist) {
        return globalServices.returnResponse(
          res,
          409,
          true,
          "User with this email already exists",
          {}
        );
      }

      payload.email = userEmail;
      payload.isVerified = true;

      // Handle profile image upload if provided
      if (image) {
        try {
          const uploadResult = await cloudinary.uploader.upload(image.path);
          payload.profileImage = uploadResult.secure_url;
        } catch (uploadErr) {
          console.warn("Cloudinary upload failed, continuing without cloud image:", uploadErr.message);
          payload.profileImage = image.path || "";
        }
      }

      const newUser = new models.authAdmin(payload);
      const result = await newUser.save();

      const accessToken = result.token();
      const { password, ...userWithoutPassword } = result.toObject();

      return globalServices.returnResponse(
        res,
        201,
        false,
        "User registered successfully",
        {
          ...userWithoutPassword,
          authToken: accessToken,
        }
      );
    } catch (error) {
      console.error("Sign up error:", error);
      return globalServices.returnResponse(
        res,
        500,
        true,
        "Internal server error",
        { error: error.message }
      );
    }
  });
};

const resetPassword = async (req, res, next) => {
  const { email, newPassword } = req.body;

  try {
    if (!email || !newPassword) {
      return globalServices.returnResponse(
        res,
        400,
        true,
        "Email and newPassword are required",
        {}
      );
    }

    const user = await models.authAdmin.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return globalServices.returnResponse(
        res,
        404,
        true,
        "User not found",
        {}
      );
    }

    user.password = newPassword;
    await user.save();

    return globalServices.returnResponse(
      res,
      200,
      false,
      "Password has been changed successfully!",
      {}
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return globalServices.returnResponse(
      res,
      500,
      true,
      "Internal server error",
      { error: error.message }
    );
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const payload = req.body;
    const email = payload.email?.toLowerCase().trim();
    let user = await models.authAdmin.findOne({ email });

    if (!user) {
      // Auto-create user if not found
      user = new models.authAdmin({
        userName: payload.displayName || payload.name || "Google User",
        email: email,
        password: Math.random().toString(36).slice(-8) + "Aa1!",
        profileImage: payload.picture || payload.photos?.[0]?.value || "",
        isVerified: true,
      });
      await user.save();
    }

    const accessToken = user.token();
    const data = {
      _id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      isVerified: user.isVerified,
      authToken: accessToken,
    };

    return globalServices.returnResponse(
      res,
      200,
      false,
      "Logged in successfully with Google",
      data
    );
  } catch (error) {
    console.error("Google login error:", error);
    return globalServices.returnResponse(
      res,
      500,
      true,
      "Internal server error",
      { error: error.message }
    );
  }
};

module.exports = {
  signIn,
  signUp,
  resetPassword,
  googleLogin,
};