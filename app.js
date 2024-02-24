const express=require("express");
const mongoose=require("mongoose")
const app=express()
const path=require("path")
const Campground=require("./models/campground");
const Review=require("./models/review")
const methodOverride=require('method-override');
const ejsMate=require('ejs-mate')
const catchasync=require("./utils/catchasync")
const expresserror=require("./utils/expresserror")
const joi=require('joi');
const reviewSchema=require('./models/reviewschema')


app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
//mongodb connection
mongoose.connect('mongodb://127.0.0.1:27017/miniproject', { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    console.log("connected !!!")
}).catch((e)=>{
    console.log(e)
})
//middleware 
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
//list campgrounds

app.get('/camp',async(req,res)=>{
   const campgrounds =await Campground.find({})
   res.render("campgrounds/index",{campgrounds})
})


app.get("/camp/new",(req,res)=>{
    res.render("campgrounds/new")
})
//post route
app.post("/camp", catchasync(async (req, res, next) => {
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
    res.redirect(`/camp/${camp._id}`);
}));

//update route
app.get("/camp/:id/edit",async(req,res)=>{
   const camps= await Campground.findById(req.params.id);
   res.render("campgrounds/edit",{camps});

})
app.put("/camp/:id",async(req,res)=>{
    const {id}=req.params;
    
    const camp=await Campground.findByIdAndUpdate(id,{...req.body.camp})
    console.log({...req.body.camp})
  res.redirect(`/camp/${camp.id}`)
    
})
//details of camp

app.get("/camp/:id",async(req,res)=>{
    const campground=await Campground.findById(req.params.id).populate("reviews")
    console.log(campground)
    
    res.render("campgrounds/show",{campground});
});

app.post("/camp/:id/reviews",catchasync(async (req,res)=>{
  const campground= await Campground.findById(req.params.id)
     const review=  new Review(req.body.review);
     campground.reviews.push(review)
     await review.save()
     await campground.save()
     console.log(review)
     res.redirect(`/camp/${campground._id}`)
}))
app.all("*",(req,res,next)=>{
    next(new expresserror("Page Not Found",404))
})
app.use((err, req, res, next) => {
    const { statuscode = 500, message = 'Something went wrong' } = err;
    res.status(statuscode).render("error",{message});
});





app.listen(3000,(req,res)=>{
    console.log("live at 3000")
})