import mongoose from "mongoose";

const questionnaireTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    key: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "new_seeker_basic",
        "beginner_sahajayogi",
        "regular_sahajayogi",
        "advanced_vibration_guidance",
      ],
    },
    audienceType: {
      type: String,
      required: true,
      enum: ["newSeeker", "beginner", "regular", "advanced"],
    },
    description: {
      type: String,
      default: "",
    },
    introText: {
      type: String,
      default: "",
    },
    resultStyle: {
      type: String,
      enum: ["simple", "guided", "detailed", "advanced"],
      default: "guided",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("QuestionnaireTemplate", questionnaireTemplateSchema);