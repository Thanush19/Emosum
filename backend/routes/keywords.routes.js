import express from "express";
import { extractKeywords } from "../controllers/keywords.controller.js";
const router = express.Router();
router.post("/extract-keywords", extractKeywords);

export default router;
