const express = require("express");
const sliderController = require("../controllers/sliderController");
const uploader = require("../middleware/cloudinaryUpload");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, uploader.single("image"), sliderController.createSlider);
router.get("/", sliderController.getSliders);
router.get("/:id", sliderController.getSlider);
router.put("/:id", protect, uploader.single("image"), sliderController.updateSlider);
router.delete("/:id", protect, sliderController.deleteSlider);

module.exports = router;
