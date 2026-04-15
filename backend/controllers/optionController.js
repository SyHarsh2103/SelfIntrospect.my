import Option from "../models/Option.js";

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

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
    const option = await Option.create(req.body);
    ok(res, option, "Option created.");
  } catch (error) {
    next(error);
  }
};

export const updateOption = async (req, res, next) => {
  try {
    const option = await Option.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!option) {
      return res.status(404).json({ success: false, message: "Option not found." });
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
      return res.status(404).json({ success: false, message: "Option not found." });
    }

    ok(res, option, "Option deleted.");
  } catch (error) {
    next(error);
  }
};