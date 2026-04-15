import express from "express";
import {
  loginAdmin,
  forgotAdminPassword,
  verifyAdminResetOtp,
  resetAdminPassword,
  getAdminProfile,
} from "../controllers/authController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

import {
  getAdminQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
} from "../controllers/questionController.js";

import {
  getAdminOptions,
  createOption,
  updateOption,
  deleteOption,
} from "../controllers/optionController.js";

import { getAdminChakras, updateChakra } from "../controllers/chakraController.js";
import { getAdminNadis, updateNadi } from "../controllers/nadiController.js";

import {
  getAdminRemedies,
  createRemedy,
  updateRemedy,
  deleteRemedy,
} from "../controllers/remedyController.js";

import {
  getAdminMantras,
  createMantra,
  updateMantra,
  deleteMantra,
} from "../controllers/mantraController.js";

import {
  getAdminContentBlocks,
  updateContentBlock,
} from "../controllers/contentController.js";

import { getAnalytics, getResultHistory } from "../controllers/analyticsController.js";

import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from "../controllers/adminUserController.js";

import {
  getAdminTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "../controllers/templateController.js";

const router = express.Router();

router.post("/login", loginAdmin);
router.post("/forgot-password", forgotAdminPassword);
router.post("/verify-otp", verifyAdminResetOtp);
router.post("/reset-password", resetAdminPassword);

router.use(protectAdmin);
router.get("/me", getAdminProfile);

router.get("/analytics", getAnalytics);
router.get("/results", getResultHistory);

router.get("/questions", getAdminQuestions);
router.post("/questions", requireRole("superAdmin"), createQuestion);
router.put("/questions/reorder", requireRole("superAdmin"), reorderQuestions);
router.put("/questions/:id", requireRole("superAdmin"), updateQuestion);
router.delete("/questions/:id", requireRole("superAdmin"), deleteQuestion);

router.get("/options", getAdminOptions);
router.post("/options", requireRole("superAdmin"), createOption);
router.put("/options/:id", requireRole("superAdmin"), updateOption);
router.delete("/options/:id", requireRole("superAdmin"), deleteOption);

router.get("/chakras", getAdminChakras);
router.put("/chakras/:id", requireRole("superAdmin"), updateChakra);

router.get("/nadis", getAdminNadis);
router.put("/nadis/:id", requireRole("superAdmin"), updateNadi);

router.get("/remedies", getAdminRemedies);
router.post("/remedies", createRemedy);
router.put("/remedies/:id", updateRemedy);
router.delete("/remedies/:id", requireRole("superAdmin"), deleteRemedy);

router.get("/mantras", getAdminMantras);
router.post("/mantras", createMantra);
router.put("/mantras/:id", updateMantra);
router.delete("/mantras/:id", requireRole("superAdmin"), deleteMantra);

router.get("/content", getAdminContentBlocks);
router.put("/content/:key", updateContentBlock);

router.get("/users", requireRole("superAdmin"), getAdminUsers);
router.post("/users", requireRole("superAdmin"), createAdminUser);
router.put("/users/:id", requireRole("superAdmin"), updateAdminUser);
router.delete("/users/:id", requireRole("superAdmin"), deleteAdminUser);

router.get("/templates", getAdminTemplates);
router.post("/templates", requireRole("superAdmin"), createTemplate);
router.put("/templates/:id", requireRole("superAdmin"), updateTemplate);
router.delete("/templates/:id", requireRole("superAdmin"), deleteTemplate);

export default router;