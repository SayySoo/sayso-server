import { Router } from "express";
import * as sendChatController from "../../controllers/chat/send-chat.controller";
import * as getChatHistoryController from "../../controllers/chat/get-chathistory.controller";
import { requireAuth } from "../../middlewares/requireAuth";


const router = Router();

// All chat routes require authentication
router.use(requireAuth);
router.post("/", sendChatController.sendMessage);
router.get("/history", getChatHistoryController.getChatHistory);

export default router;
