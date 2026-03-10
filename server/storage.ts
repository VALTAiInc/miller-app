import { db } from "./db";
import { 
  conversations, messages, jobLogEntries,
  type Conversation, type InsertConversation,
  type Message, type InsertMessage,
  type JobLogEntry, type InsertJobLogEntry
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getConversation(id: number): Promise<Conversation | undefined>;
  getAllConversations(): Promise<Conversation[]>;
  createConversation(title: string): Promise<Conversation>;
  deleteConversation(id: number): Promise<void>;
  getMessagesByConversation(conversationId: number): Promise<Message[]>;
  createMessage(conversationId: number, role: string, content: string): Promise<Message>;

  getAllJobLogEntries(): Promise<JobLogEntry[]>;
  createJobLogEntry(entry: InsertJobLogEntry): Promise<JobLogEntry>;
  deleteJobLogEntry(id: number): Promise<void>;
  clearJobLogEntries(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getConversation(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getAllConversations(): Promise<Conversation[]> {
    return db.select().from(conversations).orderBy(desc(conversations.createdAt));
  }

  async createConversation(title: string): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values({ title }).returning();
    return conversation;
  }

  async deleteConversation(id: number): Promise<void> {
    await db.delete(messages).where(eq(messages.conversationId, id));
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async getMessagesByConversation(conversationId: number): Promise<Message[]> {
    return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.createdAt);
  }

  async createMessage(conversationId: number, role: string, content: string): Promise<Message> {
    const [message] = await db.insert(messages).values({ conversationId, role, content }).returning();
    return message;
  }

  async getAllJobLogEntries(): Promise<JobLogEntry[]> {
    return db.select().from(jobLogEntries).orderBy(desc(jobLogEntries.createdAt));
  }

  async createJobLogEntry(entry: InsertJobLogEntry): Promise<JobLogEntry> {
    const [logEntry] = await db.insert(jobLogEntries).values(entry).returning();
    return logEntry;
  }

  async deleteJobLogEntry(id: number): Promise<void> {
    await db.delete(jobLogEntries).where(eq(jobLogEntries.id, id));
  }

  async clearJobLogEntries(): Promise<void> {
    await db.delete(jobLogEntries);
  }
}

export const storage = new DatabaseStorage();
