import mongoose from "mongoose";

const adminUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["superAdmin", "contentManager"],
      default: "contentManager",
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },

    resetOtpHash: { type: String, default: "" },
    resetOtpExpiresAt: { type: Date, default: null },
    resetOtpVerified: { type: Boolean, default: false },
    resetOtpVerifiedAt: { type: Date, default: null },
    passwordResetTokenHash: { type: String, default: "" },
    passwordResetTokenExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("AdminUser", adminUserSchema);
