const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const sliderStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "rsdecor/sliders",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
  },
});

const uploader = multer({
  storage: sliderStorage,
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

module.exports = uploader;
