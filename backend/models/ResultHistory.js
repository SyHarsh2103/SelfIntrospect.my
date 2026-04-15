import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    selectedOptionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Option" }],
    intensityLevel: { type: Number, default: null },
  },
  { _id: false }
);

const userInfoSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, lowercase: true, default: "" },
  },
  { _id: false }
);

const resultHistorySchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    userInfo: { type: userInfoSchema, default: () => ({}) },
    answers: [answerSchema],
    primaryChakra: { type: String, default: null },
    secondaryChakra: { type: String, default: null },
    dominantNadi: { type: String, default: null },
    confidence: {
      type: String,
      enum: ["High", "Medium", "Low", "Inconclusive"],
      required: true,
    },
    chakraScores: { type: Object, required: true },
    nadiScores: { type: Object, required: true },
    remedyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Remedy" }],
    mantraIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Mantra" }],
    explanation: { type: String, default: "" },
    ipHash: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ResultHistory", resultHistorySchema);
