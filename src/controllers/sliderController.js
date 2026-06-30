const Slider = require("../models/Slider");
const Counter = require("../models/Counter"); // see note below
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

/**
 * Atomically reserves the next sliderId using a dedicated counter
 * document. findOne().sort() is not safe under concurrent requests —
 * two simultaneous creates can read the same "last" id and collide.
 */
const getNextSliderId = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "sliderId" },
    { $inc: { value: 1 } },
    { new: true, upsert: true },
  );
  return counter.value;
};

/**
 * Builds slider data for CREATE. Image and heading are mandatory here.
 */
const buildSliderDataForCreate = (reqBody, file) => {
  // multer consumes the "image" field from the multipart body,
  // so it lives on req.file — not req.body.image.
  // CloudinaryStorage puts the uploaded URL on file.path (or file.secure_url).
  const image = file?.path || file?.secure_url || reqBody.image;
  const heading = reqBody.heading?.trim();

  if (!image || !heading) {
    throw new AppError("Image and heading are required", 400);
  }

  return {
    image,
    alt: reqBody.alt?.trim() || "",
    badge: reqBody.badge?.trim() || "",
    heading,
    subtext: reqBody.subtext?.trim() || "",
    cta1: {
      label: reqBody.cta1?.label?.trim() || "",
      href: reqBody.cta1?.href?.trim() || "",
    },
    cta2: {
      label: reqBody.cta2?.label?.trim() || "",
      href: reqBody.cta2?.href?.trim() || "",
    },
  };
};

/**
 * Builds slider data for UPDATE. Only includes fields that were actually
 * sent, so a partial update doesn't blank out existing fields (the
 * original implementation always wrote "" for anything omitted).
 */
const buildSliderDataForUpdate = (reqBody, file) => {
  const update = {};

  const newImage = file?.path || file?.secure_url || reqBody.image;
  if (newImage) update.image = newImage;

  if (reqBody.alt !== undefined) update.alt = reqBody.alt.trim();
  if (reqBody.badge !== undefined) update.badge = reqBody.badge.trim();
  if (reqBody.heading !== undefined) {
    const heading = reqBody.heading.trim();
    if (!heading) throw new AppError("Heading cannot be empty", 400);
    update.heading = heading;
  }
  if (reqBody.subtext !== undefined) update.subtext = reqBody.subtext.trim();

  if (reqBody.cta1) {
    update.cta1 = {
      label: reqBody.cta1.label?.trim() || "",
      href: reqBody.cta1.href?.trim() || "",
    };
  }
  if (reqBody.cta2) {
    update.cta2 = {
      label: reqBody.cta2.label?.trim() || "",
      href: reqBody.cta2.href?.trim() || "",
    };
  }

  if (Object.keys(update).length === 0) {
    throw new AppError("No valid fields provided to update", 400);
  }

  return update;
};

exports.createSlider = catchAsync(async (req, res) => {
  const sliderData = buildSliderDataForCreate(req.body, req.file);
  const sliderId = await getNextSliderId();
  const slider = await Slider.create({ sliderId, ...sliderData });

  res.status(201).json({ success: true, data: slider });
});

exports.getSliders = catchAsync(async (_req, res) => {
  const sliders = await Slider.find().sort({ sliderId: 1 });
  res.status(200).json({ success: true, count: sliders.length, data: sliders });
});

exports.getSlider = catchAsync(async (req, res) => {
  const slider = await Slider.findOne({ sliderId: req.params.id });
  if (!slider) throw new AppError("Slider not found", 404);

  res.status(200).json({ success: true, data: slider });
});

exports.updateSlider = catchAsync(async (req, res) => {
  const sliderData = buildSliderDataForUpdate(req.body, req.file);

  const slider = await Slider.findOneAndUpdate(
    { sliderId: req.params.id },
    { $set: sliderData },
    { new: true, runValidators: true },
  );

  if (!slider) throw new AppError("Slider not found", 404);

  res.status(200).json({ success: true, data: slider });
});

exports.deleteSlider = catchAsync(async (req, res) => {
  const slider = await Slider.findOneAndDelete({ sliderId: req.params.id });
  if (!slider) throw new AppError("Slider not found", 404);

  res.status(200).json({ success: true, data: slider });
});
