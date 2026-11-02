import mongoose from "mongoose";

export const connectdb=()=>{
    try {
        const client = mongoose.connect(process.env.MONGO_URI)
        console.log("Connection established");
        return client
    } catch (error) {
        console.log(error)
        process.exit(1)
        
    }
}