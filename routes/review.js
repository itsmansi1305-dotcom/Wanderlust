const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js"); 
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {validateReviews, isloggedIn,isreviewAuthor} = require("../middleware.js")




//review 
//post  review route
router.post("/",
    isloggedIn,validateReviews, wrapAsync(async(req,res)=>{
let listing = await Listing.findById(req.params.id);
let newReview = new Review(req.body.review);
newReview.author = req.user._id;
console.log(newReview);
listing.reviews.push(newReview);
await newReview.save();
await listing.save();
 req.flash("success","New Review Created");
 res.redirect(`/listings/${listing._id}`);
 
}));
//delete review route
router.delete("/:reviewsId",
    isloggedIn,
    isreviewAuthor,wrapAsync(async(req,res)=>{
    let{id,reviewsId} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews:reviewsId}});
    await Review.findByIdAndDelete(reviewsId);
     req.flash("success","Review Deleted");
    res.redirect(`/listings/${id}`);

}));
module.exports = router;
