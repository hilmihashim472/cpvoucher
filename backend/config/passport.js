const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL || "http://localhost:5000"}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id: googleId, emails, displayName, photos, name } = profile;
        const email = emails?.[0]?.value;
        const profilePicture = photos?.[0]?.value || null;

        if (!email) {
          return done(new Error("Google account has no email associated"), null);
        }

        // Look up user by email — whether they signed up manually or via Google
        let user = await User.findOne({ email });

        if (user) {
          // User exists. If they don't have a googleId yet, update it.
          if (!user.googleId) {
            user.googleId = googleId;
            if (profilePicture) user.profile_picture = profilePicture;
            await user.save();
          }
          return done(null, user);
        }

        // User doesn't exist — create a new account
        const username = email.split("@")[0] + "_" + Math.random().toString(36).slice(2, 6);

        user = await User.create({
          email,
          username,
          fullName: displayName || name?.givenName || username,
          password: require("crypto").randomBytes(32).toString("hex"), // Random password — not usable for manual login
          googleId,
          profile_picture: profilePicture,
          is_active: true,
          points: 2500,
          role: "user",
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

module.exports = passport;