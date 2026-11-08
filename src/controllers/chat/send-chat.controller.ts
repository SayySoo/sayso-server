import { NextFunction, Request, Response } from "express";
import { chatRequestSchema } from "../../validators/chat/chat.validator";
import * as chatService from "../../services/chat/chat.service"
export async function sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const {query} = chatRequestSchema.parse(req.body);
      const userId = req.user!.sub;

      const answer = await chatService.askChatbot(userId, query);

      res.status(200).json({
        success:  true,
        answer
      });
    } catch (error) {
      next(error);
    }
}


