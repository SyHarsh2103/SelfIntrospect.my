import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "vibration",
        "emotional",
        "mental",
        "meditation",
        "life-area",
        "physical",
        "spiritual",
        "channel-tendency",
        "joy",
        "profile",
        "general",
      ],
    },
    type: {
      type: String,
      required: true,
      enum: ["single-choice", "multiple-choice", "intensity"],
    },
    helpText: {
      type: String,
      default: "",
    },
    templateKeys: {
      type: [String],
      default: ["regular_sahajayogi"],
    },
    audienceTypes: {
      type: [String],
      default: ["regular"],
    },
    difficultyLevel: {
      type: String,
      enum: ["basic", "intermediate", "advanced"],
      default: "intermediate",
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

export default mongoose.model("Question", questionSchema);