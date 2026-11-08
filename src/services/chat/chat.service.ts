import { db } from "../../db/client";
import { chatMessages } from "../../db/schema/chatMessages";
import { eq, desc } from "drizzle-orm";
import { env } from "../../config/env";
import { ApiError } from "../../utils/ApiError";
import { logger } from "../../config/logger";

export async function askChatbot(userId: number, query: string) {
  // 1. Save the user's message to the DB
  await db.insert(chatMessages).values({
    userId,
    role: "user",
    content: query,
  });

  // 2. Call the Python RAG API
  try {
    const res = await fetch(`${env.RAG_API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      throw new Error(`RAG API responded with status ${res.status}`);
    }

    const data = await res.json();
    const answer = data.answer;

    // 3. Save the AI's response to the DB
    await db.insert(chatMessages).values({
      userId,
      role: "assistant",
      content: answer,
    });

    return answer;
  } catch (err) {
    logger.error({ err }, "Failed to communicate with RAG engine");
    throw ApiError.internal("The AI assistant is currently unavailable. Please try again later.");
  }
}

export async function getChatHistory(userId: number) {
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, userId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(50); 
}