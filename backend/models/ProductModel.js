import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    product_name:{type:String,required:true},
    product_description:{type:String},
    category:{type:String,required:true},
    price:{type:Number,required:true},
    stock_quantity:{type:Number,required:true},
    product_image:{type:String,default:""}
},{timestamps:true})

export default mongoose.model("product",ProductSchema);