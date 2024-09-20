const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const { GOOGLECLIENTSECRET, GOOGLECLIENTID } = require("./var"); 
const models = require("../api/admin/models/index.models")

passport.use(
    "google",
    new GoogleStrategy(
      {
        clientID: GOOGLECLIENTID,
        clientSecret: GOOGLECLIENTSECRET,
        callbackURL: "http://localhost:8080/admin/auth/google/callback",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
            console.log("profile")
          console.log(profile);
          
          // Look for an existing user by email
          const existingUser = await models.authAdmin.findOne({ email: profile.emails[0].value });
          
          if (!existingUser) {
            // If no user exists, create a new one
            const newUser = new models.authAdmin({
                userName : profile.displayName,
              email: profile.emails[0].value,
              password: "google", // or leave it null if you're not using passwords for Google accounts
              googleId: profile.id, // Optionally store Google ID
              profileImage : profile.photos[0].value,
              role : "client",
              isVerified : true
            });
            
            const savedUser = await newUser.save();
            return cb(null, savedUser);
          } else {
            // User already exists, return the existing user
            return cb(null, existingUser);
          }
        } catch (err) {
          return cb(err);
        }
      }
    )
  );

  passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  
  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });
  

module.exports = passport;
