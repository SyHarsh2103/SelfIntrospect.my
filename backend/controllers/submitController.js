import crypto from "crypto";
import { nanoid } from "nanoid";

import Question from "../models/Question.js";
import Option from "../models/Option.js";
import Remedy from "../models/Remedy.js";
import Mantra from "../models/Mantra.js";
import Chakra from "../models/Chakra.js";
import Nadi from "../models/Nadi.js";
import ResultHistory from "../models/ResultHistory.js";
import { calculateResult } from "../services/scoringEngine.js";

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

const hashIp = (ip = "") => {
  return crypto.createHash("sha256").update(ip).digest("hex");
};

const findMatchingRemedies = async ({ primaryChakra, dominantNadi, confidence }) => {
  if (confidence === "Inconclusive") {
    return [];
  }

  const chakra = primaryChakra
    ? await Chakra.findOne({ name: primaryChakra })
    : null;

  const nadi = dominantNadi
    ? await Nadi.findOne({ name: dominantNadi })
    : null;

  const conditions = [{ isActive: true }];

  const orConditions = [];

  if (chakra?._id) {
    orConditions.push({ chakraIds: chakra._id });
  }

  if (nadi?._id) {
    orConditions.push({ nadiIds: nadi._id });
  }

  if (!orConditions.length) {
    return [];
  }

  conditions.push({ $or: orConditions });

  return Remedy.find({ $and: conditions })
    .sort({ priority: 1, createdAt: -1 })
    .limit(6);
};

const findMatchingMantras = async ({ primaryChakra, confidence }) => {
  if (confidence === "Inconclusive" || !primaryChakra) {
    return [];
  }

  const chakra = await Chakra.findOne({ name: primaryChakra });

  if (!chakra?._id) {
    return [];
  }

  return Mantra.find({
    chakraId: chakra._id,
    isActive: true,
  }).limit(3);
};

export const submitQuestionnaire = async (req, res, next) => {
  try {
    const { sessionId: incomingSessionId, answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Answers are required.",
      });
    }

    const sessionId = incomingSessionId || nanoid(16);

    const questions = await Question.find({ isActive: true }).sort({ sortOrder: 1 });
    const questionIds = questions.map((question) => question._id);

    const options = await Option.find({ questionId: { $in: questionIds } });

    const result = calculateResult({
      questions,
      options,
      answers,
    });

    const remedies = await findMatchingRemedies({
      primaryChakra: result.primaryChakra,
      dominantNadi: result.dominantNadi,
      confidence: result.confidence,
    });

    const mantras = await findMatchingMantras({
      primaryChakra: result.primaryChakra,
      confidence: result.confidence,
    });

    const saved = await ResultHistory.create({
      sessionId,
      answers,
      primaryChakra: result.primaryChakra,
      secondaryChakra: result.secondaryChakra,
      dominantNadi: result.dominantNadi,
      confidence: result.confidence,
      chakraScores: result.chakraScores,
      nadiScores: result.nadiScores,
      remedyIds: remedies.map((item) => item._id),
      mantraIds: mantras.map((item) => item._id),
      ipHash: hashIp(req.ip || req.headers["x-forwarded-for"] || ""),
    });

    ok(
      res,
      {
        ...result,
        sessionId,
        resultId: saved._id,
        remedies,
        mantras,
        remedyIds: remedies,
        mantraIds: mantras,
      },
      "Questionnaire submitted successfully."
    );
  } catch (error) {
    next(error);
  }
};