const express = require('express');
const Favorite = require('../models/favorite');
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter.route("/")
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
//retrieve favorite document for the logged in user
//why would I chose find for get, but findOne for post?
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
    .populate("user")
    .populate("campsites")
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorite);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next)=> {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if (favorite) {
            favorite.forEach((campsite) => {
                if (!favorite.includes(campsite)) {
                    favorite.push(campsite);
                } else {
                    res.setHeader("Content-Type", "text/plain");
                    res.end(`This campsite is already included in your favorites.`);
                }
            });
        } else {
            Favorite.create({
                user: req.user._id,
                campsite: campsite
            });
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
            })
            .catch(err => next(err));
        }
    })
    .catch(err => next(err));
})

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT requests not supported on /favorites");
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if (favorite) {
            Favorite.findOneAndDelete({ user: req.user._id })
            .then(response => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(response);
            })
            .catch(err => next(err));
        } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.end(`You do not have any favorites to delete.`);
        }
    }).catch(err => next(err));
});

//for this endpoint, campsiteId not submitted as part of req.body, but as part of the URL parameter (req.params.campsiteId) -- that's very helpful to understand!
favoriteRouter.route("/campsiteId")
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("GET requests not supported on /favorites/campsiteId");
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne(req.params.campsiteId)
    .then(favorite => {
        if (favorite) {
            if (!favorite.includes(req.params.campsiteId)) {
                favorite.push(req.params.campsiteId);
            } else {
                //res.send or res.end here?
                res.end(`The campsite ${req.params.campsiteId} is already in your favorites`);
            }
        } else {
            Favorite.create({
                user: req.user._id,
                campsite: campsite
            })
            favorite.save()
            .then(favorite => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
            })
            .catch(err => next(err))
        }
    })
    .catch(err => next(err))
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT requests not supported on /favorites/campsiteId");
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
    .then(favorite => {
        if (favorite) {
            if (favorite.includes(req.params.campsiteId)) {
                favorite.campsites = favorite.campsites.filter((campsite) => !campsite.req.params.campsiteId);
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                })
                .catch(err => next(err))
            } else {
                res.setHeader("Content-Type", "text/plain");
                res.end(`${req.params.campsiteId} not found in Favorites.`);
            }
        } else {
            res.setHeader("Content-Type", "text/plain")
            res.end(`Favorites ${req.body.favorites} not found.`);

        }
    }).catch(err => next(err));
});

module.exports = favoriteRouter;