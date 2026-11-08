import { NextFunction, Request, Response } from "express";
import * as chatService from "../../services/chat/chat.service"

export async function getChatHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.sub;
      const history = await chatService.getChatHistory(userId);

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      next(error);
    }
}