import express from "express";
import { createProduct,getProducts,getProductById,updateProduct,deleteProductBuId } from "../controllers/productController.js";
import upload from "../middleware/upload.js";

const route = express.Router();

route.post("/add-product",upload.single("product_image"),createProduct)
route.get("/get-products",getProducts)
route.get("/get-product/:id",getProductById)
route.patch(
  "/update-product/:id",
  upload.single("product_image"),
  updateProduct
);
route.delete("/delete-product/:id",deleteProductBuId)

export default route;