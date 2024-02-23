const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const campgroundSchema=new Schema({
    title:"string",
    image:"string",
    price:"number",
    description :"string",
    location:"string",
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Reviews'
        }
    ]
});
module.exports=mongoose.model("campground",campgroundSchema);