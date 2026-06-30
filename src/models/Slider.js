const mongoose = require("mongoose");

const sliderSchema = new mongoose.Schema(
  {
    sliderId: {
      type: Number,
      unique: true,
      index: true,
    },
    image: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: "",
    },
    badge: {
      type: String,
      default: "",
    },
    heading: {
      type: String,
      required: true,
    },
    subtext: {
      type: String,
      default: "",
    },
    cta1: {
      label: {
        type: String,
        default: "",
      },
      href: {
        type: String,
        default: "",
      },
    },
    cta2: {
      label: {
        type: String,
        default: "",
      },
      href: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

sliderSchema.virtual("id").get(function () {
  return this.sliderId ?? this._id.toString();
});

sliderSchema.set("toJSON", {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret.sliderId ?? ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.sliderId;
  },
});

module.exports = mongoose.model("Slider", sliderSchema);
