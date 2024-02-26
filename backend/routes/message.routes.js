import express from "express";
import {
  getMessages,
  sendMessage,
  msg_sentiment,
} from "../controllers/message.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.post("/msg_sentiment/:id", protectRoute, msg_sentiment);

export default router;
