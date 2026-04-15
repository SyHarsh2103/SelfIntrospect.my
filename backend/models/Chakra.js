import mongoose from "mongoose";
const chakraSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, enum: ["mooladhara","swadhisthana","nabhi","void","heart","vishuddhi","agnya","sahasrara"] },
  displayName: { type: String, required: true },
  description: { type: String, default: "" },
  qualities: [{ type: String }],
  catchingIndicators: [{ type: String }],
  sideNotes: { type: String, default: "" },
  iconName: { type: String, default: "" },
  color: { type: String, default: "#D4500A" }
}, { timestamps: true });
export default mongoose.model("Chakra", chakraSchema);
