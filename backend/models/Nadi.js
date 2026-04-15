import mongoose from "mongoose";
const nadiSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, enum: ["leftNadi","rightNadi","centerNadi"] },
  displayName: { type: String, required: true },
  description: { type: String, default: "" },
  characteristics: [{ type: String }],
  catchingIndicators: [{ type: String }],
  color: { type: String, default: "#1A3557" }
}, { timestamps: true });
export default mongoose.model("Nadi", nadiSchema);
