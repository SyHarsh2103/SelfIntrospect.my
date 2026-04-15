import Remedy from "../models/Remedy.js";

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

export const getAdminRemedies = async (req, res, next) => {
  try {
    const remedies = await Remedy.find().sort({ priority: 1, createdAt: -1 });
    ok(res, remedies);
  } catch (error) {
    next(error);
  }
};

export const createRemedy = async (req, res, next) => {
  try {
    const remedy = await Remedy.create(req.body);
    ok(res, remedy, "Remedy created.");
  } catch (error) {
    next(error);
  }
};

export const updateRemedy = async (req, res, next) => {
  try {
    const remedy = await Remedy.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!remedy) {
      return res.status(404).json({ success: false, message: "Remedy not found." });
    }

    ok(res, remedy, "Remedy updated.");
  } catch (error) {
    next(error);
  }
};

export const deleteRemedy = async (req, res, next) => {
  try {
    const remedy = await Remedy.findByIdAndDelete(req.params.id);

    if (!remedy) {
      return res.status(404).json({ success: false, message: "Remedy not found." });
    }

    ok(res, remedy, "Remedy deleted.");
  } catch (error) {
    next(error);
  }
};