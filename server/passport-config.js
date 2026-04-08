import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/User.js";

const configurePassport = () => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    console.log("🔍 DEBUG: GOOGLE_CLIENT_ID =", googleClientId);
    console.log(
        "🔍 DEBUG: GOOGLE_CLIENT_SECRET =",
        googleClientSecret ? "SET" : "NOT SET"
    );

    if (
        googleClientId &&
        googleClientSecret &&
        googleClientId !== "your-google-client-id" &&
        googleClientSecret !== "your-google-client-secret" &&
        !googleClientSecret.includes("H1H1H1H1H1H1H1H1H1H1H1H1")
    ) {
        console.log("✅ Google OAuth credentials found, registering strategy");
        passport.use(
            new GoogleStrategy(
                {
                    clientID: googleClientId,
                    clientSecret: googleClientSecret,
                    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
                },
                async (accessToken, refreshToken, profile, done) => {
                    try {
                        // Check if user already exists with this Google ID
                        let user = await User.findOne({ googleId: profile.id });

                        if (user) {
                            return done(null, user);
                        }

                        // Check if user exists with same email
                        const email = profile.emails && profile.emails.length > 0
                            ? profile.emails[0].value
                            : null;

                        if (email) {
                            user = await User.findOne({ email });

                            if (user) {
                                // If user exists but doesn't have Google ID, link the accounts
                                user.googleId = profile.id;
                                user.authProvider = "google";
                                user.isVerified = true; // Google emails are pre-verified
                                await user.save();
                                return done(null, user);
                            }
                        }

                        // Create new user
                        const uid = `google-user-${profile.id}`;
                        user = new User({
                            uid,
                            fullName: profile.displayName || "Google User",
                            email: email || `${profile.id}@google.placeholder`,
                            googleId: profile.id,
                            authProvider: "google",
                            isVerified: true, // Google emails are pre-verified
                            profileImage: (profile.photos && profile.photos.length > 0) ? profile.photos[0].value : "",
                            cart: [],
                        });

                        await user.save();
                        return done(null, user);
                    } catch (error) {
                        return done(error, null);
                    }
                }
            )
        );
    } else {
        console.warn(
          "⚠️  Google OAuth credentials not configured properly. Google authentication will not be available."
        );
    }

    passport.serializeUser((user, done) => {
        // Use uid as a consistent identifier across the app
        done(null, user.uid);
    });

    passport.deserializeUser(async (uid, done) => {
        try {
            const user = await User.findOne({ uid });
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });

};

export default configurePassport;