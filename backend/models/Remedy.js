import mongoose from "mongoose";
const remedySchema = new mongoose.Schema({
  title: { type: String, required: true },
  chakraIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chakra" }],
  nadiIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Nadi" }],
  steps: [{ type: String }],
  duration: { type: String, default: "" },
  notes: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 0 }
}, { timestamps: true });
export default mongoose.model("Remedy", remedySchema);
