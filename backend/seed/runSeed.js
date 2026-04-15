import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectDB } from "../config/db.js";

import Chakra from "../models/Chakra.js";
import Nadi from "../models/Nadi.js";
import ContentBlock from "../models/ContentBlock.js";
import Question from "../models/Question.js";
import Option from "../models/Option.js";
import Remedy from "../models/Remedy.js";
import Mantra from "../models/Mantra.js";
import AdminUser from "../models/AdminUser.js";

import {
  chakraSeeds,
  nadiSeeds,
  contentSeeds,
  questionsSeed,
} from "./seedData.js";

import { seedTemplates } from "./seedTemplates.js";

const remedySeeds = [
  {
    title: "General Cleansing",
    chakraNames: [],
    nadiNames: [],
    steps: [
      "Raise Kundalini and give yourself a bandhan.",
      "Do a footsoak with salt water for 10–15 minutes.",
      "Sit in meditation with attention on Sahasrara.",
    ],
    duration: "10–15 minutes",
    notes: "This is shown as supportive baseline guidance on every result.",
    priority: 1,
  },
  {
    title: "Mooladhara Grounding Support",
    chakraNames: ["mooladhara"],
    nadiNames: [],
    steps: [
      "Sit calmly with attention at the base of the spine.",
      "Keep the attention innocent, simple, and grounded.",
      "Spend a few minutes barefoot on natural ground if possible.",
    ],
    duration: "10 minutes",
    notes: "Helpful when groundedness, purity, or stability feels weak.",
    priority: 2,
  },
  {
    title: "Swadhisthana Rest and Attention Support",
    chakraNames: ["swadhisthana"],
    nadiNames: [],
    steps: [
      "Reduce excessive planning and mental overactivity.",
      "Rest the attention and avoid forcing concentration.",
      "Meditate gently with simple awareness.",
    ],
    duration: "10 minutes",
    notes: "Helpful when the mind feels overactive or attention feels scattered.",
    priority: 2,
  },
  {
    title: "Nabhi Satisfaction Support",
    chakraNames: ["nabhi"],
    nadiNames: [],
    steps: [
      "Bring attention to satisfaction and peace.",
      "Keep meals and daily routine simple and balanced.",
      "Observe whether dissatisfaction is disturbing your attention.",
    ],
    duration: "Daily reflection",
    notes: "Helpful when satisfaction, nourishment, or household peace feels disturbed.",
    priority: 2,
  },
  {
    title: "Void Guru Principle Support",
    chakraNames: ["void"],
    nadiNames: [],
    steps: [
      "Sit with attention on the sense of inner guidance.",
      "Reflect on balance, discipline, and dharma.",
      "Avoid extremes and return to simple meditation.",
    ],
    duration: "10 minutes",
    notes: "Helpful when belonging, guidance, or balance feels disturbed.",
    priority: 2,
  },
  {
    title: "Heart Reassurance Practice",
    chakraNames: ["heart"],
    nadiNames: [],
    steps: [
      "Place your right hand on the heart.",
      "Take a few calm breaths.",
      "Use a gentle affirmation of confidence, love, and security.",
    ],
    duration: "5–10 minutes",
    notes: "Helpful when fear, insecurity, or lack of confidence is present.",
    priority: 2,
  },
  {
    title: "Vishuddhi Witness Support",
    chakraNames: ["vishuddhi"],
    nadiNames: [],
    steps: [
      "Avoid self-blame and guilt.",
      "Sit in witness state and watch thoughts calmly.",
      "Gargle gently with salt water if appropriate.",
    ],
    duration: "5–10 minutes",
    notes: "Helpful when guilt, communication difficulty, or throat discomfort is present.",
    priority: 2,
  },
  {
    title: "Agnya Forgiveness Support",
    chakraNames: ["agnya"],
    nadiNames: [],
    steps: [
      "Place attention gently at the forehead.",
      "Say sincerely: I forgive everyone and I forgive myself.",
      "Do not think about individual names; keep it general and heartfelt.",
    ],
    duration: "5–10 minutes",
    notes: "Helpful when resentment, ego, conditioning, or pressure in the head is present.",
    priority: 2,
  },
  {
    title: "Sahasrara Meditation Support",
    chakraNames: ["sahasrara"],
    nadiNames: [],
    steps: [
      "Keep attention softly at the top of the head.",
      "Sit in silence without forcing any experience.",
      "Allow the attention to become calm and open.",
    ],
    duration: "10–15 minutes",
    notes: "Helpful when connection, silence, or integration feels weak.",
    priority: 2,
  },
  {
    title: "Left Channel Balancing",
    chakraNames: [],
    nadiNames: ["leftNadi"],
    steps: [
      "Keep the left side warm and balanced.",
      "Use candle treatment only if you already know the Sahajayoga method.",
      "Avoid excessive dwelling on past memories or emotional heaviness.",
    ],
    duration: "10–15 minutes",
    notes: "Helpful when sadness, heaviness, lethargy, or past orientation is strong.",
    priority: 3,
  },
  {
    title: "Right Channel Cooling",
    chakraNames: [],
    nadiNames: ["rightNadi"],
    steps: [
      "Slow down activity and reduce rushing.",
      "Use cooling support if the body or attention feels heated.",
      "Avoid overplanning and allow the attention to settle.",
    ],
    duration: "10–15 minutes",
    notes: "Helpful when heat, irritation, overwork, or future planning is strong.",
    priority: 3,
  },
  {
    title: "Center Channel Steadiness",
    chakraNames: [],
    nadiNames: ["centerNadi"],
    steps: [
      "Sit straight and keep attention in the present.",
      "Raise Kundalini and give bandhan before meditation.",
      "Keep attention at Sahasrara and remain silent.",
    ],
    duration: "10 minutes",
    notes: "Helpful for general balance and steady meditation.",
    priority: 3,
  },
];

const mantraSeeds = [
  {
    chakraName: "mooladhara",
    title: "Shri Ganesha Mantra",
    mantraText:
      "Om Twameva Sakshat Shri Ganesha Sakshat Shri Adi Shakti Mataji Shri Nirmala Devyai Namo Namah",
    phoneticText:
      "Om Tvam-eva Sakshaat Shree Ganesha Sakshaat Shree Adi Shakti Mataji Shree Nirmala Devyai Namo Namah",
    usageNotes: "May support innocence, purity, and groundedness.",
    repetitions: "21 or 108 times",
  },
  {
    chakraName: "swadhisthana",
    title: "Shri Saraswati Mantra",
    mantraText:
      "Om Twameva Sakshat Shri Saraswati Sakshat Shri Adi Shakti Mataji Shri Nirmala Devyai Namo Namah",
    phoneticText:
      "Om Tvam-eva Sakshaat Shree Saraswati Sakshaat Shree Adi Shakti Mataji Shree Nirmala Devyai Namo Namah",
    usageNotes: "May support pure knowledge, attention, and creativity.",
    repetitions: "21 or 108 times",
  },
  {
    chakraName: "nabhi",
    title: "Shri Lakshmi Narayana Mantra",
    mantraText:
      "Om Twameva Sakshat Shri Lakshmi Narayana Sakshat Shri Adi Shakti Mataji Shri Nirmala Devyai Namo Namah",
    phoneticText:
      "Om Tvam-eva Sakshaat Shree Lakshmi Narayana Sakshaat Shree Adi Shakti Mataji Shree Nirmala Devyai Namo Namah",
    usageNotes: "May support satisfaction, peace, nourishment, and balance.",
    repetitions: "21 or 108 times",
  },
  {
    chakraName: "void",
    title: "Shri Adi Guru Dattatreya Mantra",
    mantraText:
      "Om Twameva Sakshat Shri Adi Guru Dattatreya Sakshat Shri Adi Shakti Mataji Shri Nirmala Devyai Namo Namah",
    phoneticText:
      "Om Tvam-eva Sakshaat Shree Adi Guru Dattatreya Sakshaat Shree Adi Shakti Mataji Shree Nirmala Devyai Namo Namah",
    usageNotes: "May support the guru principle, dharma, and inner guidance.",
    repetitions: "21 times",
  },
  {
    chakraName: "heart",
    title: "Shri Jagadamba Mantra",
    mantraText:
      "Om Twameva Sakshat Shri Jagadamba Sakshat Shri Adi Shakti Mataji Shri Nirmala Devyai Namo Namah",
    phoneticText:
      "Om Tvam-eva Sakshaat Shree Jagadamba Sakshaat Shree Adi Shakti Mataji Shree Nirmala Devyai Namo Namah",
    usageNotes: "May support love, confidence, security, and courage.",
    repetitions: "21 or 108 times",
  },
  {
    chakraName: "vishuddhi",
    title: "Shri Krishna Mantra",
    mantraText:
      "Om Twameva Sakshat Shri Krishna Sakshat Shri Adi Shakti Mataji Shri Nirmala Devyai Namo Namah",
    phoneticText:
      "Om Tvam-eva Sakshaat Shree Krishna Sakshaat Shree Adi Shakti Mataji Shree Nirmala Devyai Namo Namah",
    usageNotes: "May support communication, witness state, and freedom from guilt.",
    repetitions: "21 or 108 times",
  },
  {
    chakraName: "agnya",
    title: "Forgiveness Affirmation",
    mantraText: "I forgive everyone and I forgive myself.",
    phoneticText: "I forgive everyone and I forgive myself.",
    usageNotes: "May support forgiveness, clarity, and freedom from pressure.",
    repetitions: "108 times or as needed",
  },
  {
    chakraName: "sahasrara",
    title: "Shri Mahamaya Mantra",
    mantraText:
      "Om Twameva Sakshat Shri Mahamaya Sakshat Shri Adi Shakti Mataji Shri Nirmala Devyai Namo Namah",
    phoneticText:
      "Om Tvam-eva Sakshaat Shree Mahamaya Sakshaat Shree Adi Shakti Mataji Shree Nirmala Devyai Namo Namah",
    usageNotes: "May support silence, integration, and connection.",
    repetitions: "21 or 108 times",
  },
];

async function run() {
  try {
    await connectDB();
    console.log("MongoDB connected for seeding.");

    await Promise.all([
      Chakra.deleteMany({}),
      Nadi.deleteMany({}),
      ContentBlock.deleteMany({}),
      Question.deleteMany({}),
      Option.deleteMany({}),
      Remedy.deleteMany({}),
      Mantra.deleteMany({}),
    ]);

    await seedTemplates();

    const chakras = await Chakra.insertMany(chakraSeeds);
    const nadis = await Nadi.insertMany(nadiSeeds);
    await ContentBlock.insertMany(contentSeeds);

    for (const item of questionsSeed) {
      const question = await Question.create({
        sortOrder: item.sortOrder,
        category: item.category,
        type: item.type,
        questionText: item.questionText,
        helpText: item.helpText || "",
        templateKeys: item.templateKeys || ["regular_sahajayogi"],
        audienceTypes: item.audienceTypes || ["regular"],
        difficultyLevel: item.difficultyLevel || "intermediate",
        isActive: item.isActive ?? true,
      });

      for (const [index, option] of item.options.entries()) {
        await Option.create({
          questionId: question._id,
          label: option.label,
          value: option.value,
          isNeutral: option.isNeutral || false,
          chakraScores: option.chakraScores || {},
          nadiScores: option.nadiScores || {},
          multiplierValue: option.multiplierValue || 1,
          sortOrder: index + 1,
        });
      }
    }

    const chakraByName = Object.fromEntries(
      chakras.map((item) => [item.name, item])
    );

    const nadiByName = Object.fromEntries(nadis.map((item) => [item.name, item]));

    for (const remedy of remedySeeds) {
      const chakraIds = (remedy.chakraNames || [])
        .map((name) => chakraByName[name]?._id)
        .filter(Boolean);

      const nadiIds = (remedy.nadiNames || [])
        .map((name) => nadiByName[name]?._id)
        .filter(Boolean);

      await Remedy.create({
        title: remedy.title,
        steps: remedy.steps,
        duration: remedy.duration,
        notes: remedy.notes,
        priority: remedy.priority || 2,
        chakraIds,
        nadiIds,
        isActive: remedy.isActive ?? true,
      });
    }

    for (const mantra of mantraSeeds) {
      const chakra = chakraByName[mantra.chakraName];

      if (!chakra?._id) continue;

      await Mantra.create({
        chakraId: chakra._id,
        title: mantra.title,
        mantraText: mantra.mantraText,
        phoneticText: mantra.phoneticText,
        usageNotes: mantra.usageNotes,
        repetitions: mantra.repetitions,
        isActive: mantra.isActive ?? true,
      });
    }

    const email = (
      process.env.ADMIN_SEED_EMAIL || "admin@example.com"
    ).toLowerCase();

    const existingAdmin = await AdminUser.findOne({ email });

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(
        process.env.ADMIN_SEED_PASSWORD || "ChangeMe123!",
        10
      );

      await AdminUser.create({
        email,
        passwordHash,
        role: "superAdmin",
        isActive: true,
      });
    }

    console.log("Seed completed successfully.");
    console.log(`Seed admin email: ${email}`);
    console.log(
      `Seed admin password: ${process.env.ADMIN_SEED_PASSWORD || "ChangeMe123!"}`
    );

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

run();