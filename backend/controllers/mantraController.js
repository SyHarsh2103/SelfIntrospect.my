import Mantra from "../models/Mantra.js";

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

export const getAdminMantras = async (req, res, next) => {
  try {
    const mantras = await Mantra.find().populate("chakraId", "displayName name").sort({ createdAt: -1 });

    const normalized = mantras.map((mantra) => ({
      ...mantra.toObject(),
      chakraId: mantra.chakraId?._id || mantra.chakraId,
      chakraName: mantra.chakraId?.displayName,
    }));

    ok(res, normalized);
  } catch (error) {
    next(error);
  }
};

export const createMantra = async (req, res, next) => {
  try {
    const mantra = await Mantra.create(req.body);
    ok(res, mantra, "Mantra created.");
  } catch (error) {
    next(error);
  }
};

export const updateMantra = async (req, res, next) => {
  try {
    const mantra = await Mantra.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!mantra) {
      return res.status(404).json({ success: false, message: "Mantra not found." });
    }

    ok(res, mantra, "Mantra updated.");
  } catch (error) {
    next(error);
  }
};

export const deleteMantra = async (req, res, next) => {
  try {
    const mantra = await Mantra.findByIdAndDelete(req.params.id);

    if (!mantra) {
      return res.status(404).json({ success: false, message: "Mantra not found." });
    }

    ok(res, mantra, "Mantra deleted.");
  } catch (error) {
    next(error);
  }
};