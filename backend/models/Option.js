import mongoose from "mongoose";
import { chakraKeys, nadiKeys } from "./common.js";

const makeScoreShape = (keys) =>
  Object.fromEntries(keys.map((key) => [key, { type: Number, default: 0 }]));

const optionSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true,
    },
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    isNeutral: { type: Boolean, default: false },
    chakraScores: {
      type: new mongoose.Schema(makeScoreShape(chakraKeys), { _id: false }),
      default: {},
    },
    nadiScores: {
      type: new mongoose.Schema(makeScoreShape(nadiKeys), { _id: false }),
      default: {},
    },
    description: { type: String, default: "" },
    explanation: { type: String, default: "" },
    reflection: { type: String, default: "" },
    multiplierValue: { type: Number, default: 1 },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Option", optionSchema);
