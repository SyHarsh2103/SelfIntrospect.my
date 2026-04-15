import bcrypt from "bcryptjs";
import AdminUser from "../models/AdminUser.js";

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

export const getAdminUsers = async (req, res, next) => {
  try {
    const users = await AdminUser.find()
      .select("-passwordHash")
      .sort({ createdAt: -1 });

    ok(res, users);
  } catch (error) {
    next(error);
  }
};

export const createAdminUser = async (req, res, next) => {
  try {
    const { email, password, role = "contentManager", isActive = true } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!["superAdmin", "contentManager"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid admin role.",
      });
    }

    const exists = await AdminUser.findOne({
      email: email.toLowerCase().trim(),
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Admin user already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const admin = await AdminUser.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      isActive,
    });

    ok(
      res,
      {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        createdAt: admin.createdAt,
      },
      "Admin user created successfully."
    );
  } catch (error) {
    next(error);
  }
};

export const updateAdminUser = async (req, res, next) => {
  try {
    const { role, isActive, password } = req.body;

    const payload = {};

    if (role) payload.role = role;
    if (typeof isActive === "boolean") payload.isActive = isActive;
    if (password) payload.passwordHash = await bcrypt.hash(password, 12);

    const admin = await AdminUser.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).select("-passwordHash");

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found.",
      });
    }

    ok(res, admin, "Admin user updated successfully.");
  } catch (error) {
    next(error);
  }
};

export const deleteAdminUser = async (req, res, next) => {
  try {
    if (String(req.admin?._id) === String(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account.",
      });
    }

    const admin = await AdminUser.findByIdAndDelete(req.params.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin user not found.",
      });
    }

    ok(res, { id: admin._id }, "Admin user deleted successfully.");
  } catch (error) {
    next(error);
  }
};