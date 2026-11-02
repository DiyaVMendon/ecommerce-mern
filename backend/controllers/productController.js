import Product from "../models/ProductModel.js";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";


const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ecommerce/products",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
};

export const createProduct = async (req, res) => {
  try {
    const {
      product_name,
      product_description,
      category,
      price,
      stock_quantity,
    } = req.body;

    if (
      !product_name ||
      !category ||
      price === undefined ||
      stock_quantity === undefined
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    if (
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      !Number.isInteger(Number(stock_quantity)) ||
      Number(stock_quantity) < 0
    ) {
      return res.status(400).json({
        message: "Enter a valid price and stock quantity",
      });
    }
    const imageUrl = req.file
  ? await uploadToCloudinary(req.file)
  : "";

    const product = await Product.create({
      product_name,
      product_description,
      category,
      price: Number(price),
      stock_quantity: Number(stock_quantity),
      product_image:imageUrl,
    });
    res.status(200).json({
      message: "Product added successfully",
      data: product,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unexpected error occured",
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { searchKey,category, page = 1, pageSize = 10, sort = "asc" } = req.query;
    let skip = (page - 1) * pageSize;

    let query = {};
    if (searchKey) {
      query.product_name = { $regex: searchKey, $options: "i" };
    }
    if(category){
      query.category = category
    }

    let sortOptions = {};
    if (sort === "asc") sortOptions.createdAt = 1;
    if (sort === "des") sortOptions.createdAt = -1;

    const data = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const totalProductCount = await Product.countDocuments(query);
    res.status(200).json({
      message: "Product retreived successfully",
      data,
      total: totalProductCount,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unexpected error occured",
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Product.findById(id);
    if (!data) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    res.status(200).json({
      message: "Product retreived successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unexpected error occured",
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      "product_name",
      "product_description",
      "category",
      "price",
      "stock_quantity",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body?.[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (req.file) {
      updates.product_image = await uploadToCloudinary(req.file);
    }
    const data = await Product.findByIdAndUpdate(id,{$set:updates},{
        new:true
    });
    if (!data) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    res.status(200).json({
      message: "Product updated successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unexpected error occured",
    });
  }
};

export const deleteProductBuId = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }
    const data = await Product.findByIdAndDelete(id)
    res.status(200).json({
      message: "Product retreived successfully",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Unexpected error occured",
    });
  }
};
