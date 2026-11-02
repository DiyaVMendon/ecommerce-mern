import express from "express";
import {addToCart,removeItem,updateQuantity,getCart} from "../controllers/Cart.js"

const route = express.Router()

route.post("/add-cart",addToCart)
route.patch("/update-cart",updateQuantity)
route.delete("/delete-cart",removeItem)
route.get("/get-cart",getCart)

export default route;