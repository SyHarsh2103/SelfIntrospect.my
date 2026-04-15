import QuestionnaireTemplate from "../models/QuestionnaireTemplate.js";

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

export const getPublicTemplates = async (req, res, next) => {
  try {
    const templates = await QuestionnaireTemplate.find({ isActive: true }).sort({
      sortOrder: 1,
    });

    ok(res, templates);
  } catch (error) {
    next(error);
  }
};

export const getAdminTemplates = async (req, res, next) => {
  try {
    const templates = await QuestionnaireTemplate.find().sort({ sortOrder: 1 });
    ok(res, templates);
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req, res, next) => {
  try {
    const template = await QuestionnaireTemplate.create(req.body);
    ok(res, template, "Questionnaire template created.");
  } catch (error) {
    next(error);
  }
};

export const updateTemplate = async (req, res, next) => {
  try {
    const template = await QuestionnaireTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found.",
      });
    }

    ok(res, template, "Template updated.");
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req, res, next) => {
  try {
    const template = await QuestionnaireTemplate.findByIdAndDelete(req.params.id);

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Template not found.",
      });
    }

    ok(res, template, "Template deleted.");
  } catch (error) {
    next(error);
  }
};