import Nadi from "../models/Nadi.js";

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

export const getNadis = async (req, res, next) => {
  try {
    const nadis = await Nadi.find().sort({ createdAt: 1 });
    ok(res, nadis);
  } catch (error) {
    next(error);
  }
};

export const getAdminNadis = getNadis;

export const updateNadi = async (req, res, next) => {
  try {
    const nadi = await Nadi.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!nadi) {
      return res.status(404).json({ success: false, message: "Nadi not found." });
    }

    ok(res, nadi, "Nadi updated.");
  } catch (error) {
    next(error);
  }
};