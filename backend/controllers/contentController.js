import ContentBlock from "../models/ContentBlock.js";

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

export const getContentBlock = async (req, res, next) => {
  try {
    const block = await ContentBlock.findOne({ key: req.params.key });

    if (!block) {
      return res.status(404).json({ success: false, message: "Content block not found." });
    }

    ok(res, block);
  } catch (error) {
    next(error);
  }
};

export const getAdminContentBlocks = async (req, res, next) => {
  try {
    const blocks = await ContentBlock.find().sort({ key: 1 });
    ok(res, blocks);
  } catch (error) {
    next(error);
  }
};

export const updateContentBlock = async (req, res, next) => {
  try {
    const block = await ContentBlock.findOneAndUpdate(
      { key: req.params.key },
      {
        title: req.body.title,
        content: req.body.content,
        updatedBy: req.admin?._id,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!block) {
      return res.status(404).json({ success: false, message: "Content block not found." });
    }

    ok(res, block, "Content updated.");
  } catch (error) {
    next(error);
  }
};