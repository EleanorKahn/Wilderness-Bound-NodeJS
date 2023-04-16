const cors = require("cors");

const whitelist = ["http://localhost:3000", "https://localhost:3443"];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header("Origin"));
    //checks whether or not the origin property of req.header is in our whitelist
    if (whitelist.indexOf(req.header("Origin")) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

//call cors() from import, which will return a midware function configured to set a cors header of access control allow origin on our response object with a wildcard
exports.cors = cors();
//will return midware function, checking to see if the request is coming from one of the whitelisted origins, and if so, will send back cors response header of access control allow origin with whitelisted origin as value;
exports.corsWithOptions = cors(corsOptionsDelegate);