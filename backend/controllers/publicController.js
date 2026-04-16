import crypto from "crypto";
import { nanoid } from "nanoid";

import Question from "../models/Question.js";
import Option from "../models/Option.js";
import Chakra from "../models/Chakra.js";
import Nadi from "../models/Nadi.js";
import Remedy from "../models/Remedy.js";
import Mantra from "../models/Mantra.js";
import ContentBlock from "../models/ContentBlock.js";
import ResultHistory from "../models/ResultHistory.js";
import { calculateResult } from "../services/scoringEngine.js";

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

const CHAKRA_LABELS = {
  mooladhara: "Mooladhara",
  swadhisthana: "Swadhisthana",
  nabhi: "Nabhi",
  void: "Void",
  heart: "Heart",
  vishuddhi: "Vishuddhi",
  agnya: "Agnya",
  sahasrara: "Sahasrara",
};

const NADI_LABELS = {
  leftNadi: "Left Channel",
  rightNadi: "Right Channel",
  centerNadi: "Center Channel",
};

const ATTENTION_STATUSES = [
  "Strong Attention",
  "Need to Work",
  "Mild Attention",
];

const hashIp = (ip = "") =>
  crypto.createHash("sha256").update(ip).digest("hex");

const getStatus = (score = 0) => {
  if (score <= 0) {
    return { status: "Balanced", priority: 4, requiredAttention: false };
  }
  if (score <= 2) {
    return { status: "Mild Attention", priority: 3, requiredAttention: true };
  }
  if (score <= 5) {
    return { status: "Need to Work", priority: 2, requiredAttention: true };
  }
  return { status: "Strong Attention", priority: 1, requiredAttention: true };
};

const sortByPriorityAndScore = (items = []) =>
  [...items].sort((a, b) => {
    if ((a.priority || 99) !== (b.priority || 99)) {
      return (a.priority || 99) - (b.priority || 99);
    }
    return Number(b.score || 0) - Number(a.score || 0);
  });

const buildRankingsFromStoredScores = (chakraScores = {}, nadiScores = {}) => {
  const chakraRanking = Object.entries(chakraScores || {})
    .map(([key, score]) => {
      const normalizedScore = Number(score || 0);
      return {
        key,
        label: CHAKRA_LABELS[key] || key,
        score: normalizedScore,
        ...getStatus(normalizedScore),
      };
    })
    .sort((a, b) => b.score - a.score);
  const nadiRanking = Object.entries(nadiScores || {})
    .map(([key, score]) => {
      const normalizedScore = Number(score || 0);
      return {
        key,
        label: NADI_LABELS[key] || key,
        score: normalizedScore,
        ...getStatus(normalizedScore),
      };
    })
    .sort((a, b) => b.score - a.score);
  return {
    chakraRanking,
    nadiRanking,
    chakraAnalysis: chakraRanking,
    nadiAnalysis: nadiRanking,
    requiredChakras: sortByPriorityAndScore(
      chakraRanking.filter((item) => item.requiredAttention)
    ),
    balancedChakras: chakraRanking.filter((item) => !item.requiredAttention),
    requiredNadis: sortByPriorityAndScore(
      nadiRanking.filter((item) => item.requiredAttention)
    ),
    topChakra: chakraRanking[0] || null,
    secondChakra: chakraRanking[1] || null,
    topNadi: nadiRanking[0] || null,
  };
};

export const getQuestions = async (req, res, next) => {
  try {
    const templateKey = req.query.templateKey || "regular_sahajayogi";
    const questions = await Question.find({
      isActive: true,
      templateKeys: templateKey,
    }).sort({ sortOrder: 1 });
    const questionIds = questions.map((question) => question._id);
    const options = await Option.find({
      questionId: { $in: questionIds },
    }).sort({ sortOrder: 1, createdAt: 1 });
    const result = questions.map((question) => ({
      ...question.toObject(),
      options: options.filter(
        (option) => String(option.questionId) === String(question._id)
      ),
    }));
    ok(res, result);
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
      createdAt: 1,
    });
    ok(res, {
      ...question.toObject(),
      options,
    });
  } catch (error) {
    next(error);
  }
};

export const getChakras = async (req, res, next) => {
  try {
    const chakras = await Chakra.find().sort({ createdAt: 1 });
    ok(res, chakras);
  } catch (error) {
    next(error);
  }
};

export const getNadis = async (req, res, next) => {
  try {
    const nadis = await Nadi.find().sort({ createdAt: 1 });
    ok(res, nadis);
  } catch (error) {
    next(error);
  }
};

export const getContentByKey = async (req, res, next) => {
  try {
    const block = await ContentBlock.findOne({ key: req.params.key });
    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Content block not found.",
      });
    }
    ok(res, block);
  } catch (error) {
    next(error);
  }
};

export const getContentBlock = getContentByKey;

const getRequiredKeys = ({ items = [], fallbackKey = null, limit = 4 }) => {
  const keys = sortByPriorityAndScore(items)
    .filter((item) => ATTENTION_STATUSES.includes(item.status))
    .slice(0, limit)
    .map((item) => item.key)
    .filter(Boolean);
  if (keys.length) return keys;
  return fallbackKey ? [fallbackKey] : [];
};

const findMatchingRemedies = async ({
  primaryChakra,
  dominantNadi,
  confidence,
  requiredChakras = [],
  requiredNadis = [],
}) => {
  if (confidence === "Inconclusive") return [];
  const chakraNames = getRequiredKeys({
    items: requiredChakras,
    fallbackKey: primaryChakra,
    limit: 4,
  });
  const nadiNames = getRequiredKeys({
    items: requiredNadis,
    fallbackKey: dominantNadi,
    limit: 2,
  });
  const [chakras, nadis] = await Promise.all([
    Chakra.find({ name: { $in: chakraNames } }),
    Nadi.find({ name: { $in: nadiNames } }),
  ]);
  const orConditions = [];
  chakras.forEach((chakra) => {
    if (chakra?._id) orConditions.push({ chakraIds: chakra._id });
  });
  nadis.forEach((nadi) => {
    if (nadi?._id) orConditions.push({ nadiIds: nadi._id });
  });
  if (!orConditions.length) return [];
  return Remedy.find({
    isActive: true,
    $or: orConditions,
  })
    .sort({ priority: 1, createdAt: -1 })
    .limit(10);
};

const findMatchingMantras = async ({
  primaryChakra,
  confidence,
  requiredChakras = [],
}) => {
  if (confidence === "Inconclusive") return [];
  const chakraNames = getRequiredKeys({
    items: requiredChakras,
    fallbackKey: primaryChakra,
    limit: 4,
  });
  if (!chakraNames.length) return [];
  const chakras = await Chakra.find({ name: { $in: chakraNames } });
  const chakraIds = chakras.map((chakra) => chakra._id);
  if (!chakraIds.length) return [];
  return Mantra.find({
    chakraId: { $in: chakraIds },
    isActive: true,
  })
    .populate("chakraId", "name displayName")
    .limit(8);
};

const buildDetailedAnswers = ({ answers = [], questions = [], options = [] }) => {
  const questionMap = new Map(
    questions.map((question) => [
      String(question._id),
      question.toObject?.() || question,
    ])
  );
  const optionMap = new Map(
    options.map((option) => [String(option._id), option.toObject?.() || option])
  );
  return answers.map((answer, index) => {
    const questionId = String(answer.questionId?._id || answer.questionId || "");
    const question = questionMap.get(questionId);
    const selectedOptionIds = Array.isArray(answer.selectedOptionIds)
      ? answer.selectedOptionIds.map((id) => String(id?._id || id))
      : [];
    const selectedOptions = selectedOptionIds
      .map((optionId) => optionMap.get(optionId))
      .filter(Boolean)
      .map((option) => ({
        _id: option._id,
        label: option.label,
        value: option.value,
        isNeutral: option.isNeutral || false,
        chakraScores: option.chakraScores || {},
        nadiScores: option.nadiScores || {},
        multiplierValue: option.multiplierValue || 1,
        explanation:
          option.explanation ||
          option.reflection ||
          option.description ||
          "",
      }));
    return {
      index: index + 1,
      questionId,
      questionText: question?.questionText || `Question ${index + 1}`,
      helpText: question?.helpText || "",
      category: question?.category || "general",
      type: question?.type || "single-choice",
      selectedOptionIds,
      selectedOptions,
      selectedOptionLabels: selectedOptions.map((option) => option.label),
      intensityLevel: answer.intensityLevel || null,
    };
  });
};

export const submitQuestionnaire = async (req, res, next) => {
  try {
    const { sessionId: incomingSessionId, answers, userInfo = {} } = req.body;
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Answers are required.",
      });
    }
    const normalizedUserInfo = {
      name: String(userInfo.name || "").trim(),
      phone: String(userInfo.phone || "").trim(),
      email: String(userInfo.email || "").trim().toLowerCase(),
    };
    const sessionId = incomingSessionId || nanoid(16);
    const questions = await Question.find({ isActive: true }).sort({
      sortOrder: 1,
    });
    const questionIds = questions.map((question) => question._id);
    const options = await Option.find({
      questionId: { $in: questionIds },
    });
    const result = calculateResult({
      questions,
      options,
      answers,
    });
    const remedies = await findMatchingRemedies({
      primaryChakra: result.primaryChakra,
      dominantNadi: result.dominantNadi,
      confidence: result.confidence,
      requiredChakras: result.requiredChakras,
      requiredNadis: result.requiredNadis,
    });
    const mantras = await findMatchingMantras({
      primaryChakra: result.primaryChakra,
      confidence: result.confidence,
      requiredChakras: result.requiredChakras,
    });
    const answersDetailed = buildDetailedAnswers({
      answers,
      questions,
      options,
    });
    const saved = await ResultHistory.create({
      sessionId,
      userInfo: normalizedUserInfo,
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
        userInfo: saved.userInfo,
        answersDetailed,
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

export const updateResultUserInfo = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { userInfo = {} } = req.body;
    const normalizedUserInfo = {
      name: String(userInfo.name || "").trim(),
      phone: String(userInfo.phone || "").trim(),
      email: String(userInfo.email || "").trim().toLowerCase(),
    };
    if (!normalizedUserInfo.name || normalizedUserInfo.name.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid full name.",
      });
    }
    if (
      !normalizedUserInfo.phone ||
      normalizedUserInfo.phone.replace(/[^\d+]/g, "").length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number.",
      });
    }
    if (
      !normalizedUserInfo.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedUserInfo.email)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email ID.",
      });
    }
    const result = await ResultHistory.findOneAndUpdate(
      { sessionId },
      { $set: { userInfo: normalizedUserInfo } },
      { new: true }
    );
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found.",
      });
    }
    ok(
      res,
      {
        sessionId: result.sessionId,
        userInfo: result.userInfo,
      },
      "User details saved successfully."
    );
  } catch (error) {
    next(error);
  }
};

export const getResultBySessionId = async (req, res, next) => {
  try {
    const result = await ResultHistory.findOne({
      sessionId: req.params.sessionId,
    }).sort({ createdAt: -1 });
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Result not found.",
      });
    }
    const rankingData = buildRankingsFromStoredScores(
      result.chakraScores,
      result.nadiScores
    );
    const [remedies, mantras] = await Promise.all([
      findMatchingRemedies({
        primaryChakra: result.primaryChakra,
        dominantNadi: result.dominantNadi,
        confidence: result.confidence,
        requiredChakras: rankingData.requiredChakras,
        requiredNadis: rankingData.requiredNadis,
      }),
      findMatchingMantras({
        primaryChakra: result.primaryChakra,
        confidence: result.confidence,
        requiredChakras: rankingData.requiredChakras,
      }),
    ]);
    const storedAnswers = Array.isArray(result.answers) ? result.answers : [];
    const questionIds = storedAnswers
      .map((answer) => answer.questionId)
      .filter(Boolean);
    const selectedOptionIds = storedAnswers.flatMap((answer) =>
      Array.isArray(answer.selectedOptionIds) ? answer.selectedOptionIds : []
    );
    const [questions, options] = await Promise.all([
      Question.find({ _id: { $in: questionIds } }).sort({ sortOrder: 1 }),
      Option.find({ _id: { $in: selectedOptionIds } }).sort({ sortOrder: 1 }),
    ]);
    const answersDetailed = buildDetailedAnswers({
      answers: storedAnswers,
      questions,
      options,
    });
    const explanation =
      result.confidence === "Inconclusive"
        ? "Your answers show a mixed pattern across several chakras and channels. This may indicate that general cleansing, daily meditation, and direct guidance from experienced Sahajayogis may be more suitable than focusing on one single area."
        : `The answer pattern shows ${
            rankingData.requiredChakras.length
              ? rankingData.requiredChakras
                  .map((item) => item.label)
                  .join(", ")
              : "no strong chakra area"
          } may need observation. The strongest chakra tendency is ${
            rankingData.topChakra?.label || "not clearly defined"
          }. Among the channels, ${
            rankingData.topNadi?.label || "no channel"
          } appears more active. Please read this as gentle supportive guidance rather than a final conclusion.`;
    ok(res, {
      ...result.toObject(),
      hasUserInfo: Boolean(
        result.userInfo?.name && result.userInfo?.phone && result.userInfo?.email
      ),
      primaryChakraLabel: result.primaryChakra
        ? CHAKRA_LABELS[result.primaryChakra]
        : null,
      secondaryChakraLabel: result.secondaryChakra
        ? CHAKRA_LABELS[result.secondaryChakra]
        : null,
      dominantNadiLabel: result.dominantNadi
        ? NADI_LABELS[result.dominantNadi]
        : null,
      ...rankingData,
      answersDetailed,
      explanation,
      remedies,
      mantras,
      remedyIds: remedies,
      mantraIds: mantras,
    });
  } catch (error) {
    next(error);
  }
};

export const getResultBySession = getResultBySessionId;