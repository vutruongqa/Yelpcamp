var mongoose = require("mongoose");
//SCHEMA SETUP
var commentSchema = new mongoose.Schema({
   text:String,
   author: {
      id:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"User"
      },
      username: String
   },
   createdAt: { type: Date, default: Date.now }
});

var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;