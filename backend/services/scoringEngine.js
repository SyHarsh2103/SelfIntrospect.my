const CHAKRA_KEYS = [
  "mooladhara",
  "swadhisthana",
  "nabhi",
  "void",
  "heart",
  "vishuddhi",
  "agnya",
  "sahasrara",
];

const NADI_KEYS = ["leftNadi", "rightNadi", "centerNadi"];

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

const INTENSITY_MULTIPLIERS = {
  1: 0.5,
  2: 0.75,
  3: 1,
  4: 1.25,
  5: 1.5,
};

const emptyChakraScores = () =>
  CHAKRA_KEYS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

const emptyNadiScores = () =>
  NADI_KEYS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {});

const addScores = (target, incoming = {}, multiplier = 1) => {
  Object.keys(target).forEach((key) => {
    target[key] += Number(incoming?.[key] || 0) * multiplier;
  });
};

const getStatus = (score = 0) => {
  if (score <= 0) {
    return {
      status: "Balanced",
      priority: 4,
      requiredAttention: false,
    };
  }

  if (score <= 2) {
    return {
      status: "Mild Attention",
      priority: 3,
      requiredAttention: true,
    };
  }

  if (score <= 5) {
    return {
      status: "Need to Work",
      priority: 2,
      requiredAttention: true,
    };
  }

  return {
    status: "Strong Attention",
    priority: 1,
    requiredAttention: true,
  };
};

const sortScores = (scores, labels) =>
  Object.entries(scores)
    .map(([key, score]) => {
      const normalizedScore = Number(score || 0);
      return {
        key,
        label: labels[key] || key,
        score: normalizedScore,
        ...getStatus(normalizedScore),
      };
    })
    .sort((a, b) => b.score - a.score);

const allScoresWithinOnePoint = (scores) => {
  const values = Object.values(scores).map((value) => Number(value || 0));
  const max = Math.max(...values);
  const min = Math.min(...values);
  return max - min <= 1;
};

const getConfidence = (chakraScores) => {
  const sorted = sortScores(chakraScores, CHAKRA_LABELS);
  const top = sorted[0];
  const second = sorted[1];
  const gap = Number(top?.score || 0) - Number(second?.score || 0);

  if (!top || top.score <= 2 || allScoresWithinOnePoint(chakraScores)) {
    return "Inconclusive";
  }

  if (top.score > 6 && gap > 3) return "High";
  if (top.score >= 3 && top.score <= 6 && gap > 2) return "Medium";
  if (top.score >= 2 && top.score <= 4 && gap <= 2) return "Low";

  return "Low";
};

const createExplanation = ({
  selectedOptions,
  topChakra,
  secondChakra,
  topNadi,
  confidence,
  requiredChakras,
}) => {
  if (confidence === "Inconclusive") {
    return "Your answers show a mixed pattern across several chakras and channels. General cleansing, daily meditation, and guidance from experienced Sahajayogis may be more suitable than focusing on one single area.";
  }

  const usefulSignals = selectedOptions
    .filter((item) => !item.isNeutral)
    .slice(0, 6)
    .map((item) => item.label);

  const signalText = usefulSignals.length
    ? usefulSignals.join(", ")
    : "the answer pattern selected during the questionnaire";

  const requiredText = requiredChakras.length
    ? requiredChakras.map((item) => item.label).join(", ")
    : "no strong chakra area";

  return `The answer pattern shows that ${requiredText} may need observation. The strongest chakra tendency is ${topChakra?.label || "not clearly defined"}${
    secondChakra?.score > 0 ? `, with ${secondChakra.label} also showing activity` : ""
  }. Among the channels, ${topNadi?.label || "no channel"} appears more active. Selected signals included: ${signalText}. Please read this as gentle supportive guidance rather than a final conclusion.`;
};

export const calculateResult = ({ questions = [], options = [], answers = [] }) => {
  const chakraScores = emptyChakraScores();
  const nadiScores = emptyNadiScores();
  const selectedOptions = [];

  const answerMap = new Map();
  answers.forEach((answer) => {
    answerMap.set(String(answer.questionId), answer);
  });

  const questionOne = questions.find((q) => Number(q.sortOrder) === 1);
  const questionTwo = questions.find((q) => Number(q.sortOrder) === 2);

  const q2Answer = questionTwo ? answerMap.get(String(questionTwo._id)) : null;
  const intensityLevel = Number(q2Answer?.intensityLevel || 3);
  const q1Multiplier = INTENSITY_MULTIPLIERS[intensityLevel] || 1;

  questions.forEach((question) => {
    const answer = answerMap.get(String(question._id));
    if (!answer) return;

    const selectedOptionIds = answer.selectedOptionIds || [];

    selectedOptionIds.forEach((optionId) => {
      const option = options.find((item) => String(item._id) === String(optionId));
      if (!option) return;

      const multiplier =
        questionOne && String(question._id) === String(questionOne._id)
          ? q1Multiplier
          : 1;

      if (!option.isNeutral) {
        addScores(chakraScores, option.chakraScores, multiplier);
        addScores(nadiScores, option.nadiScores, multiplier);
      }

      selectedOptions.push({
        questionId: question._id,
        questionText: question.questionText,
        optionId: option._id,
        label: option.label,
        isNeutral: option.isNeutral,
        chakraScores: option.chakraScores,
        nadiScores: option.nadiScores,
        appliedMultiplier: multiplier,
      });
    });
  });

  const chakraRanking = sortScores(chakraScores, CHAKRA_LABELS);
  const nadiRanking = sortScores(nadiScores, NADI_LABELS);

  const requiredChakras = chakraRanking.filter((item) => item.requiredAttention);
  const balancedChakras = chakraRanking.filter((item) => !item.requiredAttention);
  const requiredNadis = nadiRanking.filter((item) => item.requiredAttention);

  const topChakra = chakraRanking[0] || null;
  const secondChakra = chakraRanking[1] || null;
  const topNadi = nadiRanking[0] || null;

  const confidence = getConfidence(chakraScores);

  const explanation = createExplanation({
    selectedOptions,
    topChakra,
    secondChakra,
    topNadi,
    confidence,
    requiredChakras,
  });

  return {
    confidence,
    chakraScores,
    nadiScores,

    chakraRanking,
    nadiRanking,

    chakraAnalysis: chakraRanking,
    nadiAnalysis: nadiRanking,

    requiredChakras,
    balancedChakras,
    requiredNadis,

    topChakra,
    secondChakra,
    topNadi,

    selectedSignals: selectedOptions,
    explanation,
    intensityLevel,
    q1Multiplier,

    // Kept for backward compatibility with older frontend/components
    primaryChakra: confidence === "Inconclusive" ? null : topChakra?.key || null,
    primaryChakraLabel:
      confidence === "Inconclusive" ? null : topChakra?.label || null,
    secondaryChakra:
      confidence === "Inconclusive" ? null : secondChakra?.key || null,
    secondaryChakraLabel:
      confidence === "Inconclusive" ? null : secondChakra?.label || null,
    dominantNadi: topNadi?.score > 0 ? topNadi.key : null,
    dominantNadiLabel: topNadi?.score > 0 ? topNadi.label : null,
  };
};

export const evaluateSubmission = calculateResult;