import Question from "../models/Question.js";
import Option from "../models/Option.js";

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

export const getQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({ isActive: true }).sort({ sortOrder: 1 });

    const questionIds = questions.map((question) => question._id);
    const options = await Option.find({ questionId: { $in: questionIds } }).sort({
      sortOrder: 1,
    });

    const questionsWithOptions = questions.map((question) => ({
      ...question.toObject(),
      options: options.filter(
        (option) => String(option.questionId) === String(question._id)
      ),
    }));

    ok(res, questionsWithOptions);
  } catch (error) {
    next(error);
  }
};

export const getQuestionById = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    const options = await Option.find({ questionId: question._id }).sort({
      sortOrder: 1,
    });

    ok(res, {
      ...question.toObject(),
      options,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find().sort({ sortOrder: 1, createdAt: -1 });
    ok(res, questions);
  } catch (error) {
    next(error);
  }
};

export const createQuestion = async (req, res, next) => {
  try {
    const question = await Question.create(req.body);
    ok(res, question, "Question created.");
  } catch (error) {
    next(error);
  }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    ok(res, question, "Question updated.");
  } catch (error) {
    next(error);
  }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    await Option.deleteMany({ questionId: question._id });

    ok(res, question, "Question and related options deleted.");
  } catch (error) {
    next(error);
  }
};

export const reorderQuestions = async (req, res, next) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "items must be an array of { id, sortOrder }.",
      });
    }

    await Promise.all(
      items.map((item) =>
        Question.findByIdAndUpdate(item.id, { sortOrder: item.sortOrder })
      )
    );

    const questions = await Question.find().sort({ sortOrder: 1 });
    ok(res, questions, "Questions reordered.");
  } catch (error) {
    next(error);
  }
};