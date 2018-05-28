var express               = require("express");
var bodyParser            = require("body-parser");
var mongoose              = require("mongoose");
var app                   = express();
var seedDB                = require("./seed");
var Campground            = require("./models/campground");
var Comment               = require("./models/comment");
var passport              = require("passport");
var LocalStrategy         = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User                  = require("./models/user");
var commentRoutes         = require("./routes/comments");
var campgroundRoutes      = require("./routes/campgrounds");
var indexRoutes           = require("./routes/index");
var methodOverride        = require("method-override");
var flash                 = require("connect-flash");
var cookieParser          = require("cookie-parser");

mongoose.connect("mongodb://localhost/yelp_camp");

app.use(express.static('public'));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.locals.moment = require('moment');
app.use(cookieParser('secret'));

//PASSPORT CONFIGURATION
app.use(require("express-session")({
   secret: "Once again Rusty win the cutest dog",
   resave: false,
   saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Assign user for all route
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

//seedDB();//Seed the database

app.use("/",indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER IS RUNNING");
})