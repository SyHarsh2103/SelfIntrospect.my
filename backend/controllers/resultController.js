import ResultHistory from "../models/ResultHistory.js";
import Remedy from "../models/Remedy.js";
import Mantra from "../models/Mantra.js";

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

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

const buildRankingsFromStoredScores = (chakraScores = {}, nadiScores = {}) => {
  const chakraRanking = Object.entries(chakraScores)
    .map(([key, score]) => ({
      key,
      label: CHAKRA_LABELS[key] || key,
      score: Number(score || 0),
    }))
    .sort((a, b) => b.score - a.score);

  const nadiRanking = Object.entries(nadiScores)
    .map(([key, score]) => ({
      key,
      label: NADI_LABELS[key] || key,
      score: Number(score || 0),
    }))
    .sort((a, b) => b.score - a.score);

  return {
    chakraRanking,
    nadiRanking,
    topChakra: chakraRanking[0] || null,
    secondChakra: chakraRanking[1] || null,
    topNadi: nadiRanking[0] || null,
  };
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

    const [remedies, mantras] = await Promise.all([
      Remedy.find({ _id: { $in: result.remedyIds || [] } }),
      Mantra.find({ _id: { $in: result.mantraIds || [] } }).populate(
        "chakraId",
        "name displayName"
      ),
    ]);

    const rankingData = buildRankingsFromStoredScores(
      result.chakraScores,
      result.nadiScores
    );

    const explanation =
      result.confidence === "Inconclusive"
        ? "Your answers show a mixed pattern across several chakras and channels. This may indicate that general cleansing, daily meditation, and direct guidance from experienced Sahajayogis may be more suitable than focusing on one single area."
        : `The strongest score pattern appears around ${
            rankingData.topChakra?.label || "one chakra area"
          }${
            rankingData.secondChakra?.score > 0
              ? `, with ${rankingData.secondChakra.label} also showing some activity`
              : ""
          }. Among the channels, ${
            rankingData.topNadi?.label || "one channel"
          } appears more active based on your answers. Please read this as gentle supportive guidance rather than a final conclusion.`;

    ok(res, {
      ...result.toObject(),
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