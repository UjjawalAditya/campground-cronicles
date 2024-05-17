const express=require('express');
const router=express.Router();
const catchasync=require("../utils/catchasync")
const expresserror=require("../utils/expresserror")
const Campground=require("../models/campground");
const joi=require('joi');
const { isLoggedIn } = require('../middleware');


router.get('/',async(req,res)=>{
    const campgrounds =await Campground.find({})
    res.render("campgrounds/index",{campgrounds})
 })
 
 
 router.get("/new",isLoggedIn,(req,res)=>{
     res.render("campgrounds/new")
 })
 //post route
 router.post("/",isLoggedIn, catchasync(async (req, res, next) => {
     const cSchema = joi.object({
         camp: joi.object({ 
             title: joi.string().required(),
             location: joi.string().required(),
             image: joi.string().uri(), // Validate as a URI
             description: joi.string().required(),
             price: joi.number().required().min(-1),
         }).required()
     });
 
     const { error, value } = cSchema.validate(req.body);
     if (error) {
         console.log(error)
         const msg = error.details.map(el => el.message).join(",");
         console.log(msg)
         throw new expresserror(msg, 400);
     }
 

     const camp = new Campground(req.body.camp);
     await camp.save();
     req.flash('sucess','Successfully made a new Campground')
     res.redirect(`/camp/${camp._id}`);
 }));
 
 //update route
 router.get("/:id/edit",isLoggedIn,async(req,res)=>{
    const camps= await Campground.findById(req.params.id);
    res.render("campgrounds/edit",{camps});
 
 })
 router.put("/:id",isLoggedIn,async(req,res)=>{
     const {id}=req.params;
     
     const camp=await Campground.findByIdAndUpdate(id,{...req.body.camp})
     req.flash('sucess','Sucessfully updated Campground')
     console.log({...req.body.camp})
   res.redirect(`/camp/${camp.id}`)
     
 })
 //details of camp
 
 router.get("/:id",async(req,res)=>{
     const campground=await Campground.findById(req.params.id).populate("reviews")
     console.log(campground)
     
     res.render("campgrounds/show",{campground});
 });
 module.exports=router;