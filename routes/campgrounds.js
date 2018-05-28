var express    = require("express");
var router     = express.Router();
var Campground = require("../models/campground");
var Comment    = require("../models/comment");
var middleware = require("../middleware");
var geocoder = require('geocoder');

//var { isLoggedIn, checkUserCampground, checkUserComment, isAdmin, isSafe } = middleware; // destructuring assignment

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all campgrounds
router.get("/",function(req,res){
    if(req.query.search && req.xhr) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all campgrounds from DB
      Campground.find({name: regex}, function(err, allCampgrounds){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(allCampgrounds);
         }
      });
    } else {
    Campground.find({},function(err,campgrounds){
        if(err){
            req.flash("error", "Something went wrong");
        }
        else{
            if(req.xhr) {
              res.json(campgrounds);
            } else {
                res.render('campgrounds/index', {campgrounds, page: 'campgrounds'});
            }
        }
    });
  }
});

//NEW
router.get('/new',middleware.isLoggedIn,function(req, res) {
   res.render('campgrounds/new'); 
});

//CREATE
router.post('/',middleware.isLoggedIn,function(req,res){
    var name = req.body.name;
    var img_url = req.body.image;
    var price = req.body.price;
    var location = req.body.location;
    console.log(location);
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    geocoder.geocode(req.body.location, function (err, data) {
        console.log(req.body.location);
        if (err || data.status === 'ZERO_RESULTS') {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
    
        var campground = {name:name,price, image:img_url,location, description:req.body.description, author, lat, lng};
        Campground.create(campground, function(err,campground){
            if(err){
                req.flash("error", "Something went wrong");
            }
            else{
                req.flash("success", "Successfully added campground");
                res.redirect('/campgrounds');
            }
        });
    });
});

//SHOW
router.get('/:id',middleware.isLoggedIn,function(req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, campground){
        if(err){
            req.flash("error", "Something went wrong");
        }
        else
        {
            console.log(campground);
            res.render("campgrounds/show",{campground});
        }
    });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit",middleware.checkCampgroundOwnerShip,function(req,res){
    Campground.findById(req.params.id,function(err, campground) {
         if(err){
            req.flash("error", "Something went wrong");
        }else {
            if(!campground){
                return res.status(400).send("Item not found.");
            }
            res.render("campgrounds/edit",{campground}); 
        }
    });
});

//UPDATE THE CAMPGROUND
// router.put("/:id",middleware.checkCampgroundOwnerShip,function(req,res){
//     Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,campground){
//         if(err){
//             req.flash("error", "You need to be logged in to do that");
//         }else {
//             req.flash("success", "Successfully updated campground");
//             res.redirect("/campgrounds/" + req.params.id);
//         }
//     });
// });

router.put("/:id", middleware.checkCampgroundOwnerShip, function(req, res){
  geocoder.geocode(req.body.campground.location, function (err, data) {
    console.log("Location is ", req.body.campground.location);
    var lat = data.results[0].geometry.location.lat;
    var lng = data.results[0].geometry.location.lng;
    var location = data.results[0].formatted_address;
    var newData = {name: req.body.campground.name, image: req.body.campground.image, description: req.body.campground.description, price: req.body.campground.price, location: location, lat: lat, lng: lng};
    Campground.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

//DELETE A CAMPGROUND
router.delete("/:id",middleware.checkCampgroundOwnerShip,function(req,res){
    Campground.findByIdAndRemove(req.params.id,function(err){
         if(err){
            req.flash("error", "You need to be logged in to do that");
        }else {
            req.flash("success", "Successfully deleted comment");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router;