require('dotenv').config()

module.exports = {
    port : process.env.PORT,
    mongo : {
        uri : process.env.MONGO_URI
    },
    env: process.env.NODE_ENV,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

    jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
    pwEncryptionKey: process.env.ENCRYPTION_KEY,

    nodemailEmail: process.env.email,
    nodemailPassword: process.env.password,
    



}