// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

//To require our Note and Articles models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

//Set mongoose to leverage built in Javascript ES6 Promises
mongoose.Promise = Promise;

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/crypto");
var db = mongoose.connection;

// Show any mongoose errors 
db.on("error", function(error){
    console.log("Mongoose Error: ", error);
});

// Once logged into the db through mongoose, log a success message
db.once("open", function(){
    console.log("Mongoose connection successful.");
});

