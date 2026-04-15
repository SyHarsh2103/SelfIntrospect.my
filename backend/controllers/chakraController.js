import Chakra from "../models/Chakra.js";

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

export const getChakras = async (req, res, next) => {
  try {
    const chakras = await Chakra.find().sort({ createdAt: 1 });
    ok(res, chakras);
  } catch (error) {
    next(error);
  }
};

export const getAdminChakras = getChakras;

export const updateChakra = async (req, res, next) => {
  try {
    const chakra = await Chakra.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!chakra) {
      return res.status(404).json({ success: false, message: "Chakra not found." });
    }

    ok(res, chakra, "Chakra updated.");
  } catch (error) {
    next(error);
  }
};