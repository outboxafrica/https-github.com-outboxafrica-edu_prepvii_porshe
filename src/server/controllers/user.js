const User = require("../models/schemas/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


//import validation schema
const signInValidation = require("../helpers/schemas/users");

//controllers for users to signin 
exports.userSignup = (req  , res, next)=>{
    User.find({email: req.body.email })
    .exec()
    .then(user => {
        if (user.length >= 1) {
            return res.status(409).json({
                message: "Email exists already"
            });
        }else{
            bcrypt.hash(req.body.password, 10, (err, hash) =>{
                if (err) {
                    return res.status(500).json({
                        error: err
                    });
                }else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });
                    user
                    .save()
                    .then(result => {
                        res.status(201).json({
                            message: "User created",
                        });
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            });
     
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
};


//controller for users to login 

exports.userLogin = (req, res, next) => {
    User.find({ email: req.body.email})
    .exec()
    .then(user => {
        if (user.length < 1) {
            return res.status(401).json({
                message: "Auth failed"
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) =>{
            if (err) {
                return res.status(401).json({
                    message: "Auth failed"
                })
            }
            if (result) {
                const token = jwt.sign({
                    email: [0].email,
                    userId: user[0]._id
                }, 
                process.env.JWT_KEY, {
                   expiresIn: "1h"  
                }
                )
                return res.status(200).json({
                    message: "Auth successful",
                    token: token
                })
            }
        })
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error: err
        });
    })
};
