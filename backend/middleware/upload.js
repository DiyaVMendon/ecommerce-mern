import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";


const uploadDir=path.resolve("uploads");

fs.mkdirSync(uploadDir,{recursive:true})

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,uploadDir)
    },
    filename:(req,file,cb)=>{
         const uniqueName =
      crypto.randomUUID() +
      path.extname(file.originalname).toLowerCase();

    cb(null, uniqueName);
    }
})
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG and WebP images are allowed"));
  }
};


const upload =multer({storage:storage,fileFilter,limits:{fileSize: 5 * 1024 * 1024,}})

export default upload;

