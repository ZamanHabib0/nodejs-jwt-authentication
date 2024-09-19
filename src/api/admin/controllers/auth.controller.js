const models = require("../models/index.models.js")
const globalServices = require('../../../services/globalService.js');
const cloudinary = require('../../../config/cloudinary.js')
const multer = require('multer');
const sendEmail = require("../../../middleware/email.controller.js")
const storage = multer.diskStorage({});
const upload = multer({ storage }).single('image');
const randomstring = require('randomstring');



const signIn = async (req, res, next) => {
    try {
        let payload = req.body;

        if (!payload.email || !payload.password) {
            return globalServices.returnResponse(
                res,
                400,
                true,
                'Email and password are required',
                {}
            );
        }
        let email = payload.email;
        let user = await models.authAdmin.findOne({ email });

        if (!user) {
            return globalServices.returnResponse(
                res,
                401,
                false,
                'User not found',
                {}
            );
        }

        if (user.verifyPassword(payload.password)) {
            let accessToken = user.token();

            let data = {
                _id: user._id,
                userName: user.userName,
                email: user.email,
                authToken: accessToken
            }

            return globalServices.returnResponse(
                res,
                200,
                false,
                'You have logged in successfully',
                data
            );
        } else {
            return globalServices.returnResponse(
                res,
                401,
                false,
                'Incorrect Password',
                {}
            );
        }



    } catch (error) {
        return globalServices.returnResponse(
            res,
            500,
            true,
            'Internal server error',
            {}
        );
    }
}

const signUp = async (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return globalServices.returnResponse(
                res,
                500,
                true,
                'An error occurred while uploading the image',
                { error: err.message }
            );
        }
        try {
            let payload = req.body;
            const image = req.file;

            if (!image) {
                return globalServices.returnResponse(
                    res,
                    400,
                    true,
                    'No image file provided',
                    {}
                );
            }


            if (!payload.email || !payload.password || !payload.userName) {
                return globalServices.returnResponse(
                    res,
                    400,
                    false,
                    'Essential fields (email, password, username) are missing',
                    {}
                );
            }
            const userEmail = payload.email;



            const userExist = await models.authAdmin.findOne({ email: userEmail });

            if (userExist) {
                return globalServices.returnResponse(
                    res,
                    200,
                    true,
                    'User already exists',
                    {}
                );
            }



            const uploadResult = await cloudinary.uploader.upload(image.path);

            payload.profileImage = uploadResult.secure_url;

            let otp = randomstring.generate({ length: 4, charset: 'numeric' });

            payload.otp = otp
            const newUser = new models.authAdmin(payload);
            let result = await newUser.save();

            sendEmail(payload.email, "Account Creation Email",
                `
    <h3>Hello ${payload.userName},</h3>
    <p>Thank you for creating an account with us!</p>
    <p>Your OTP code for verifying your account is:</p>
    <h2 style="color: #2d89e5;">${otp}</h2>
    <p>Please enter this code on the verification page to complete your registration.</p>
    <br />
    <p>If you did not request this, please ignore this email.</p>
    <br />
    <p>Regards,<br />Syncrozone</p>
  `
            )

            const { password, ...userWithoutPassword } = result._doc;

            return globalServices.returnResponse(
                res,
                200,
                false,
                'User created successfully',
                userWithoutPassword
            );
        } catch (error) {
            console.error(error);
            return globalServices.returnResponse(
                res,
                500,
                true,
                'internal server error',
                error
            );
        }
    })
}

const resetPassword = async (req, res, next) => {
    let { newPassword, email } = req.body;

    try {
        // Check for required fields
        if (!email || !email) {
            return globalServices.returnResponse(
                res,
                400,
                true,
                'email and New password are required',
                {}
            );
        }

        // Find the user by phone number
        const user = await model.authAdmin.findOne({ email });

        if (!user) {
            return globalServices.returnResponse(
                res,
                404,
                true,
                'User not found',
                {}
            );
        }

        // Update the user's password
        user.password = newPassword; // Ensure you have a pre-save hook to hash the password
        await user.save();

        return globalServices.returnResponse(
            res,
            200,
            false,
            'Your password has been changed successfully!',
            {}
        );
    } catch (error) {
        return globalServices.returnResponse(
            res,
            500,
            true,
            'Internal server error',
            { error: error.message }
        );
    }
};

const verifyOtp = async (req, res, next) => {
    try {
        const { otp } = req.body;

        const user = await model.authAdmin.findOne({ otp: otp });

        if (otp) {
            if (otp == user?.otp) {
                const updateOtp = await model.authAdmin.findOneAndUpdate(
                    { otp: otp },
                    { $set: { otp: '', isVerified: true } },
                    { new: true }
                )

                var accessToken = await updateOtp.token();
                let data = {
                    authToken: accessToken,
                    userId: updateOtp._id,
                    username: updateOtp.userName,
                    email: updateOtp.email,
                    role: updateOtp.role,
                    isVerified: updateOtp.isVerified,
                    profileImage: updateOtp.profileImage,
                };

                return globalServices.returnResponse(
                    res,
                    200,
                    false,
                    'OTP successfully matched',
                    data
                );
                // return res.json({ success: true, data , message: 'OTP successfully matched' });
            } else {
                return globalServices.returnResponse(
                    res,
                    401,
                    true,
                    'OTP not matched',
                    {}
                );
                // return res.json({ success: false, message: 'OTP not matched' });
            }
        } else {
            return globalServices.returnResponse(
                res,
                200,
                false,
                'OTP is required',
                {}
            );
            // return res.json({ success: false, message: 'OTP not validate' });
        }
    } catch (error) {
        res.status(500).json(error);
    }
};

const resendOtp = async (req, res) => {
    // try {
        const { email } = req.body;
        const otp = randomstring.generate({ length: 4, charset: 'numeric' });
        // const otp = '1234';
        const user = await model.authAdmin.findOneAndUpdate(
            { email: email },
            { $set: { otp: otp, verified: false } }
        );

        if (!user) {
            return globalServices.returnResponse(
                res,
                401,
                false,
                'User not Found',
                {}
            );
            // return res.json({ success: false, message: 'User not Found' });
        }
        sendEmail(email, "Password Reset Email",
            `
<h3>Hello ${user.userName},</h3>
<p>Thank you for creating an account with us!</p>
<p>Your OTP code for verifying your account is:</p>
<h2 style="color: #2d89e5;">${otp}</h2>
<p>Please enter this code on the verification page to complete your registration.</p>
<br />
<p>If you did not request this, please ignore this email.</p>
<br />
<p>Regards,<br />Syncrozone</p>
`
        )

        return globalServices.returnResponse(
            res,
            200,
            false,
            'OTP send sucessfully',
            {}
        );
        // return res.json({ success: true, message: 'OTP send sucessfully' });
    // } catch (error) {
    //     res.status(500).json(error);
    // }
};






module.exports = {
    signIn,
    signUp,
    resetPassword,
    verifyOtp,
    resendOtp
}