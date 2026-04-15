import jwt from "jsonwebtoken";
import AdminUser from "../models/AdminUser.js";

export const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token is required.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const admin = await AdminUser.findById(decoded.id).select("-passwordHash");

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message: "Admin account is not available.",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};