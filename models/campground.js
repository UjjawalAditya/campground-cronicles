const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const Review=require('./review')
const campgroundSchema=new Schema({
    title:"string",
    image:"string",
    price:"number",
    description :"string",
    location:"string",
    reviews:[
        {
            type:Schema.Types.ObjectId,
            ref:'Review'
        }
    ]
});
campgroundSchema.post('findOneAndDelete',async function(doc){
    if(doc)
    {
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })
    }
    console.log(doc);

})
module.exports=mongoose.model("campground",campgroundSchema);