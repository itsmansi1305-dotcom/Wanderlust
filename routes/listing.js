const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {listingSchema} = require("../schema.js");
const user = require("../models/user.js");
const{isloggedIn,isOwner,validateListing}=require("../middleware.js");
const Listing = require("../models/listing.js");




// Index Route
router.get("/",wrapAsync (async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

// New Route
router.get("/new", isloggedIn,(req, res) => {
    res.render("listings/new.ejs");
});

// Show Route
router.get("/:id",wrapAsync(async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
    .populate({path:"reviews",
        populate:{
            path:"author",
        }
    })
    .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    console.log(listing);

    res.render("listings/show.ejs", { listing });
}));

// Create Route
router.post("/",isloggedIn,
    validateListing, wrapAsync(async (req, res) => {
   let result =  listingSchema.validate(req.body);
   console.log(result);
   if(result.error){
    throw new ExpressError(400,result.error);
   }
  const newListing = new Listing(req.body.listing);
newListing.owner = req.user._id;

await newListing.save();
    req.flash("success","New Listing Created");

    res.redirect("/listings");
    
}));
//edit route
router.get("/:id/edit",isloggedIn,
    isOwner,wrapAsync (async (req,res)=> {
let {id} = req.params;
let listing = await Listing.findById(id);
 if(!listing){
        req.flash("error","Listing you requested for does not exist");
        return res.redirect("/listings");
    }
res.render("listings/edit.ejs",{listing});
}));
//update route
router.put("/:id",isloggedIn,
    isOwner,
    validateListing,
    wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing });
     req.flash("success"," Listing updated");
    res.redirect(`/listings/${id}`);
}));
//delete route
router.delete("/:id",isloggedIn, 
    isOwner,
    wrapAsync(async(req,res)=>{
    let {id} = req.params;
   let deletedListing = await Listing.findByIdAndDelete(id);
   console.log(deletedListing);
    req.flash("success"," Listing Deleted");
   res.redirect("/listings")
}));
module.exports = router;