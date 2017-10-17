// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require('path');

//To require our Note and Articles models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Scraping tools
var request = require("request");
var cheerio = require("cheerio");

//Set mongoose to leverage built in Javascript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Set Handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

// Database configuration with mongoose
mongoose.connect("mongodb://admin:password@ds121495.mlab.com:21495/heroku_cczc3sbq");
var db = mongoose.connection;

// Show any mongoose errors 
db.on("error", function(error){
    console.log("Mongoose Error: ", error);
});

// Once logged into the db through mongoose, log a success message
db.once("open", function(){
    console.log("Mongoose connection successful.");
});

// Routes
// =======

// GET requests to render Handlebars pages
// app.get("/", function(req, res){
//     res.redirect('/home');
// });

app.get("/", function(req, res){
    Article.find({"saved": false}, function(error, data) {
        var hbsObject = {
            //key : value 
            article: data
        };
    console.log(hbsObject);
        res.render("index", hbsObject);
    }); 
});

app.get("/home", function(req, res){
    Article.find({"saved": false}, function(error, data) {
        var hbsObject = {
            //key : value 
            article: data
        };
    console.log(hbsObject);
        res.render("index", hbsObject);
    }); 
});

app.get("/saved", function(req, res){
    Article.find({"saved": true}).populate("notes").exec(function(error, articles){
        var hbsObject = {
            article: articles
        };
        res.render("saved", hbsObject);
    });
});

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res){
    //Grab grab the body  of the html with request
    request("https://www.reddit.com/r/CryptoCurrency/", function(error, response, html){
        // Load into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(html);
        // Grab every within article tag and do the following
        $("p.title").each(function(i, element){

            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");

            // Using our Article model, create a new entry
            // This passes the result object to the entry (and the title and link)
            var entry = new Article(result);

            // Now, save that entry to the db
            entry.save(function(err, doc){
                //Log any errors
                if (err) {
                    console.log(err);
                } 
                // Or log the doc
                else {
                    console.log(doc);
                }
            });
        });
    });
    // Tell the browser that we finished scraping the text
    res.send("Scrape Complete");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res){
    // Grab every doc in the Articles array
    Article.find({}, function(error, doc){
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Or send the doc to the browser as a json object
        else {
            res.json(doc);
        }
    });
});

// Grab an article by its ObjectId
app.get("/articles/:id", function(req, res){
    // Using the ID passed in the id parameter, prepare a query that finds the matching one in our db...
    Article.findOne({"_id": req.params.id})
    // And populate all of the notes associated with it
    .populate("note")
    // Execute our query
    .exec(function(error, doc){
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise, send the doc to the browser as a json object
        else {
            res.json(doc);
        }
    });
});

// // Create a new note or replace an existing note
// app.post("/articles/:id", function(req, res){
//     // Create a new note and pass the req.body to the entry
//     var newNote = new Note(req.body);

//     // And save the new note the db
//     newNote.save(function(error, doc){
//         // Log any errors
//         if (error) {
//             console.log(error);
//         }
//         // Otherwise
//         else {
//             // Use the article id to find and update its note
//             Article.findOneAndUpdate({"_id": req.params.id},{"note": doc._id})
//             // Execute the above query
//             .exec(function(err, doc){
//                 // Log any errors
//                 if (err) {
//                     console.log(err);
//                 }
//                 else {
//                     // Or send the document to the browser
//                     res.send(doc);
//                 }
//             });
//         }
//     });
// });

app.post("/articles/save/:id", function(req, res){
    // Use the article id to find and update its saved boolean
    Article.findOneAndUpdate({"_id": req.params.id}, {"saved": true})
    // Execute the above query
    .exec(function(err, doc){
        // Log any errors
        if (err) {
            console.log(err);
        } else {
        // Or send the document to the browser
            res.send(doc);
        }
    });
});

// Create a new note
app.post("/notes/save/:id", function(req, res){
    // Create a new note and pass the req.body to the entry
    var newNote = new Note({
        body: req.body.text,
        article: req.params.id
    });
    console.log(req.body)
    // And save the new note the db
    newNote.save(function(error, note) {
        // Log any errors
        if (error) {
            console.log(error);
        } else {
            // Use the article id to find and update its notes
            Article.findOneAndUpdate({"_id": req.params.id}, {$push: {"notes": note} })
            .exec(function(err){
                if (err) {
                    console.log(err);
                    res.send(err);
                }
                else {
                    res.send(note);
                }
            });
        }
    });
});

// Save an article
app.post("/articles/delete/:id", function(req, res){
    // Use the article id to find and update its saved boolean
    Article.findOneAndUpdate({"_id": req.params.id}, {"saved": false, "notes": []})
    // Execute the above query
    .exec(function(err, doc){
        // Log any errors
        if (err) {
            console.log(err);
        } else {
            // Or send the document to the browser
            res.send(doc);
        }
    });
});

// Delete a note
app.delete("/notes/delete/:note_id/:article_id", function(req, res){
    // Use the note id to find it and delete it
    Note.findOneAndRemove({"_id": req.params.note_id}, function(err){
        // Log any errors
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            Article.findOneAndUpdate({"_id": req.params.article_id}, {$pull: {"notes": req.params.note_id}})
            // Execute the above query
            .exec(function(err){
                // Log any errors
                if (err) {
                    console.log(err);
                    res.send(err);
                }
            });
        }
    });
});

app.listen(3000, function(){
    console.log("App running on port 3000!");
});


// How to connect to Heroku

// Save articles
// Delete articles from saved
// Fix Scrape Button
