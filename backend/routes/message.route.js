import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getUsersForSideBar } from "../controllers/message.controller.js";
import { getAllMessages } from "../controllers/message.controller.js";
import { sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSideBar);
router.get("/:id", protectRoute, getAllMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;