import {
  mysqlTable,
  int,
  text,
  varchar,
  timestamp,
} from "drizzle-orm/mysql-core";

export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),
});