import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path"
import {connectdb} from "./config/db.js"
import AuthRoutes from "./routes/AuthRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import CartRoutes from "./routes/CartRoutes.js"


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/",(req,res)=>{
    console.log("API is running")
    res.send("API is running")

})

connectdb()

app.use("/api/auth",AuthRoutes)
app.use("/api/admin",productRoutes)
app.use("/api/user",CartRoutes)

app.listen(process.env.PORT,()=>{
    console.log(`Listening to PORT ${process.env.PORT}`)
})
