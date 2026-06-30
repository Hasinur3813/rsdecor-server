const AppError = require("../utils/AppError");

exports.uploadImage = async (req, res) => {
  if (!req.file) {
    throw new AppError("Image file is required", 400);
  }

  const uploadResult = req.file;

  res.status(201).json({
    success: true,
    data: {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    },
  });
};
