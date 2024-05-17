const express=require('express');
const router=express.Router({mergeParams:true});
const catchasync=require("../utils/catchasync")
const expresserror=require("../utils/expresserror")
const Review=require("../models/review")
const Campground=require("../models/campground");
const joi=require('joi');
const reviewSchema=require('../models/reviewschema')
const { isLoggedIn } = require('../middleware');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body.review); // Access validate method of reviewSchema

    if (error) {
        console.log(error);
        const msg = error.details.map(el => el.message).join(",");
        console.log(msg);
        throw new expresserror(msg, 400);
    } else {
        next();
    }
};

router.post("/reviews",isLoggedIn,catchasync(async (req,res)=>{
    const campground= await Campground.findById(req.params.id)
       const review=  new Review(req.body.review);
       campground.reviews.push(review)
       await review.save()
       await campground.save()
       console.log(review)
       res.redirect(`/camp/${campground._id}`)
  }))
  router.delete('/reviews/:reviewid',isLoggedIn,catchasync(async(req,res)=>{
      const {id,reviewid}=req.params;
      await Campground.findByIdAndUpdate(id,{$pull:{reviews:reviewid}})
      await Review.findByIdAndDelete(req.params.reviewid);
  
      res.redirect(`/camp/${id}`);
  }))
  module.exports=router;