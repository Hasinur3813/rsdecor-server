const express = require("express");
const sliderController = require("../controllers/sliderController");
const uploader = require("../middleware/cloudinaryUpload");

const router = express.Router();

router.post("/", uploader.single("image"), sliderController.createSlider);
router.get("/", sliderController.getSliders);
router.get("/:id", sliderController.getSlider);
router.put("/:id", uploader.single("image"), sliderController.updateSlider);
router.delete("/:id", sliderController.deleteSlider);

module.exports = router;
