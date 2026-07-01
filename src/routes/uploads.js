const express = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const uploadController = require("../controllers/uploadController");
const { protect } = require("../middleware/auth");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "rsdecor/categories",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"), false);
      return;
    }
    cb(null, true);
  },
});

const router = express.Router();
router.post("/", protect,upload.single("image"), uploadController.uploadImage);

module.exports = router;
