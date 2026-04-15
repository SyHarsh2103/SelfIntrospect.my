import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import AdminUser from "../models/AdminUser.js";

const OTP_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MINUTES = 15;

const signToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id,
      email: admin.email,
      role: admin.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    }
  );
};

const hashValue = (value) => {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
};

const generateOtp = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

const getTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendAdminOtpEmail = async ({ to, otp }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`Admin password reset OTP for ${to}: ${otp}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Admin Password Reset OTP",
    html: `
      <div style="margin:0;padding:0;background:#fff7ed;font-family:Arial,Helvetica,sans-serif;color:#1e293b;">
        <div style="max-width:620px;margin:0 auto;padding:32px 16px;">
          <div style="background:#ffffff;border:1px solid #fed7aa;border-radius:24px;overflow:hidden;box-shadow:0 10px 30px rgba(15,23,42,0.08);">
            <div style="background:linear-gradient(135deg,#ea580c,#f59e0b);padding:28px 30px;color:#ffffff;">
              <div style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
                Self Introspect Admin
              </div>
              <h1 style="margin:12px 0 0;font-size:28px;line-height:1.25;font-family:Georgia,serif;">
                Password Reset OTP
              </h1>
            </div>

            <div style="padding:30px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                Jai Shri Mataji,
              </p>

              <p style="margin:0 0 20px;font-size:15px;line-height:1.7;">
                We received a request to reset your admin password. Please use the OTP below to continue.
              </p>

              <div style="margin:28px 0;padding:22px;border-radius:18px;background:#fff7ed;border:1px dashed #fb923c;text-align:center;">
                <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#c2410c;">
                  Your OTP
                </div>
                <div style="margin-top:10px;font-size:34px;font-weight:800;letter-spacing:8px;color:#9a3412;">
                  ${otp}
                </div>
              </div>

              <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#475569;">
                This OTP is valid for <strong>${OTP_EXPIRY_MINUTES} minutes</strong>.
              </p>

              <p style="margin:0;font-size:14px;line-height:1.7;color:#475569;">
                If you did not request this password reset, you can safely ignore this email.
              </p>
            </div>

            <div style="padding:18px 30px;background:#f8fafc;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">
                This is an automated security email from the Self Introspect admin system.
              </p>
            </div>
          </div>
        </div>
      </div>
    `,
  });
};

export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const admin = await AdminUser.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials.",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials.",
      });
    }

    admin.lastLogin = new Date();
    await admin.save();

    const token = signToken(admin);

    return res.json({
      success: true,
      message: "Admin login successful.",
      data: {
        token,
        admin: {
          id: admin._id,
          email: admin.email,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotAdminPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const admin = await AdminUser.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
    });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin account is not available.",
      });
    }

    const otp = generateOtp();

    admin.resetOtpHash = hashValue(otp);
    admin.resetOtpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    admin.resetOtpVerified = false;
    admin.resetOtpVerifiedAt = null;
    admin.passwordResetTokenHash = "";
    admin.passwordResetTokenExpiresAt = null;
    await admin.save();

    await sendAdminOtpEmail({ to: admin.email, otp });

    return res.json({
      success: true,
      message: "OTP sent to admin email.",
      data: {
        email: admin.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyAdminResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const admin = await AdminUser.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
    });

    if (!admin || !admin.resetOtpHash || !admin.resetOtpExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP request is invalid or expired.",
      });
    }

    if (admin.resetOtpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const isOtpValid = admin.resetOtpHash === hashValue(otp);

    if (!isOtpValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    admin.resetOtpVerified = true;
    admin.resetOtpVerifiedAt = new Date();
    admin.passwordResetTokenHash = hashValue(resetToken);
    admin.passwordResetTokenExpiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
    );
    await admin.save();

    return res.json({
      success: true,
      message: "OTP verified successfully.",
      data: {
        resetToken,
        email: admin.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const resetAdminPassword = async (req, res, next) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset token, and new password are required.",
      });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long.",
      });
    }

    const admin = await AdminUser.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
    });

    if (!admin || !admin.passwordResetTokenHash || !admin.passwordResetTokenExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Password reset request is invalid or expired.",
      });
    }

    if (admin.passwordResetTokenExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Password reset token has expired. Please request a new OTP.",
      });
    }

    const isResetTokenValid = admin.passwordResetTokenHash === hashValue(resetToken);

    if (!admin.resetOtpVerified || !isResetTokenValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password reset token.",
      });
    }

    admin.passwordHash = await bcrypt.hash(newPassword, 10);
    admin.resetOtpHash = "";
    admin.resetOtpExpiresAt = null;
    admin.resetOtpVerified = false;
    admin.resetOtpVerifiedAt = null;
    admin.passwordResetTokenHash = "";
    admin.passwordResetTokenExpiresAt = null;
    await admin.save();

    return res.json({
      success: true,
      message: "Admin password reset successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProfile = async (req, res, next) => {
  try {
    const admin = await AdminUser.findById(req.admin?.id).select(
      "email role isActive lastLogin createdAt"
    );

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found.",
      });
    }

    return res.json({
      success: true,
      message: "Admin profile fetched successfully.",
      data: {
        admin,
      },
    });
  } catch (error) {
    next(error);
  }
};