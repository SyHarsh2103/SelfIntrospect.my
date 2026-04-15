import ResultHistory from "../models/ResultHistory.js";

const ok = (res, data, message = "Success") =>
  res.json({ success: true, message, data });

const mostCommon = (items, key) => {
  const counts = {};

  items.forEach((item) => {
    const value = item?.[key];
    if (!value) return;
    counts[value] = (counts[value] || 0) + 1;
  });

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  if (!sorted.length) return null;

  return {
    value: sorted[0][0],
    count: sorted[0][1],
  };
};

export const getAnalytics = async (req, res, next) => {
  try {
    const results = await ResultHistory.find().sort({ createdAt: -1 }).limit(500);

    const totalCompletions = await ResultHistory.countDocuments();

    const confidenceCounts = results.reduce((acc, item) => {
      const confidence = item.confidence || "Unknown";
      acc[confidence] = (acc[confidence] || 0) + 1;
      return acc;
    }, {});

    ok(res, {
      totalCompletions,
      mostCommonPrimaryChakra: mostCommon(results, "primaryChakra"),
      mostCommonDominantNadi: mostCommon(results, "dominantNadi"),
      confidenceCounts,
      recentResults: results.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
};

export const getResultHistory = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      ResultHistory.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      ResultHistory.countDocuments(),
    ]);

    ok(res, {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};