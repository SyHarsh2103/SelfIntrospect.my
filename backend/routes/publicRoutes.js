import express from "express";
import {
  getQuestions,
  getQuestionById,
  getChakras,
  getNadis,
  getContentBlock,
  submitQuestionnaire,
  getResultBySession,
} from "../controllers/publicController.js";
import { getPublicTemplates } from "../controllers/templateController.js";

const router = express.Router();

router.get("/questionnaire-templates", getPublicTemplates);
router.get("/questions", getQuestions);
router.get("/questions/:id", getQuestionById);
router.get("/chakras", getChakras);
router.get("/nadis", getNadis);
router.get("/content/:key", getContentBlock);
router.post("/submit", submitQuestionnaire);
router.get("/result/:sessionId", getResultBySession);

export default router;