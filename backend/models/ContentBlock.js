import mongoose from "mongoose";
const contentBlockSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, enum: ["homeIntro","fullDisclaimer","shortDisclaimer","centeringText","finalGuidance","inconclusiveGuidance"] },
  title: { type: String, required: true },
  content: { type: String, required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser", default: null }
}, { timestamps: true });
export default mongoose.model("ContentBlock", contentBlockSchema);
