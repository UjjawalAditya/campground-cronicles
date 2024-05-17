const express=require("express");
const mongoose=require("mongoose")
const app=express()
const path=require("path")
const Campground=require("./models/campground");
const Review=require("./models/review")
const methodOverride=require('method-override');
const ejsMate=require('ejs-mate')
const session=require('express-session');
const catchasync=require("./utils/catchasync")
const expresserror=require("./utils/expresserror")
const joi=require('joi');
const reviewSchema=require('./models/reviewschema')
const campgroundsroutes=require('./Routes/campgrounds');
const reviewroutes=require("./Routes/review");
const passport =require('passport');
const LocalStrategy=require('passport-local')
const User=require('./models/user')
const userroutes=require('./Routes/user')
const flash=require('connect-flash')
app.engine('ejs',ejsMate)
app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
//mongodb connection
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

app.use(flash());
app.use((req, res, next) => {
    res.locals.currentUser=req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

mongoose.connect('mongodb://127.0.0.1:27017/miniproject', { useNewUrlParser: true, useUnifiedTopology: true })
.then(()=>{
    console.log("connected !!!")
}).catch((e)=>{
    console.log(e)
})
//middleware 

//list campgrounds

app.use('/',userroutes)
app.use("/camp",campgroundsroutes);
app.use("/camp/:id",reviewroutes);

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