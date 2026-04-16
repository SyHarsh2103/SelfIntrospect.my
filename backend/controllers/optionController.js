import Option from "../models/Option.js";

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

const parseJsonField = (value, fallback = {}) => {
  if (!value) return fallback;

  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : fallback;
    } catch {
      return fallback;
    }
  }

  return fallback;
};

const normalizeOptionPayload = (body = {}) => {
  return {
    questionId: body.questionId,
    label: String(body.label || "").trim(),
    value: String(body.value || "").trim(),
    isNeutral: Boolean(body.isNeutral),
    chakraScores: parseJsonField(body.chakraScores, {}),
    nadiScores: parseJsonField(body.nadiScores, {}),
    description: String(body.description || "").trim(),
    explanation: String(body.explanation || "").trim(),
    reflection: String(body.reflection || "").trim(),
    multiplierValue: Number(body.multiplierValue || 1),
    sortOrder: Number(body.sortOrder || 0),
  };
};

export const getAdminOptions = async (req, res, next) => {
  try {
    const options = await Option.find()
      .populate("questionId", "questionText sortOrder")
      .sort({ sortOrder: 1, createdAt: -1 });

    const normalized = options.map((option) => ({
      ...option.toObject(),
      questionId: option.questionId?._id || option.questionId,
      questionText: option.questionId?.questionText,
      questionSortOrder: option.questionId?.sortOrder,
    }));

    ok(res, normalized);
  } catch (error) {
    next(error);
  }
};

export const createOption = async (req, res, next) => {
  try {
    const payload = normalizeOptionPayload(req.body);

    const option = await Option.create(payload);
    ok(res, option, "Option created.");
  } catch (error) {
    next(error);
  }
};

export const updateOption = async (req, res, next) => {
  try {
    const payload = normalizeOptionPayload(req.body);

    const option = await Option.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!option) {
      return res
        .status(404)
        .json({ success: false, message: "Option not found." });
    }

    ok(res, option, "Option updated.");
  } catch (error) {
    next(error);
  }
};

export const deleteOption = async (req, res, next) => {
  try {
    const option = await Option.findByIdAndDelete(req.params.id);

    if (!option) {
      return res
        .status(404)
        .json({ success: false, message: "Option not found." });
    }

    ok(res, option, "Option deleted.");
  } catch (error) {
    next(error);
  }
};