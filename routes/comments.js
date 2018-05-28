var express    = require("express");
var router  = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware/index");

//NEW Comment  campgrounds/:id/comments/new   GET
router.get('/new',middleware.isLoggedIn,function(req, res) {
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            req.flash("error", "Something went wrong");
        }
        else
        {
            res.render("comments/new",{campground});
        }
    });
});

//CREATE Comment campgrounds/:id/comments   POST
router.post('/',middleware.isLoggedIn,function(req,res){
    Campground.findById(req.params.id, function(err,campground){
        if(err){
            req.flash("error", "Something went wrong");
            res.redirect("/campgrounds");
        }
        else{
            Comment.create(req.body.comment,function(err,comment){
                if(err){
                    req.flash("error", "Something went wrong");
                }    
                else{
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/" + campground._id);
                }
            });
        }
    });
});

//EDIT RULE
router.get("/:comment_id/edit",middleware.checkCommmentOwnerShip,function(req,res){
    Comment.findById(req.params.comment_id,function(err, comment) {
       if(err){
           req.flash("error", "Something went wrong");
           res.redirect("back");
       } else {
           res.render("comments/edit",{campground_id:req.params.id,comment });
       }
    });
});

//COMMENT DELETE
router.put("/:comment_id",middleware.checkCommmentOwnerShip,function(req,res){
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,comment){
        if(err){
            req.flash("error", "Something went wrong");
            res.redirect("back");
        }    
        else{
            req.flash("success", "Successfully deleted comment");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


//COMMENT UPDATE
router.delete("/:comment_id",middleware.checkCommmentOwnerShip,function(req,res){
    Comment.findByIdAndRemove(req.params.comment_id,function(err,comment){
        if(err){
            req.flash("error", "Something went wrong");
            res.redirect("back");
        }    
        else{
            req.flash("success", "Successfully updated comment");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;