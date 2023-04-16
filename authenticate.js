const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const jwt = require("jsonwebtoken"); // used to create, sign, and verify tokens (make sure to follow up with version vulnerabilities!)
const FacebookTokenStrategy = require("passport-facebook-token");

const config = require("./config.js");

exports.facebookPassport = passport.use(
    new FacebookTokenStrategy(
        {
            clientID: config.facebook.clientId,
            clientSecre: config.facebook.clientSecret
        },
        (accessToken, refreshToken, profile, done) => {
            User.findOne({facebookId: profile.id}, (err, user) => {
                if (err) {
                    return done(err, false);
                }
                if (!err && user) {
                    return done(null, user);
                } else {
                    user = new User({ username: profile.displayName });
                    user.facebookId = profile.id;
                    user.firstname = profile.name.givenName;
                    user.lastname = profile.name.familyName;
                    user.save((err, user) => {
                        if (err) {
                            return done(err, false);
                        } else {
                            return done(null, user);
                        }
                    });
                }
            });
        }
    )
);

//.use is how we add the specific strategy plugin that we want to use to our passport implementation
exports.local = passport.use(new LocalStrategy(User.authenticate()));
//serialization and deserialization work together to convert an object to and from a portable format, respectively (src Hazelcast)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = function(user) {
    //we're returning a token created by the sign method, and exists for an hour
    return jwt.sign(user, config.secretKey, {expiresIn: 3600});
};

//contfguring jwt strategy for passport 
//opts will contain the options for the jwt strategy
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();//specifies how the token should be extracted from the incoming request message. This is the simplest method for sending a jwt. See docs for other methods
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(
    new JwtStrategy(
        opts,
        //jwt_payload is an object literal containing decoded JWT payload
        //done is a passport error first callback accepting arguments done(error, user, info)
        (jwt_payload, done) => {
            console.log("JWT payload:", jwt_payload);
            User.findOne({_id: jwt_payload._id}, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else {
                    //could prompt to create a new user here
                    return done(null, false);
                }
            });
        }
    )
);

exports.verifyUser = passport.authenticate("jwt", {session: false});

exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        return next();
    } else {
        const err = new Error("You are not authorized to perform this operation!");
        err.status = 403;
        return next(err);
    }
};