import mongoose from "mongoose";
const mantraSchema = new mongoose.Schema({
  chakraId: { type: mongoose.Schema.Types.ObjectId, ref: "Chakra", required: true },
  title: { type: String, required: true },
  mantraText: { type: String, required: true },
  phoneticText: { type: String, default: "" },
  usageNotes: { type: String, default: "" },
  repetitions: { type: String, default: "" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model("Mantra", mantraSchema);
