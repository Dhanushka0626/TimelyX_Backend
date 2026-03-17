import express from "express";
import { sendMessage } from "../controllers/contactController.js";

const router = express.Router();

// Public route - no authentication required for contact form
router.post("/send-message", sendMessage);

export default router;
