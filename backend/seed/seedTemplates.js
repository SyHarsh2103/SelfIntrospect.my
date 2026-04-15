import QuestionnaireTemplate from "../models/QuestionnaireTemplate.js";

const templates = [
  {
    name: "New Seeker Basic Guidance",
    key: "new_seeker_basic",
    audienceType: "newSeeker",
    description:
      "For people new to Sahajayoga. Uses simple emotional, mental, and life-area questions without heavy vibration language.",
    introText:
      "This path is for new seekers. The questions are simple and do not require understanding vibrations.",
    resultStyle: "simple",
    sortOrder: 1,
  },
  {
    name: "Beginner Sahajayogi Guidance",
    key: "beginner_sahajayogi",
    audienceType: "beginner",
    description:
      "For people practicing Sahajayoga but not yet clearly understanding vibrations.",
    introText:
      "This path is for Sahajayogis who meditate but may not clearly understand vibrations yet.",
    resultStyle: "guided",
    sortOrder: 2,
  },
  {
    name: "Regular Sahajayogi Guidance",
    key: "regular_sahajayogi",
    audienceType: "regular",
    description:
      "For regular Sahajayogis who understand basic chakra and nadi concepts.",
    introText:
      "This path includes meditation quality, mental/emotional state, and basic subtle-system indicators.",
    resultStyle: "detailed",
    sortOrder: 3,
  },
  {
    name: "Advanced Vibration-Based Guidance",
    key: "advanced_vibration_guidance",
    audienceType: "advanced",
    description:
      "For vibration-aware Sahajayogis who can identify catching, heat, cool breeze, and channel tendencies.",
    introText:
      "This path uses more direct vibration and subtle-system questions.",
    resultStyle: "advanced",
    sortOrder: 4,
  },
];

export const seedTemplates = async () => {
  await QuestionnaireTemplate.deleteMany({});
  await QuestionnaireTemplate.insertMany(templates);
  console.log("Questionnaire templates seeded");
};